import { NextRequest, NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";

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
      redirectUrl,
    } = body;

    // Validate required fields
    if (!customerEmail || !amount || !description) {
      return NextResponse.json(
        { error: "Missende verplichte velden" },
        { status: 400 }
      );
    }

    // Create Mollie payment
    const payment = await mollieClient.payments.create({
      amount: {
        currency: "EUR",
        value: amount.toFixed(2), // Mollie requires string with 2 decimals
      },
      description: description,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/betaling/succes`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
      metadata: {
        customerName,
        customerEmail,
        customerPhone,
        companyName,
        paymentType,
        quoteId,
        packageId,
        maintenancePlanId,
      },
    });

    // Return payment URL for redirect
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      status: payment.status,
    });
    
  } catch (error) {
    console.error("Mollie payment error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de betaling" },
      { status: 500 }
    );
  }
}
