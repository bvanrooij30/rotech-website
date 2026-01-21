import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { storeWorkOrder } from "@/lib/work-orders-store";

const resend = new Resend(process.env.RESEND_API_KEY);

const QuoteRequestSchema = z.object({
  packageId: z.string(),
  packageName: z.string(),
  features: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number(),
  })),
  totalAmount: z.number(),
  customer: z.object({
    name: z.string().min(1, "Naam is verplicht"),
    email: z.string().email("Ongeldig e-mailadres"),
    phone: z.string().min(1, "Telefoonnummer is verplicht"),
    company: z.string().optional(),
    address: z.string().min(1, "Adres is verplicht"),
    postalCode: z.string().min(1, "Postcode is verplicht"),
    city: z.string().min(1, "Plaats is verplicht"),
    kvkNumber: z.string().optional(),
  }),
  agreements: z.object({
    termsAccepted: z.boolean(),
    quoteAccepted: z.boolean(),
    cancellationAccepted: z.boolean(),
    privacyAccepted: z.boolean(),
    signature: z.string().min(1, "Handtekening is verplicht"),
    signatureDate: z.string(),
  }),
  cancellationFee: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = QuoteRequestSchema.parse(body);
    
    // Check all agreements
    if (
      !validated.agreements.termsAccepted ||
      !validated.agreements.quoteAccepted ||
      !validated.agreements.cancellationAccepted ||
      !validated.agreements.privacyAccepted
    ) {
      return NextResponse.json(
        { error: "Alle akkoordverklaringen zijn verplicht" },
        { status: 400 }
      );
    }
    
    // Store work order for Admin Portal sync
    let storedOrder;
    try {
      storedOrder = await storeWorkOrder({
        customerName: validated.customer.name,
        customerEmail: validated.customer.email,
        customerPhone: validated.customer.phone,
        companyName: validated.customer.company,
        address: validated.customer.address,
        postalCode: validated.customer.postalCode,
        city: validated.customer.city,
        kvkNumber: validated.customer.kvkNumber,
        packageId: validated.packageId,
        packageName: validated.packageName,
        features: validated.features,
        totalAmount: validated.totalAmount,
        cancellationFee: validated.cancellationFee,
        termsAccepted: validated.agreements.termsAccepted,
        quoteAccepted: validated.agreements.quoteAccepted,
        cancellationAccepted: validated.agreements.cancellationAccepted,
        privacyAccepted: validated.agreements.privacyAccepted,
        signature: validated.agreements.signature,
        signatureDate: validated.agreements.signatureDate,
      });
    } catch (storeError) {
      console.error("Failed to store work order:", storeError);
    }
    
    // Use stored order number or generate one
    const quoteNumber = storedOrder?.orderNumber || `OFF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
    
    // Format features list
    const featuresList = validated.features
      .map(f => `• ${f.name}${f.quantity > 1 ? ` (${f.quantity}x)` : ""}`)
      .join("\n");
    
    // Format amount
    const formatPrice = (amount: number) => 
      new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
    
    // Send email to Ro-Tech
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
        to: process.env.CONTACT_EMAIL || "contact@ro-techdevelopment.dev",
        subject: `🎉 Nieuwe opdracht ontvangen - ${validated.customer.name} - ${formatPrice(validated.totalAmount)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 700px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Nieuwe Opdracht Ontvangen!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10B981;">
                <h2 style="margin: 0 0 10px 0; color: #1e293b;">Offerte ${quoteNumber}</h2>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #4F46E5;">
                  ${formatPrice(validated.totalAmount)} excl. BTW
                </p>
                <p style="margin: 5px 0 0 0; color: #64748b;">
                  ${formatPrice(validated.totalAmount * 1.21)} incl. BTW
                </p>
              </div>
              
              <h3 style="color: #1e293b; margin-bottom: 10px;">Klantgegevens</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Naam:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${validated.customer.name}</td>
                </tr>
                ${validated.customer.company ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Bedrijf:</td>
                  <td style="padding: 8px 0;">${validated.customer.company}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">E-mail:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${validated.customer.email}">${validated.customer.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Telefoon:</td>
                  <td style="padding: 8px 0;"><a href="tel:${validated.customer.phone}">${validated.customer.phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Adres:</td>
                  <td style="padding: 8px 0;">${validated.customer.address}<br>${validated.customer.postalCode} ${validated.customer.city}</td>
                </tr>
                ${validated.customer.kvkNumber ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">KvK:</td>
                  <td style="padding: 8px 0;">${validated.customer.kvkNumber}</td>
                </tr>
                ` : ""}
              </table>
              
              <h3 style="color: #1e293b; margin-bottom: 10px;">Pakket</h3>
              <p style="background: #e0e7ff; padding: 10px 15px; border-radius: 8px; display: inline-block; color: #4338ca; font-weight: bold;">
                ${validated.packageName}
              </p>
              
              <h3 style="color: #1e293b; margin: 20px 0 10px 0;">Geselecteerde functies</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${featuresList}</pre>
              </div>
              
              <h3 style="color: #1e293b; margin: 20px 0 10px 0;">Akkoorden</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 8px 0;">✅ Algemene voorwaarden geaccepteerd</li>
                <li style="padding: 8px 0;">✅ Offerte geaccepteerd</li>
                <li style="padding: 8px 0;">✅ Annuleringsbeleid begrepen</li>
                <li style="padding: 8px 0;">✅ Privacybeleid geaccepteerd</li>
              </ul>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Digitale handtekening:</strong> ${validated.agreements.signature}<br>
                  <strong>Datum:</strong> ${validated.agreements.signatureDate}
                </p>
              </div>
              
              <div style="background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; color: #991b1b;">
                  <strong>Annuleringskosten (voor start):</strong> ${formatPrice(validated.cancellationFee)}
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="text-align: center; color: #64748b; font-size: 14px;">
                <strong>Volgende stappen:</strong><br>
                1. Neem contact op met de klant<br>
                2. Plan kennismakingsgesprek<br>
                3. Stuur factuur voor aanbetaling (50%)
              </p>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin notification:", emailError);
    }
    
    // Send confirmation to customer
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev",
        to: validated.customer.email,
        subject: `Opdracht bevestiging - ${quoteNumber} - Ro-Tech Development`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Opdracht Bevestigd ✓</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px;">
              <p>Beste ${validated.customer.name},</p>
              
              <p>Bedankt voor uw opdracht! Wij hebben uw aanvraag succesvol ontvangen.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <p style="margin: 0;"><strong>Offertenummer:</strong> ${quoteNumber}</p>
                <p style="margin: 10px 0 0 0;"><strong>Pakket:</strong> ${validated.packageName}</p>
                <p style="margin: 10px 0 0 0;"><strong>Totaalbedrag:</strong> ${formatPrice(validated.totalAmount)} excl. BTW</p>
              </div>
              
              <h3 style="color: #1e293b;">Geselecteerde functies</h3>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${featuresList}</pre>
              </div>
              
              <h3 style="color: #1e293b; margin-top: 20px;">Wat nu?</h3>
              <ol style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Wij nemen binnen 24 uur contact met u op</li>
                <li style="margin-bottom: 10px;">We plannen een kennismakingsgesprek om de details te bespreken</li>
                <li style="margin-bottom: 10px;">Na goedkeuring ontvangt u de factuur voor de aanbetaling (50%)</li>
                <li style="margin-bottom: 10px;">Wij starten met uw project!</li>
              </ol>
              
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
    } catch (emailError) {
      console.error("Failed to send customer confirmation:", emailError);
    }
    
    return NextResponse.json({
      success: true,
      quoteNumber,
      message: "Opdracht succesvol ontvangen",
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatie mislukt", details: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Quote request error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het verwerken van uw aanvraag" },
      { status: 500 }
    );
  }
}
