import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, toStripeAmount } from "@/lib/stripe";
import { getMaintenancePlanById, getYearlyPrice } from "@/data/packages";

/**
 * Create a Stripe Checkout Session for maintenance subscription
 * This allows direct checkout without needing an existing Stripe customer
 */
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
      planId,
      interval, // "monthly" or "yearly"
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      successUrl,
      cancelUrl,
    } = body;

    // Validate required fields
    if (!planId || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: "Plan, naam en e-mail zijn verplicht" },
        { status: 400 }
      );
    }

    // Get maintenance plan details
    const plan = getMaintenancePlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Ongeldig onderhoudsplan" },
        { status: 400 }
      );
    }

    // Calculate price based on interval
    const isYearly = interval === "yearly";
    const price = isYearly ? getYearlyPrice(plan.price) : plan.price;
    const billingInterval = isYearly ? "year" : "month";

    // Create or retrieve the Stripe product
    const products = await stripe.products.list({
      limit: 100,
    });

    let product = products.data.find(p => 
      p.metadata.planId === plan.id && p.active
    );

    if (!product) {
      product = await stripe.products.create({
        name: `Website Onderhoud - ${plan.name}`,
        description: plan.features.join(" • "),
        metadata: {
          planId: plan.id,
          hoursIncluded: plan.hoursIncluded.toString(),
        },
      });
    }

    // Find or create the price for this interval
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 10,
    });

    let priceObj = prices.data.find(p => 
      p.recurring?.interval === billingInterval
    );

    if (!priceObj) {
      priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: toStripeAmount(price),
        currency: "eur",
        recurring: {
          interval: billingInterval,
        },
        metadata: {
          planId: plan.id,
          planName: plan.name,
          interval: billingInterval,
        },
      });
    }

    // Build base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "ideal", "bancontact"],
      line_items: [
        {
          price: priceObj.id,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        customerName,
        customerPhone: customerPhone || "",
        companyName: companyName || "",
        interval: billingInterval,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
          customerName,
          hoursIncluded: plan.hoursIncluded.toString(),
        },
      },
      success_url: successUrl || `${baseUrl}/onderhoud/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/onderhoud?cancelled=true`,
      locale: "nl",
      billing_address_collection: "required",
      allow_promotion_codes: true,
      // Add tax collection if needed
      // automatic_tax: { enabled: true },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
    
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de checkout" },
      { status: 500 }
    );
  }
}
