import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import prisma from "@/lib/prisma";

/**
 * POST /api/stripe/portal
 * Create a Stripe Customer Portal session for subscription management
 */
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 }
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: "Stripe is niet geconfigureerd" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Get the user and their subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ["active", "trialing", "past_due", "paused"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Gebruiker niet gevonden" },
        { status: 404 }
      );
    }

    const subscription = user.subscriptions[0];
    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { success: false, error: "Geen actief abonnement gevonden" },
        { status: 404 }
      );
    }

    // Get return URL from request body or use default
    const body = await request.json().catch(() => ({}));
    const returnUrl = body.returnUrl || `${baseUrl}/portal/abonnement`;

    // Create Billing Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
    });
  } catch (error: unknown) {
    console.error("Customer portal error:", error);
    const errorMessage = error instanceof Error ? error.message : "Portal sessie aanmaken mislukt";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/portal
 * Get subscription details for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Niet ingelogd" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
          include: {
            usageLogs: {
              orderBy: { date: "desc" },
              take: 10,
            },
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Gebruiker niet gevonden" },
        { status: 404 }
      );
    }

    const activeSubscription = user.subscriptions.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    return NextResponse.json({
      success: true,
      data: {
        subscription: activeSubscription
          ? {
              id: activeSubscription.id,
              planType: activeSubscription.planType,
              planName: activeSubscription.planName,
              status: activeSubscription.status,
              monthlyPrice: activeSubscription.monthlyPrice,
              hoursIncluded: activeSubscription.hoursIncluded,
              hoursUsed: activeSubscription.hoursUsed,
              currentPeriodStart: activeSubscription.currentPeriodStart,
              currentPeriodEnd: activeSubscription.currentPeriodEnd,
              cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
              recentUsage: activeSubscription.usageLogs,
            }
          : null,
        allSubscriptions: user.subscriptions.map((s) => ({
          id: s.id,
          planName: s.planName,
          status: s.status,
          createdAt: s.createdAt,
          cancelledAt: s.cancelledAt,
        })),
        recentInvoices: user.invoices,
        hasStripePortal: !!activeSubscription?.stripeCustomerId,
      },
    });
  } catch (error: unknown) {
    console.error("Get subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : "Onbekende fout";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
