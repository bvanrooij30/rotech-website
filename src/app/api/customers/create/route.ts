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
      name,
      email,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Naam en email zijn verplicht" },
        { status: 400 }
      );
    }

    // Create Mollie customer (needed for subscriptions)
    const customer = await mollieClient.customers.create({
      name: name,
      email: email,
    });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    });
    
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de klant" },
      { status: 500 }
    );
  }
}
