import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

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
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} created`);
        // TODO: Store subscription in database
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
        
        // Handle status changes
        if (subscription.status === "active") {
          // Subscription is now active
          await sendSubscriptionActiveEmail(subscription);
        } else if (subscription.status === "past_due") {
          // Payment failed, subscription is past due
          await sendPaymentFailedNotification(subscription);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${subscription.id} cancelled/deleted`);
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
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as { subscription?: string; id: string };
        if (invoiceData.subscription) {
          console.log(`Invoice paid for subscription ${invoiceData.subscription}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Invoice payment failed: ${invoice.id}`);
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

// Email helper functions
async function sendSubscriptionActiveEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subscription.metadata.planName || "Onderhoud";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Abonnement geactiveerd - Ro-Tech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw onderhoudsabonnement (${planName}) is nu actief.</p>
        <p>U ontvangt maandelijks een factuur voor dit abonnement.</p>
        <p>Heeft u vragen? Neem gerust contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het Ro-Tech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send subscription active email:", error);
  }
}

async function sendSubscriptionCancelledEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subscription.metadata.planName || "Onderhoud";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Abonnement beëindigd - Ro-Tech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw onderhoudsabonnement (${planName}) is beëindigd.</p>
        <p>Wilt u het abonnement opnieuw activeren? Neem contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het Ro-Tech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send subscription cancelled email:", error);
  }
}

async function sendTrialEndingEmail(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    if (!customer.email) return;
    
    const planName = subscription.metadata.planName || "Onderhoud";
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toLocaleDateString("nl-NL") : "binnenkort";
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Gratis supportperiode eindigt binnenkort - Ro-Tech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>Uw gratis supportperiode eindigt op ${trialEnd}.</p>
        <p>Daarna start automatisch uw onderhoudsabonnement (${planName}).</p>
        <p>Wilt u wijzigingen aanbrengen? Neem contact met ons op voor ${trialEnd}.</p>
        <p>Met vriendelijke groet,<br>Het Ro-Tech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send trial ending email:", error);
  }
}

async function sendPaymentFailedNotification(subscription: Stripe.Subscription) {
  try {
    const stripe = getStripeClient();
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    
    if (!customer.email) return;
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: customer.email,
      subject: `Betaling mislukt - Ro-Tech Development`,
      html: `
        <p>Beste ${customer.name || "Klant"},</p>
        <p>De betaling voor uw onderhoudsabonnement is helaas niet gelukt.</p>
        <p>Controleer uw betaalgegevens en probeer het opnieuw.</p>
        <p>Neem bij vragen contact met ons op.</p>
        <p>Met vriendelijke groet,<br>Het Ro-Tech Development Team</p>
      `,
    });
    
    // Also notify Ro-Tech
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: process.env.CONTACT_EMAIL || "contact@ro-techdevelopment.dev",
      subject: `⚠️ Abonnementsbetaling mislukt - ${customer.name || customer.email}`,
      html: `
        <h2>Betaling mislukt</h2>
        <p><strong>Klant:</strong> ${customer.name || "Onbekend"}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Subscription ID:</strong> ${subscription.id}</p>
        <p><strong>Status:</strong> ${subscription.status}</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment failed notification:", error);
  }
}
