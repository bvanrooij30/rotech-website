import { NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured, toStripeAmount, MAINTENANCE_PLANS } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.enum(["basis", "business", "premium"]),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  companyName: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/stripe/checkout/subscription
 * Create a Stripe Checkout session for a maintenance subscription
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: "Stripe is niet geconfigureerd" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { planId, customerEmail, customerName, companyName, successUrl, cancelUrl } = 
      checkoutSchema.parse(body);

    const plan = MAINTENANCE_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Ongeldig plan" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Find or create the product
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(
      (p) => p.metadata?.plan_id === planId && p.metadata?.type === "maintenance" && p.active
    );

    if (!product) {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.features.join(" • "),
        metadata: {
          plan_id: planId,
          hours_included: plan.hoursIncluded.toString(),
          type: "maintenance",
        },
      });
    }

    // Find or create the price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    let price = prices.data.find(
      (p) =>
        p.unit_amount === toStripeAmount(plan.price) &&
        p.recurring?.interval === "month"
    );

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: toStripeAmount(plan.price),
        currency: "eur",
        recurring: { interval: "month" },
        metadata: { plan_id: planId },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        plan_id: planId,
        plan_name: plan.name,
        customer_name: customerName,
        company_name: companyName || "",
        hours_included: plan.hoursIncluded.toString(),
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          plan_name: plan.name,
          customer_name: customerName,
          company_name: companyName || "",
          hours_included: plan.hoursIncluded.toString(),
        },
      },
      success_url: successUrl || `${baseUrl}/onderhoud/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/onderhoud?cancelled=true`,
      locale: "nl",
      billing_address_collection: "required",
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Checkout session error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || "Validatiefout" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Checkout sessie aanmaken mislukt" },
      { status: 500 }
    );
  }
}
