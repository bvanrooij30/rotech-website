import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getStripeClient, isStripeConfigured, toStripeAmount, MAINTENANCE_PLANS } from "@/lib/stripe";

/**
 * POST /api/stripe/setup
 * Creates or updates Stripe products and prices for maintenance plans
 * Only accessible by admins
 */
export async function POST() {
  try {
    await requireAdmin();

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: "Stripe is niet geconfigureerd" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const results: Array<{
      plan: string;
      productId: string;
      priceId: string;
      status: string;
    }> = [];

    for (const plan of MAINTENANCE_PLANS) {
      // Check if product already exists
      const existingProducts = await stripe.products.list({
        limit: 100,
      });

      let product = existingProducts.data.find(
        (p) => p.metadata?.plan_id === plan.id && p.active
      );

      // Create product if it doesn't exist
      if (!product) {
        product = await stripe.products.create({
          name: plan.name,
          description: plan.features.join(" • "),
          metadata: {
            plan_id: plan.id,
            hours_included: plan.hoursIncluded.toString(),
            type: "maintenance",
          },
        });
      }

      // Check if price already exists for this product
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 10,
      });

      const correctPrice = existingPrices.data.find(
        (p) =>
          p.unit_amount === toStripeAmount(plan.price) &&
          p.recurring?.interval === "month"
      );

      let price = correctPrice;

      // Create price if it doesn't exist
      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: toStripeAmount(plan.price),
          currency: "eur",
          recurring: {
            interval: "month",
          },
          metadata: {
            plan_id: plan.id,
          },
        });

        // Deactivate old prices
        for (const oldPrice of existingPrices.data) {
          if (oldPrice.id !== price.id) {
            await stripe.prices.update(oldPrice.id, { active: false });
          }
        }
      }

      results.push({
        plan: plan.name,
        productId: product.id,
        priceId: price.id,
        status: correctPrice ? "existing" : "created",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Stripe producten en prijzen zijn geconfigureerd",
      products: results,
    });
  } catch (error: any) {
    console.error("Stripe setup error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Stripe setup mislukt" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/setup
 * Get current Stripe product/price configuration
 */
export async function GET() {
  try {
    await requireAdmin();

    if (!isStripeConfigured()) {
      return NextResponse.json({
        success: true,
        configured: false,
        message: "Stripe is niet geconfigureerd. Voeg STRIPE_SECRET_KEY toe aan .env",
      });
    }

    const stripe = getStripeClient();

    // Get all maintenance products
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });

    const maintenanceProducts = products.data.filter(
      (p) => p.metadata?.type === "maintenance"
    );

    const productDetails = await Promise.all(
      maintenanceProducts.map(async (product) => {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        return {
          id: product.id,
          name: product.name,
          planId: product.metadata?.plan_id,
          hoursIncluded: product.metadata?.hours_included,
          prices: prices.data.map((p) => ({
            id: p.id,
            amount: p.unit_amount ? p.unit_amount / 100 : 0,
            currency: p.currency,
            interval: p.recurring?.interval,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      configured: true,
      products: productDetails,
      totalProducts: maintenanceProducts.length,
    });
  } catch (error: any) {
    console.error("Stripe setup check error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
