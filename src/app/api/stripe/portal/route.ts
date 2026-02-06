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

    // Get the user and their subscriptions (both maintenance and automation)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ["active", "trialing", "past_due", "paused"] } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        automationSubscriptions: {
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

    // Check for any active subscription (maintenance or automation)
    const maintenanceSub = user.subscriptions[0];
    const automationSub = user.automationSubscriptions[0];
    
    const stripeCustomerId = maintenanceSub?.stripeCustomerId || automationSub?.stripeCustomerId;
    
    if (!stripeCustomerId) {
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
      customer: stripeCustomerId,
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
        automationSubscriptions: {
          orderBy: { createdAt: "desc" },
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

    const activeMaintenanceSub = user.subscriptions.find(
      (s) => s.status === "active" || s.status === "trialing"
    );
    
    const activeAutomationSub = user.automationSubscriptions.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    return NextResponse.json({
      success: true,
      data: {
        // Maintenance subscription
        subscription: activeMaintenanceSub
          ? {
              id: activeMaintenanceSub.id,
              type: "maintenance",
              planType: activeMaintenanceSub.planType,
              planName: activeMaintenanceSub.planName,
              status: activeMaintenanceSub.status,
              monthlyPrice: activeMaintenanceSub.monthlyPrice,
              hoursIncluded: activeMaintenanceSub.hoursIncluded,
              hoursUsed: activeMaintenanceSub.hoursUsed,
              currentPeriodStart: activeMaintenanceSub.currentPeriodStart,
              currentPeriodEnd: activeMaintenanceSub.currentPeriodEnd,
              cancelAtPeriodEnd: activeMaintenanceSub.cancelAtPeriodEnd,
              recentUsage: activeMaintenanceSub.usageLogs,
            }
          : null,
        // Automation subscription
        automationSubscription: activeAutomationSub
          ? {
              id: activeAutomationSub.id,
              type: "automation",
              planType: activeAutomationSub.planType,
              planName: activeAutomationSub.planName,
              status: activeAutomationSub.status,
              monthlyPrice: activeAutomationSub.monthlyPrice,
              billingPeriod: activeAutomationSub.billingPeriod,
              maxWorkflows: activeAutomationSub.maxWorkflows,
              maxExecutions: activeAutomationSub.maxExecutions,
              supportHoursIncl: activeAutomationSub.supportHoursIncl,
              supportHoursUsed: activeAutomationSub.supportHoursUsed,
              currentPeriodStart: activeAutomationSub.currentPeriodStart,
              currentPeriodEnd: activeAutomationSub.currentPeriodEnd,
            }
          : null,
        allSubscriptions: [
          ...user.subscriptions.map((s) => ({
            id: s.id,
            type: "maintenance",
            planName: s.planName,
            status: s.status,
            createdAt: s.createdAt,
            cancelledAt: s.cancelledAt,
          })),
          ...user.automationSubscriptions.map((s) => ({
            id: s.id,
            type: "automation",
            planName: s.planName,
            status: s.status,
            createdAt: s.createdAt,
          })),
        ],
        recentInvoices: user.invoices,
        hasStripePortal: !!(activeMaintenanceSub?.stripeCustomerId || activeAutomationSub?.stripeCustomerId),
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
