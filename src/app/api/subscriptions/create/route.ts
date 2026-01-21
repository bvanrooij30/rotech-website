import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, toStripeAmount } from "@/lib/stripe";
import { getMaintenancePlanById } from "@/data/packages";

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
      customerId, // Stripe customer ID
      planId,
      trialDays, // Number of trial days (for free support period)
    } = body;

    // Get maintenance plan details
    const plan = getMaintenancePlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Ongeldig onderhoudsplan" },
        { status: 400 }
      );
    }

    // First, create or get the price for this plan
    // In production, you'd create these prices in Stripe Dashboard and store the price IDs
    const prices = await stripe.prices.list({
      lookup_keys: [`maintenance_${plan.id}`],
      limit: 1,
    });

    let priceId: string;

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Create a new product and price if it doesn't exist
      const product = await stripe.products.create({
        name: `Onderhoud ${plan.name}`,
        description: `Maandelijks onderhoudsabonnement - ${plan.name}`,
        metadata: {
          planId: plan.id,
          hoursIncluded: plan.hoursIncluded.toString(),
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: toStripeAmount(plan.price),
        currency: "eur",
        recurring: {
          interval: "month",
        },
        lookup_key: `maintenance_${plan.id}`,
        metadata: {
          planId: plan.id,
          planName: plan.name,
        },
      });

      priceId = price.id;
    }

    // Create subscription with optional trial period
    const subscriptionParams: {
      customer: string;
      items: { price: string }[];
      metadata: Record<string, string>;
      payment_behavior: "default_incomplete" | "allow_incomplete" | "error_if_incomplete";
      expand: string[];
      trial_period_days?: number;
    } = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    };

    // Add trial period if specified (for free support period)
    if (trialDays && trialDays > 0) {
      subscriptionParams.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    // Get the client secret for the subscription payment
    const invoice = subscription.latest_invoice as { payment_intent?: { client_secret?: string } } | null;
    const clientSecret = invoice?.payment_intent?.client_secret;

    // Access subscription properties
    const subscriptionData = subscription as unknown as {
      id: string;
      status: string;
      current_period_end: number;
      trial_end: number | null;
    };

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionData.id,
      status: subscriptionData.status,
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000).toISOString(),
      trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end * 1000).toISOString() : null,
      clientSecret: clientSecret,
    });
    
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van het abonnement" },
      { status: 500 }
    );
  }
}
