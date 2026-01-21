import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

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
      name,
      email,
      phone,
      companyName,
    } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Naam en email zijn verplicht" },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      // Return existing customer
      const existingCustomer = existingCustomers.data[0];
      
      // Update customer info if needed
      await stripe.customers.update(existingCustomer.id, {
        name: name,
        phone: phone || undefined,
        metadata: {
          companyName: companyName || "",
        },
      });

      return NextResponse.json({
        success: true,
        customerId: existingCustomer.id,
        isExisting: true,
      });
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      name: name,
      email: email,
      phone: phone || undefined,
      metadata: {
        companyName: companyName || "",
        source: "ro-tech-website",
      },
      preferred_locales: ["nl"],
    });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      isExisting: false,
    });
    
  } catch (error) {
    console.error("Customer creation error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de klant" },
      { status: 500 }
    );
  }
}
