import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";

export async function POST(request: NextRequest) {
  try {
    // Check if Mollie is configured
    if (!process.env.MOLLIE_API_KEY) {
      return NextResponse.json(
        { error: "Mollie not configured" },
        { status: 503 }
      );
    }

    const mollieClient = getMollieClient();
    const body = await request.text();
    const params = new URLSearchParams(body);
    const subscriptionId = params.get("id");

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "No subscription ID provided" },
        { status: 400 }
      );
    }

    // We need the customer ID to get subscription details
    // In a real app, you'd look this up from your database
    // For now, we'll just acknowledge the webhook
    
    console.log(`Subscription webhook received for: ${subscriptionId}`);

    // TODO: When you have a database:
    // 1. Look up the subscription in your database
    // 2. Get the customer ID
    // 3. Fetch subscription status from Mollie
    // 4. Update your database accordingly
    
    // Example of what the full implementation would look like:
    /*
    const subscription = await db.subscription.findUnique({
      where: { mollieSubscriptionId: subscriptionId }
    });
    
    if (subscription) {
      const mollieSubscription = await mollieClient.customerSubscriptions.get(
        subscriptionId,
        { customerId: subscription.mollieCustomerId }
      );
      
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: mollieSubscription.status,
          nextPaymentDate: mollieSubscription.nextPaymentDate,
          canceledAt: mollieSubscription.canceledAt,
        }
      });
      
      // Send email notifications based on status
      if (mollieSubscription.status === 'canceled') {
        // Send cancellation confirmation email
      }
    }
    */

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Subscription webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
