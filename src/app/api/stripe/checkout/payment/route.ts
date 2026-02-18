import { NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured, toStripeAmount, calculateDeposit, WEBSITE_PACKAGES } from "@/lib/stripe";
import { z } from "zod";

const paymentSchema = z.object({
  packageId: z.enum(["starter", "business", "webshop", "maatwerk"]),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  companyName: z.string().optional(),
  customAmount: z.number().positive().optional(), // For custom quotes
  paymentType: z.enum(["deposit", "full", "final"]).default("deposit"),
  quoteId: z.string().optional(), // Reference to quote
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/stripe/checkout/payment
 * Create a Stripe Checkout session for a one-time payment (website packages)
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { success: false, error: "Stripe is niet geconfigureerd" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = paymentSchema.parse(body);

    const pkg = WEBSITE_PACKAGES.find((p) => p.id === data.packageId);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: "Ongeldig pakket" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Calculate amount based on payment type
    const totalAmount = data.customAmount || pkg.basePrice;
    const isLargeProject = totalAmount >= 9995;
    const { depositAmount, remainingAmount } = calculateDeposit(totalAmount, isLargeProject);

    let paymentAmount: number;
    let description: string;

    switch (data.paymentType) {
      case "deposit":
        paymentAmount = depositAmount;
        description = `Aanbetaling ${pkg.name} (${isLargeProject ? "30%" : "50%"})`;
        break;
      case "final":
        paymentAmount = remainingAmount;
        description = `Restbetaling ${pkg.name}`;
        break;
      case "full":
      default:
        paymentAmount = totalAmount;
        description = `${pkg.name} - Volledige betaling`;
        break;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: toStripeAmount(paymentAmount),
            product_data: {
              name: pkg.name,
              description: description,
              metadata: {
                package_id: data.packageId,
                payment_type: data.paymentType,
              },
            },
          },
          quantity: 1,
        },
      ],
      customer_email: data.customerEmail,
      metadata: {
        package_id: data.packageId,
        package_name: pkg.name,
        payment_type: data.paymentType,
        total_project_amount: totalAmount.toString(),
        deposit_amount: depositAmount.toString(),
        remaining_amount: remainingAmount.toString(),
        customer_name: data.customerName,
        company_name: data.companyName || "",
        quote_id: data.quoteId || "",
      },
      success_url: data.successUrl || `${baseUrl}/betaling/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.cancelUrl || `${baseUrl}/betaling?cancelled=true`,
      locale: "nl",
      billing_address_collection: "required",
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: description,
          metadata: {
            package_id: data.packageId,
            quote_id: data.quoteId || "",
          },
          custom_fields: [
            {
              name: "Pakket",
              value: pkg.name,
            },
          ],
          footer: "Bedankt voor uw betaling! Ro-Tech Development",
        },
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      paymentDetails: {
        type: data.paymentType,
        amount: paymentAmount,
        totalProject: totalAmount,
        deposit: depositAmount,
        remaining: remainingAmount,
      },
    });
  } catch (error: any) {
    console.error("Payment checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validatiefout" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Checkout sessie aanmaken mislukt" },
      { status: 500 }
    );
  }
}
