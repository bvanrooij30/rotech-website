import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient, toStripeAmount } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import type Stripe from "stripe";

// Zod schema for payment creation
const PaymentSchema = z.object({
  // Customer info
  customerName: z.string().min(2).max(100).optional(),
  customerEmail: z.string().email("Ongeldig e-mailadres"),
  customerPhone: z.string().optional(),
  companyName: z.string().max(100).optional(),
  
  // Payment details
  amount: z.number().positive("Bedrag moet positief zijn").max(100000, "Bedrag te hoog"),
  description: z.string().min(3, "Beschrijving te kort").max(500),
  paymentType: z.enum(["deposit", "final", "subscription", "one-time"]).optional(),
  
  // Reference IDs
  quoteId: z.string().optional(),
  packageId: z.string().optional(),
  maintenancePlanId: z.string().optional(),
  
  // Redirect URLs
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Betalingen zijn momenteel niet beschikbaar" },
        { status: 503 }
      );
    }

    const stripe = getStripeClient();
    const body = await request.json();
    
    // Validate with Zod
    const validationResult = PaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validatie mislukt", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      amount,
      description,
      paymentType,
      quoteId,
      packageId,
      maintenancePlanId,
      successUrl,
      cancelUrl,
    } = validationResult.data;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";

    // Create Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      payment_method_types: ["card", "ideal", "bancontact"],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: description,
              description: `${paymentType === "deposit" ? "Aanbetaling" : paymentType === "final" ? "Eindbetaling" : "Betaling"} voor ${description}`,
            },
            unit_amount: toStripeAmount(amount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        customerName: customerName || "",
        customerEmail,
        customerPhone: customerPhone || "",
        companyName: companyName || "",
        paymentType: paymentType || "",
        quoteId: quoteId || "",
        packageId: packageId || "",
        maintenancePlanId: maintenancePlanId || "",
      },
      success_url: successUrl || `${siteUrl}/betaling/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${siteUrl}/betaling/geannuleerd`,
      locale: "nl",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Return checkout URL for redirect
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
    
  } catch (error) {
    logger.error("Stripe payment error", "Payments", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de betaling" },
      { status: 500 }
    );
  }
}
