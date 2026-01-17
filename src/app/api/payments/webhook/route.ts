import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    // Get payment details from Mollie
    const mollieClient = getMollieClient();
    const payment = await mollieClient.payments.get(paymentId);
    const metadata = payment.metadata as {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      companyName?: string;
      paymentType: string;
      quoteId?: string;
      packageId?: string;
      maintenancePlanId?: string;
    };

    console.log(`Payment ${paymentId} status: ${payment.status}`);

    // Handle different payment statuses
    if (payment.status === "paid") {
      // Payment successful!
      console.log(`Payment ${paymentId} is paid!`);
      
      // Send confirmation email to customer
      if (metadata.customerEmail) {
        await sendPaymentConfirmation(
          metadata.customerEmail,
          metadata.customerName,
          payment.amount.value,
          metadata.paymentType,
          paymentId
        );
      }

      // Send notification to RoTech
      await sendPaymentNotification(
        metadata.customerName,
        metadata.customerEmail,
        payment.amount.value,
        metadata.paymentType,
        metadata.companyName
      );

      // TODO: If this is a deposit, create the subscription for later
      // TODO: If this is final payment, activate the subscription

    } else if (payment.status === "failed" || payment.status === "canceled" || payment.status === "expired") {
      console.log(`Payment ${paymentId} failed/canceled/expired`);
      
      // Optionally send failure notification
      if (metadata.customerEmail) {
        await sendPaymentFailedEmail(
          metadata.customerEmail,
          metadata.customerName,
          payment.status
        );
      }
    }

    // Always return 200 to acknowledge webhook
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 to prevent retries for unrecoverable errors
    return NextResponse.json({ received: true, error: "Processing error" });
  }
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
      subject: `Betaling ontvangen - Ro-Tech Development`,
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
              <strong>Het Ro-Tech Development Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              Ro-Tech Development (BVR Services)<br>
              +31 6 57 23 55 74 | contact@ro-techdevelopment.dev
            </p>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
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
    console.error("Failed to send payment notification:", error);
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
      subject: `Betaling niet gelukt - Ro-Tech Development`,
      html: `
        <p>Beste ${name},</p>
        <p>Helaas is uw betaling niet gelukt (status: ${status}).</p>
        <p>U kunt het opnieuw proberen via de link in uw offerte, of neem contact met ons op als u hulp nodig heeft.</p>
        <p>Met vriendelijke groet,<br>Het Ro-Tech Development Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
  }
}
