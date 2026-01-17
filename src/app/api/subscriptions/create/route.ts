import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";
import { getMaintenancePlanById } from "@/data/packages";

export async function POST(request: NextRequest) {
  try {
    // Check if Mollie is configured
    if (!process.env.MOLLIE_API_KEY) {
      return NextResponse.json(
        { error: "Betalingen zijn momenteel niet beschikbaar" },
        { status: 503 }
      );
    }

    const mollieClient = getMollieClient();
    const body = await request.json();
    
    const {
      customerId, // Mollie customer ID
      planId,
      startDate, // When to start the subscription (after free period)
    } = body;

    // Get maintenance plan details
    const plan = getMaintenancePlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Ongeldig onderhoudsplan" },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await mollieClient.customerSubscriptions.create({
      customerId: customerId,
      amount: {
        currency: "EUR",
        value: plan.price.toFixed(2),
      },
      interval: "1 month", // Monthly subscription
      description: `Onderhoud ${plan.name} - Ro-Tech Development`,
      startDate: startDate, // Format: YYYY-MM-DD
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/subscriptions/webhook`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      nextPaymentDate: subscription.nextPaymentDate,
    });
    
  } catch (error) {
    console.error("Subscription creation error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van het abonnement" },
      { status: 500 }
    );
  }
}
