import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, toStripeAmount } from "@/lib/stripe";

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
    
    const {
      // Customer info
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      
      // Payment details
      amount,
      description,
      paymentType, // "deposit" | "final" | "subscription"
      
      // Reference IDs
      quoteId,
      packageId,
      maintenancePlanId,
      
      // Redirect URLs
      successUrl,
      cancelUrl,
    } = body;

    // Validate required fields
    if (!customerEmail || !amount || !description) {
      return NextResponse.json(
        { error: "Missende verplichte velden" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal", "bancontact"],
      mode: "payment",
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
        customerName,
        customerEmail,
        customerPhone: customerPhone || "",
        companyName: companyName || "",
        paymentType,
        quoteId: quoteId || "",
        packageId: packageId || "",
        maintenancePlanId: maintenancePlanId || "",
      },
      success_url: successUrl || `${siteUrl}/betaling/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${siteUrl}/betaling/geannuleerd`,
      locale: "nl",
      // Enable automatic tax calculation if configured
      // automatic_tax: { enabled: true },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: "auto",
      // Phone number collection
      phone_number_collection: {
        enabled: true,
      },
    });

    // Return checkout URL for redirect
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url,
    });
    
  } catch (error) {
    console.error("Stripe payment error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de betaling" },
      { status: 500 }
    );
  }
}
