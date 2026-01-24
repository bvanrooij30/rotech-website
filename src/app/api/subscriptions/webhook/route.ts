import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { Resend } from "resend";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// TYPE DEFINITIONS
// ============================================

// Helper type for subscription data extraction
interface SubscriptionData {
  id: string;
  status: Stripe.Subscription.Status;
  customer: string;
  metadata: Stripe.Metadata;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  trial_end: number | null;
  items: { data: Array<{ price?: { id?: string; unit_amount?: number | null } }> };
}

/**
 * Extract subscription data from Stripe subscription object
 * This handles the type casting safely
 */
function extractSubscriptionData(sub: Stripe.Subscription): SubscriptionData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subAny = sub as any;
  return {
    id: sub.id,
    status: sub.status,
    customer: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    metadata: sub.metadata,
    current_period_start: subAny.current_period_start ?? Math.floor(Date.now() / 1000),
    current_period_end: subAny.current_period_end ?? Math.floor(Date.now() / 1000) + 2592000,
    cancel_at_period_end: subAny.cancel_at_period_end ?? false,
    canceled_at: subAny.canceled_at ?? null,
    trial_end: subAny.trial_end ?? null,
    items: sub.items,
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = getStripeClient();
    let event: Stripe.Event;

    // Verify webhook signature
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn("STRIPE_WEBHOOK_SECRET not set - skipping signature verification");
        event = JSON.parse(body) as Stripe.Event;
      } else {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`Received Stripe subscription event: ${event.type}`);

    // Handle subscription events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only handle subscription checkouts
        if (session.mode === "subscription" && session.subscription) {
          console.log(`Checkout completed for subscription session: ${session.id}`);
          await handleCheckoutCompleted(session, stripe);
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} created`);
        await syncSubscriptionToDatabase(subscription, stripe);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
        
        // Sync to database
        await syncSubscriptionToDatabase(subscription, stripe);
        
        // Handle status changes
        if (subscription.status === "active") {
          await sendSubscriptionActiveEmail(subscription);
        } else if (subscription.status === "past_due") {
          await sendPaymentFailedNotification(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} cancelled/deleted`);
        
        // Update database
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        });
        
        await sendSubscriptionCancelledEmail(subscription);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} trial ending soon`);
        await sendTrialEndingEmail(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        if (invoice.subscription) {
          console.log(`Invoice paid for subscription ${invoice.subscription}`);
          await handleInvoicePaid(invoice, stripe);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
        console.log(`Invoice payment failed: ${invoice.id}`);
        
        // Update subscription status
        if (invoice.subscription) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: invoice.subscription as string },
            data: { status: "past_due" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// ============================================
// DATABASE SYNC FUNCTIONS
// ============================================

/**
 * Handle completed checkout session - create user if needed and link subscription
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
) {
  try {
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.metadata?.customerName || session.customer_details?.name || "";
    const customerPhone = session.metadata?.customerPhone || session.customer_details?.phone || "";
    const companyName = session.metadata?.companyName || "";
    const planId = session.metadata?.planId || "";
    
    if (!customerEmail) {
      console.error("No customer email in checkout session");
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      // Create new user (they will need to set a password later)
      const bcrypt = await import("bcryptjs");
      const tempPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: customerName,
          phone: customerPhone || null,
          companyName: companyName || null,
          password: tempPassword, // Temporary, user needs to reset
          emailVerified: new Date(), // Mark as verified since they paid
        },
      });
      
      console.log(`Created new user ${user.id} for subscription checkout`);
      
      // Send welcome email with password reset link
      await sendWelcomeEmailWithPasswordReset(user.email, user.name);
    }

    // Get the subscription from Stripe
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      
      // Sync subscription to database
      await syncSubscriptionToDatabase(subscription, stripe, user.id);
    }
  } catch (error) {
    console.error("Error handling checkout completed:", error);
  }
}

/**
 * Sync a Stripe subscription to the database
 */
async function syncSubscriptionToDatabase(
  subscriptionInput: Stripe.Subscription,
  stripe: Stripe,
  overrideUserId?: string
) {
  try {
    // Extract subscription data with safe type handling
    const subscription = extractSubscriptionData(subscriptionInput);
    
    const planId = subscription.metadata.planId || "";
    const planName = subscription.metadata.planName || "Onderhoud";
    const hoursIncluded = parseInt(subscription.metadata.hoursIncluded || "0", 10);
    
    // Get customer to find user
    const customer = await stripe.customers.retrieve(subscription.customer) as Stripe.Customer;
    
    let userId = overrideUserId;
    
    if (!userId && customer.email) {
      const user = await prisma.user.findUnique({
        where: { email: customer.email },
      });
      userId = user?.id;
    }
    
    if (!userId) {
      console.warn(`No user found for subscription ${subscription.id}`);
      return;
    }

    // Get price info
    const priceItem = subscription.items.data[0];
    const monthlyPrice = priceItem?.price?.unit_amount 
      ? priceItem.price.unit_amount / 100 
      : 0;
    
    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    const subscriptionData = {
      userId,
      planType: planId || "unknown",
      planName,
      monthlyPrice,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      stripePriceId: priceItem?.price?.id || null,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      hoursIncluded,
      cancelledAt: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000) 
        : null,
    };

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: subscriptionData,
      });
      console.log(`Updated subscription ${existingSubscription.id} in database`);
    } else {
      const newSub = await prisma.subscription.create({
        data: subscriptionData,
      });
      console.log(`Created subscription ${newSub.id} in database`);
    }
  } catch (error) {
    console.error("Error syncing subscription to database:", error);
  }
}

/**
 * Handle paid invoice - update subscription period and reset hours
 */
async function handleInvoicePaid(invoice: Stripe.Invoice & { subscription?: string | null }, stripe: Stripe) {
  try {
    if (!invoice.subscription) return;
    
    const subscriptionId = invoice.subscription as string;
    
    // Get the updated subscription from Stripe
    const subscriptionRaw = await stripe.subscriptions.retrieve(subscriptionId);
    const subscription = extractSubscriptionData(subscriptionRaw);
    
    // Update subscription in database
    const dbSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (dbSubscription) {
      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: "active",
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          hoursUsed: 0, // Reset hours for new period
        },
      });
      console.log(`Reset hours and updated period for subscription ${dbSubscription.id}`);
    }

    // Store invoice in database - safely access invoice properties
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoiceAny = invoice as any;
    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: {
        status: "paid",
        paidAt: new Date(),
        pdfUrl: invoiceAny.invoice_pdf || null,
      },
      create: {
        userId: dbSubscription?.userId || "",
        invoiceNumber: generateInvoiceNumber(),
        stripeInvoiceId: invoice.id,
        amount: (invoiceAny.amount_paid || 0) / 100,
        tax: (invoiceAny.tax || 0) / 100,
        status: "paid",
        paidAt: new Date(),
        pdfUrl: invoiceAny.invoice_pdf || null,
        description: `Onderhoud ${dbSubscription?.planName || ""}`,
      },
    });
  } catch (error) {
    console.error("Error handling paid invoice:", error);
  }
}

/**
 * Map Stripe subscription status to our status
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<Stripe.Subscription.Status, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "past_due",
    incomplete: "pending",
    incomplete_expired: "cancelled",
    trialing: "active",
    paused: "paused",
  };
  return statusMap[stripeStatus] || "unknown";
}

/**
 * Generate invoice number in RT-INV-YYYY-NNN format
 */
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `RT-INV-${year}-${random}`;
}

/**
 * Send welcome email with password reset link for new users
 */
async function sendWelcomeEmailWithPasswordReset(email: string, name: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: email,
      subject: "Welkom bij RoTech Development - Stel uw wachtwoord in",
      html: `
        <p>Beste ${name || "Klant"},</p>
        <p>Bedankt voor het afsluiten van een onderhoudsabonnement bij RoTech Development!</p>
        <p>Uw account is aangemaakt. Om toegang te krijgen tot uw klantenportaal, kunt u een wachtwoord instellen via onderstaande link:</p>
        <p><a href="${baseUrl}/portal/wachtwoord-vergeten?email=${encodeURIComponent(email)}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Wachtwoord instellen</a></p>
        <p>In het portaal kunt u:</p>
        <ul>
          <li>Uw abonnement beheren</li>
          <li>Facturen bekijken</li>
          <li>Support tickets aanmaken</li>
          <li>Werkzaamheden inzien</li>
        </ul>
        <p>Wij nemen binnenkort contact met u op om alles door te spreken.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS
// ============================================

// Email helper functions
async function sendSubscriptionActiveEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const subData = extractSubscriptionData(subscription);
    const customer = await stripe.customers.retrieve(subData.customer) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subData.metadata.planName || "Onderhoud";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Abonnement geactiveerd - RoTech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw onderhoudsabonnement (${planName}) is nu actief.</p>
        <p>U ontvangt maandelijks een factuur voor dit abonnement.</p>
        <p>Heeft u vragen? Neem gerust contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send subscription active email:", error);
  }
}

async function sendSubscriptionCancelledEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const subData = extractSubscriptionData(subscription);
    const customer = await stripe.customers.retrieve(subData.customer) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subData.metadata.planName || "Onderhoud";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Abonnement beëindigd - RoTech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw onderhoudsabonnement (${planName}) is beëindigd.</p>
        <p>Wilt u het abonnement opnieuw activeren? Neem contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send subscription cancelled email:", error);
  }
}

async function sendTrialEndingEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const subData = extractSubscriptionData(subscription);
    const customer = await stripe.customers.retrieve(subData.customer) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subData.metadata.planName || "Onderhoud";
    const trialEnd = subData.trial_end ? new Date(subData.trial_end * 1000).toLocaleDateString("nl-NL") : "binnenkort";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Gratis supportperiode eindigt binnenkort - RoTech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw gratis supportperiode eindigt op ${trialEnd}.</p>
        <p>Daarna start automatisch uw onderhoudsabonnement (${planName}).</p>
        <p>Wilt u wijzigingen aanbrengen? Neem contact met ons op voor ${trialEnd}.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send trial ending email:", error);
  }
}

async function sendPaymentFailedNotification(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const subData = extractSubscriptionData(subscription);
    const customer = await stripe.customers.retrieve(subData.customer) as Stripe.Customer;
    
    if (!customer.email) return;
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Betaling mislukt - RoTech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>De betaling voor uw onderhoudsabonnement is helaas niet gelukt.</p>
        <p>Controleer uw betaalgegevens en probeer het opnieuw.</p>
        <p>Neem bij vragen contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
    
    // Also notify RoTech
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: process.env.CONTACT_EMAIL || "contact@ro-techdevelopment.dev",
      subject: `⚠️ Abonnementsbetaling mislukt - ${customer.name || customer.email}`,
      html: `
        <h2>Betaling mislukt</h2>
        <p><strong>Klant:</strong> ${customer.name || "Onbekend"}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Subscription ID:</strong> ${subData.id}</p>
        <p><strong>Status:</strong> ${subData.status}</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment failed notification:", error);
  }
}
