import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * GET - Get current user's subscription details
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: {
        product: true,
        usageLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

/**
 * POST - Manage subscription (cancel, resume, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Betalingen zijn momenteel niet beschikbaar" },
        { status: 503 }
      );
    }

    const stripe = getStripeClient();
    const body = await request.json();
    const { action, subscriptionId } = body;

    // Get subscription from database
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Abonnement niet gevonden" },
        { status: 404 }
      );
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Geen Stripe koppeling gevonden" },
        { status: 400 }
      );
    }

    switch (action) {
      case "cancel": {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: true },
        });

        return NextResponse.json({
          success: true,
          message: "Abonnement wordt beëindigd aan het einde van de huidige periode",
        });
      }

      case "resume": {
        // Resume a cancelled subscription
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        });

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { cancelAtPeriodEnd: false },
        });

        return NextResponse.json({
          success: true,
          message: "Abonnement wordt voortgezet",
        });
      }

      case "billing-portal": {
        // Create Stripe Billing Portal session
        if (!subscription.stripeCustomerId) {
          return NextResponse.json(
            { error: "Geen klantgegevens gevonden" },
            { status: 400 }
          );
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: subscription.stripeCustomerId,
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/portal/abonnement`,
        });

        return NextResponse.json({
          success: true,
          portalUrl: portalSession.url,
        });
      }

      default:
        return NextResponse.json(
          { error: "Ongeldige actie" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Subscription management error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
