import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, fromStripeAmount } from "@/lib/stripe";
import { Resend } from "resend";
import { storePayment } from "@/lib/payments-store";
import { getPackageById, getMaintenancePlanById } from "@/data/packages";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      logger.error("Missing Stripe signature", "PaymentWebhook");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const stripe = getStripeClient();
    let event: Stripe.Event;

    // Verify webhook signature
    try {
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        logger.warn("STRIPE_WEBHOOK_SECRET not set - skipping signature verification", "PaymentWebhook");
        event = JSON.parse(body) as Stripe.Event;
      } else {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      }
    } catch (err) {
      logger.error("Webhook signature verification failed", "PaymentWebhook", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    logger.info(`Received Stripe event: ${event.type}`, "PaymentWebhook");

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.payment_status === "paid") {
        await handleSuccessfulPayment(session);
      }
    }

    // Handle payment_intent.succeeded (for recurring payments)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      logger.info(`PaymentIntent ${paymentIntent.id} succeeded`, "PaymentWebhook");
    }

    // Handle payment_intent.payment_failed
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;
      
      if (metadata.customerEmail) {
        await sendPaymentFailedEmail(
          metadata.customerEmail,
          metadata.customerName || "Klant",
          "failed"
        );
      }
    }

    // Handle checkout.session.expired
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      logger.info(`Checkout session ${session.id} expired`, "PaymentWebhook");
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ received: true });
    
  } catch (error) {
    logger.error("Webhook error", "PaymentWebhook", error);
    // Still return 200 to prevent retries for unrecoverable errors
    return NextResponse.json({ received: true, error: "Processing error" });
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const paymentId = session.payment_intent as string;
  
  logger.info(`Payment ${paymentId} is paid!`, "PaymentWebhook");
  
  // Get package and plan names for invoice description
  const packageInfo = metadata.packageId ? getPackageById(metadata.packageId) : null;
  const planInfo = metadata.maintenancePlanId ? getMaintenancePlanById(metadata.maintenancePlanId) : null;
  
  // Store payment for Admin Portal sync
  try {
    await storePayment({
      stripePaymentId: paymentId,
      stripeSessionId: session.id,
      customerName: metadata.customerName || "",
      customerEmail: metadata.customerEmail || session.customer_email || "",
      customerPhone: metadata.customerPhone || session.customer_details?.phone || "",
      companyName: metadata.companyName || undefined,
      stripeCustomerId: session.customer as string | undefined,
      amount: fromStripeAmount(session.amount_total || 0),
      currency: session.currency?.toUpperCase() || "EUR",
      description: session.line_items?.data?.[0]?.description || `Betaling ${metadata.paymentType}`,
      paymentType: (metadata.paymentType as "deposit" | "final" | "subscription") || "other",
      packageId: metadata.packageId || undefined,
      packageName: packageInfo?.name,
      maintenancePlanId: metadata.maintenancePlanId || undefined,
      maintenancePlanName: planInfo?.name,
      status: "paid",
      paidAt: new Date().toISOString(),
    });
    logger.info(`Payment ${paymentId} stored for Admin Portal sync`, "PaymentWebhook");
  } catch (storeError) {
    logger.error("Failed to store payment", "PaymentWebhook", storeError);
  }
  
  // Send confirmation email to customer
  const customerEmail = metadata.customerEmail || session.customer_email;
  if (customerEmail) {
    await sendPaymentConfirmation(
      customerEmail,
      metadata.customerName || "Klant",
      fromStripeAmount(session.amount_total || 0).toFixed(2),
      metadata.paymentType || "betaling",
      paymentId
    );
  }

  // Send notification to RoTech
  await sendPaymentNotification(
    metadata.customerName || "Onbekend",
    customerEmail || "Geen email",
    fromStripeAmount(session.amount_total || 0).toFixed(2),
    metadata.paymentType || "betaling",
    metadata.companyName || undefined
  );
}

// Email helper functions
async function sendPaymentConfirmation(
  email: string,
  name: string,
  amount: string,
  paymentType: string,
  paymentId: string
) {
  const paymentTypeText = paymentType === "deposit" ? "aanbetaling" : 
                          paymentType === "final" ? "eindbetaling" : "betaling";
  
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: email,
      subject: `Betaling ontvangen - RoTech Development`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Betaling Ontvangen ✓</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Beste ${name},</p>
            
            <p>Bedankt voor uw ${paymentTypeText}! Wij hebben uw betaling succesvol ontvangen.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 0;"><strong>Bedrag:</strong> €${amount}</p>
              <p style="margin: 10px 0 0 0;"><strong>Type:</strong> ${paymentTypeText}</p>
              <p style="margin: 10px 0 0 0;"><strong>Referentie:</strong> ${paymentId}</p>
            </div>
            
            ${paymentType === "deposit" ? `
              <p>We gaan nu aan de slag met uw project! U hoort binnenkort van ons over de voortgang.</p>
            ` : paymentType === "final" ? `
              <p>Uw project is nu volledig betaald. Uw onderhoudsabonnement zal automatisch starten na de gratis supportperiode.</p>
            ` : ""}
            
            <p>Heeft u vragen? Neem gerust contact met ons op.</p>
            
            <p style="margin-top: 30px;">
              Met vriendelijke groet,<br>
              <strong>Het RoTech Development Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              RoTech Development (BVR Services)<br>
              +31 6 57 23 55 74 | contact@ro-techdevelopment.dev
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error("Failed to send payment confirmation email", "PaymentWebhook", error);
  }
}

async function sendPaymentNotification(
  customerName: string,
  customerEmail: string,
  amount: string,
  paymentType: string,
  companyName?: string
) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: process.env.CONTACT_EMAIL || "contact@ro-techdevelopment.dev",
      subject: `💰 Nieuwe betaling ontvangen - €${amount}`,
      html: `
        <h2>Nieuwe betaling ontvangen!</h2>
        <p><strong>Klant:</strong> ${customerName}</p>
        ${companyName ? `<p><strong>Bedrijf:</strong> ${companyName}</p>` : ""}
        <p><strong>Email:</strong> ${customerEmail}</p>
        <p><strong>Bedrag:</strong> €${amount}</p>
        <p><strong>Type:</strong> ${paymentType}</p>
        <p><strong>Tijd:</strong> ${new Date().toLocaleString("nl-NL")}</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send payment notification", "PaymentWebhook", error);
  }
}

async function sendPaymentFailedEmail(
  email: string,
  name: string,
  status: string
) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
      to: email,
      subject: `Betaling niet gelukt - RoTech Development`,
      html: `
        <p>Beste ${name},</p>
        <p>Helaas is uw betaling niet gelukt (status: ${status}).</p>
        <p>U kunt het opnieuw proberen via de link in uw offerte, of neem contact met ons op als u hulp nodig heeft.</p>
        <p>Met vriendelijke groet,<br>Het RoTech Development Team</p>
      `,
    });
  } catch (error) {
    logger.error("Failed to send payment failed email", "PaymentWebhook", error);
  }
}
