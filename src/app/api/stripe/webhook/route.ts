import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripeClient, isStripeConfigured, fromStripeAmount } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * Handle all Stripe webhook events
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      console.error("Stripe not configured");
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = getStripeClient();
    let event: Stripe.Event;

    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn("STRIPE_WEBHOOK_SECRET not set - parsing event without verification");
        event = JSON.parse(body) as Stripe.Event;
      } else {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      }
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      // Checkout completed
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session, stripe);
        break;
      }

      // Subscription events
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, stripe);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleTrialEnding(subscription, stripe);
        break;
      }

      // Invoice events
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice, stripe);
        break;
      }

      case "invoice.finalized": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFinalized(invoice);
        break;
      }

      // Payment events
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Handle checkout.session.completed
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session, stripe: Stripe) {
  console.log(`[Checkout Complete] Session: ${session.id}, Mode: ${session.mode}`);

  const metadata = session.metadata || {};
  const customerEmail = session.customer_email || session.customer_details?.email;

  if (!customerEmail) {
    console.error("[Checkout Complete] No customer email found");
    return;
  }

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email: customerEmail },
  });

  if (!user) {
    // Create user from checkout
    user = await prisma.user.create({
      data: {
        email: customerEmail,
        name: metadata.customer_name || session.customer_details?.name || "Nieuwe Klant",
        password: "", // They need to set password via portal
        companyName: metadata.company_name || null,
      },
    });
    console.log(`[Checkout Complete] Created user: ${user.id}`);
  }

  if (session.mode === "subscription" && session.subscription) {
    // Handle subscription checkout
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Check if this is an automation subscription
    if (metadata.type === "automation") {
      await handleAutomationSubscription(session, subscription, user.id);
    } else {
      await handleSubscriptionUpdate(subscription, stripe, user.id);
    }
  } else if (session.mode === "payment") {
    // Handle one-time payment
    await createPaymentRecord(session, user.id);
  }
}

/**
 * Handle automation subscription creation
 */
async function handleAutomationSubscription(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
  userId: string
) {
  const metadata = session.metadata || {};
  const intakeId = metadata.intake_id;
  
  console.log(`[Automation Subscription] Creating for intake: ${intakeId}, user: ${userId}`);

  // Get period dates
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  
  const currentPeriodStart = periodStart ? new Date(periodStart * 1000) : new Date();
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Get price details
  const priceItem = subscription.items.data[0];
  const price = priceItem?.price;
  const amount = price?.unit_amount ? price.unit_amount / 100 : 0;
  const interval = price?.recurring?.interval || "month";

  // Create automation subscription
  const automationSub = await prisma.automationSubscription.create({
    data: {
      userId,
      planType: metadata.plan_id || "starter",
      planName: metadata.plan_name || "Automation Starter",
      monthlyPrice: amount,
      billingPeriod: interval === "year" ? "yearly" : "monthly",
      maxWorkflows: parseInt(metadata.max_workflows || "3", 10),
      maxExecutions: parseInt(metadata.max_executions || "5000", 10),
      supportHoursIncl: parseFloat(metadata.support_hours || "1"),
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: "active",
      currentPeriodStart,
      currentPeriodEnd,
    },
  });

  console.log(`[Automation Subscription] Created: ${automationSub.id}`);

  // Update intake record if exists
  if (intakeId) {
    try {
      await prisma.automationIntake.update({
        where: { id: intakeId },
        data: {
          subscriptionId: automationSub.id,
          paymentStatus: "paid",
          paidAt: new Date(),
          status: "approved",
        },
      });
      console.log(`[Automation Subscription] Updated intake: ${intakeId}`);
    } catch (err) {
      console.error(`[Automation Subscription] Failed to update intake: ${intakeId}`, err);
    }
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  stripe: Stripe,
  userId?: string
) {
  console.log(`[Subscription Update] ID: ${subscription.id}, Status: ${subscription.status}`);

  const metadata = subscription.metadata || {};
  let customerId = subscription.customer as string;

  // Get customer email if userId not provided
  if (!userId) {
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
    if (customer.email) {
      const user = await prisma.user.findUnique({ where: { email: customer.email } });
      userId = user?.id;
    }
  }

  if (!userId) {
    console.error("[Subscription Update] Could not find user");
    return;
  }

  // Get price details
  const priceItem = subscription.items.data[0];
  const price = priceItem?.price;
  const amount = price?.unit_amount ? fromStripeAmount(price.unit_amount) : 0;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    unpaid: "past_due",
    canceled: "cancelled",
    incomplete: "pending",
    incomplete_expired: "cancelled",
    trialing: "trialing",
    paused: "paused",
  };

  const dbStatus = statusMap[subscription.status] || "active";

  // Get period dates - handle both old and new Stripe API versions
  const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  const cancelAtEnd = (subscription as unknown as { cancel_at_period_end?: boolean }).cancel_at_period_end ?? false;
  
  const currentPeriodStart = periodStart ? new Date(periodStart * 1000) : new Date();
  const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId,
      planType: metadata.plan_id || "basis",
      planName: metadata.plan_name || "Onderhoudspakket",
      monthlyPrice: amount,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: price?.id || null,
      status: dbStatus,
      hoursIncluded: parseInt(metadata.hours_included || "1", 10),
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtEnd,
    },
    update: {
      status: dbStatus,
      monthlyPrice: amount,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: cancelAtEnd,
      hoursUsed: 0, // Reset hours on new period
    },
  });

  console.log(`[Subscription Update] Saved subscription for user ${userId}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log(`[Subscription Cancelled] ID: ${subscription.id}`);

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
  });
}

/**
 * Handle trial ending notification
 */
async function handleTrialEnding(subscription: Stripe.Subscription, stripe: Stripe) {
  console.log(`[Trial Ending] ID: ${subscription.id}`);
  
  // Could send email notification here
  const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
  console.log(`[Trial Ending] Customer: ${customer.email}, ends in 3 days`);
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Invoice Paid] ID: ${invoice.id}, Amount: ${invoice.amount_paid}`);

  if (!invoice.customer_email) return;

  const user = await prisma.user.findUnique({
    where: { email: invoice.customer_email },
  });

  if (!user) return;

  // Get tax from invoice - handle different API versions
  const invoiceTax = (invoice as unknown as { tax?: number }).tax || 0;
  
  // Create invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: user.id,
      invoiceNumber: invoice.number || `RT-INV-${Date.now()}`,
      stripeInvoiceId: invoice.id,
      amount: fromStripeAmount(invoice.amount_paid),
      tax: fromStripeAmount(invoiceTax),
      status: "paid",
      paidAt: new Date(),
      pdfUrl: invoice.invoice_pdf || null,
    },
    update: {
      status: "paid",
      paidAt: new Date(),
      pdfUrl: invoice.invoice_pdf || null,
    },
  });

  // Reset hours used on subscription renewal
  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { hoursUsed: 0 },
    });
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, _stripe: Stripe) {
  console.log(`[Invoice Payment Failed] ID: ${invoice.id}`);

  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: "past_due" },
    });
  }

  // Could send notification email here
}

/**
 * Handle invoice finalized (created)
 */
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  console.log(`[Invoice Finalized] ID: ${invoice.id}`);

  if (!invoice.customer_email) return;

  const user = await prisma.user.findUnique({
    where: { email: invoice.customer_email },
  });

  if (!user) return;

  // Handle different Stripe API versions
  const invoiceTax = (invoice as unknown as { tax?: number }).tax || 0;
  const dueDate = (invoice as unknown as { due_date?: number }).due_date;

  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    create: {
      userId: user.id,
      invoiceNumber: invoice.number || `RT-INV-${Date.now()}`,
      stripeInvoiceId: invoice.id,
      amount: fromStripeAmount(invoice.amount_due),
      tax: fromStripeAmount(invoiceTax),
      status: "open",
      dueDate: dueDate ? new Date(dueDate * 1000) : null,
      pdfUrl: invoice.invoice_pdf || null,
    },
    update: {
      amount: fromStripeAmount(invoice.amount_due),
      status: "open",
      pdfUrl: invoice.invoice_pdf || null,
    },
  });
}

/**
 * Handle successful payment intent
 */
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Success] ID: ${paymentIntent.id}, Amount: ${paymentIntent.amount}`);
  // Additional payment tracking could be added here
}

/**
 * Handle failed payment intent
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment Failed] ID: ${paymentIntent.id}`);
  // Could send notification email here
}

/**
 * Create payment record for one-time payments
 */
async function createPaymentRecord(session: Stripe.Checkout.Session, userId: string) {
  const metadata = session.metadata || {};
  
  console.log(`[Payment Record] Creating for session ${session.id}`);

  // Could create a separate payments table record here
  // For now, we'll create an invoice record
  await prisma.invoice.create({
    data: {
      userId,
      invoiceNumber: `RT-PAY-${Date.now()}`,
      stripeInvoiceId: session.id, // Using session ID as reference
      amount: fromStripeAmount(session.amount_total || 0),
      tax: fromStripeAmount(
        (session.total_details?.amount_tax || 0)
      ),
      status: "paid",
      paidAt: new Date(),
      description: metadata.package_name 
        ? `${metadata.package_name} - ${metadata.payment_type || "Betaling"}`
        : "Eenmalige betaling",
    },
  });
}
