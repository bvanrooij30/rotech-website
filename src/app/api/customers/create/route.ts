import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient } from "@/lib/stripe";
import { logger } from "@/lib/logger";

// Zod schema for customer creation
const CustomerSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn").max(100),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  companyName: z.string().max(100).optional(),
});

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
    
    // Validate with Zod
    const validationResult = CustomerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validatie mislukt", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { name, email, phone, companyName } = validationResult.data;

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
    logger.error("Customer creation error", "Customers", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het aanmaken van de klant" },
      { status: 500 }
    );
  }
}
