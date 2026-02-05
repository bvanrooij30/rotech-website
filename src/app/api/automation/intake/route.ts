/**
 * Automation Intake API with Stripe Checkout Integration
 * POST /api/automation/intake - Submit intake questionnaire and create Stripe checkout
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getStripeClient, isStripeConfigured, toStripeAmount, AUTOMATION_PLANS } from "@/lib/stripe";

const intakeSchema = z.object({
  // Contact
  contactName: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  website: z.string().optional(),
  
  // Plan
  planType: z.enum(["starter", "business", "professional"]),
  billingPeriod: z.enum(["monthly", "yearly"]),
  
  // Workflows
  selectedWorkflows: z.array(z.string()).min(1, "Selecteer minimaal één workflow"),
  priorityWorkflow: z.string().optional(),
  
  // Systems
  selectedSystems: z.array(z.string()),
  otherSystems: z.string().optional(),
  
  // General
  teamSize: z.string().min(1, "Team grootte is verplicht"),
  preferredContactTime: z.string().min(1, "Voorkeurstijd is verplicht"),
  kickoffUrgency: z.string().optional(),
  additionalNotes: z.string().optional(),
  
  // Workflow answers (dynamic)
  workflowAnswers: z.record(z.string(), z.record(z.string(), z.union([z.string(), z.array(z.string())]))).optional(),
  
  // Agreements
  termsAccepted: z.boolean().refine((v) => v === true, "Accepteer de voorwaarden"),
  dataProcessingAccepted: z.boolean().refine((v) => v === true, "Accepteer de privacyverklaring"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = intakeSchema.parse(body);

    // Get plan details
    const plan = AUTOMATION_PLANS.find((p) => p.id === data.planType);
    if (!plan) {
      return NextResponse.json({ error: "Ongeldig pakket" }, { status: 400 });
    }

    // Prepare workflow-specific details as JSON strings
    const workflowDetails: Record<string, string | null> = {
      leadCaptureDetails: null,
      contentDetails: null,
      ecommerceDetails: null,
      invoicingDetails: null,
      customerServiceDetails: null,
    };

    if (data.workflowAnswers) {
      if (data.workflowAnswers["lead-capture"]) {
        workflowDetails.leadCaptureDetails = JSON.stringify(data.workflowAnswers["lead-capture"]);
      }
      if (data.workflowAnswers["content"]) {
        workflowDetails.contentDetails = JSON.stringify(data.workflowAnswers["content"]);
      }
      if (data.workflowAnswers["e-commerce"]) {
        workflowDetails.ecommerceDetails = JSON.stringify(data.workflowAnswers["e-commerce"]);
      }
      if (data.workflowAnswers["invoicing"]) {
        workflowDetails.invoicingDetails = JSON.stringify(data.workflowAnswers["invoicing"]);
      }
      if (data.workflowAnswers["customer-service"]) {
        workflowDetails.customerServiceDetails = JSON.stringify(data.workflowAnswers["customer-service"]);
      }
    }

    // Combine all other workflow answers into customRequirements
    const otherWorkflows = ["email-marketing", "notifications", "data-sync", "reporting", "custom"];
    const customReqs: Record<string, unknown> = {};
    for (const wf of otherWorkflows) {
      if (data.workflowAnswers?.[wf]) {
        customReqs[wf] = data.workflowAnswers[wf];
      }
    }
    const customRequirements = Object.keys(customReqs).length > 0 
      ? JSON.stringify(customReqs) 
      : data.additionalNotes || null;

    // Create intake record
    const intake = await prisma.automationIntake.create({
      data: {
        contactName: data.contactName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        companyName: data.companyName,
        website: data.website || null,
        planType: data.planType,
        billingPeriod: data.billingPeriod,
        workflowTypes: JSON.stringify(data.selectedWorkflows),
        priorityWorkflow: data.priorityWorkflow || data.selectedWorkflows[0],
        currentSystems: JSON.stringify([...data.selectedSystems, data.otherSystems].filter(Boolean)),
        teamSize: data.teamSize,
        preferredContactTime: data.preferredContactTime,
        termsAccepted: data.termsAccepted,
        dataProcessingAccepted: data.dataProcessingAccepted,
        status: "submitted",
        paymentStatus: "pending",
        ...workflowDetails,
        customRequirements,
      },
    });

    console.log(`[AUTOMATION-INTAKE] New intake submitted: ${intake.id} - ${data.email}`);

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.warn("[AUTOMATION-INTAKE] Stripe not configured, skipping payment");
      return NextResponse.json({
        success: true,
        message: "Intake succesvol ontvangen. Betaling wordt later afgehandeld.",
        intakeId: intake.id,
        nextStep: "contact",
      });
    }

    // Create Stripe Checkout Session
    const stripe = getStripeClient();
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    
    // Determine price based on billing period
    const price = data.billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const interval = data.billingPeriod === "yearly" ? "year" : "month";

    // Find or create product
    const products = await stripe.products.list({ limit: 100 });
    let product = products.data.find(
      (p) => p.metadata?.plan_id === data.planType && 
             p.metadata?.type === "automation" && 
             p.active
    );

    if (!product) {
      product = await stripe.products.create({
        name: plan.name,
        description: `Automation subscription: ${plan.maxWorkflows === -1 ? "Onbeperkt" : plan.maxWorkflows} workflows, ${plan.maxExecutions.toLocaleString()} executions/maand`,
        metadata: {
          plan_id: data.planType,
          type: "automation",
          max_workflows: plan.maxWorkflows.toString(),
          max_executions: plan.maxExecutions.toString(),
          support_hours: plan.supportHours.toString(),
        },
      });
      console.log(`[AUTOMATION-INTAKE] Created Stripe product: ${product.id}`);
    }

    // Find or create price
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    let stripePrice = prices.data.find(
      (p) =>
        p.unit_amount === toStripeAmount(price) &&
        p.recurring?.interval === interval
    );

    if (!stripePrice) {
      stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: toStripeAmount(price),
        currency: "eur",
        recurring: { interval },
        metadata: { 
          plan_id: data.planType,
          billing_period: data.billingPeriod,
        },
      });
      console.log(`[AUTOMATION-INTAKE] Created Stripe price: ${stripePrice.id}`);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "ideal"],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      customer_email: data.email.toLowerCase(),
      metadata: {
        intake_id: intake.id,
        plan_id: data.planType,
        plan_name: plan.name,
        customer_name: data.contactName,
        company_name: data.companyName,
        billing_period: data.billingPeriod,
        type: "automation",
        max_workflows: plan.maxWorkflows.toString(),
        max_executions: plan.maxExecutions.toString(),
        support_hours: plan.supportHours.toString(),
      },
      subscription_data: {
        metadata: {
          intake_id: intake.id,
          plan_id: data.planType,
          plan_name: plan.name,
          type: "automation",
          max_workflows: plan.maxWorkflows.toString(),
          max_executions: plan.maxExecutions.toString(),
          support_hours: plan.supportHours.toString(),
        },
      },
      success_url: `${baseUrl}/checkout/automation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/automation/${data.planType}?billing=${data.billingPeriod}&cancelled=true`,
      locale: "nl",
      billing_address_collection: "required",
      allow_promotion_codes: true,
      tax_id_collection: { enabled: true },
    });

    // Update intake with Stripe session ID
    await prisma.automationIntake.update({
      where: { id: intake.id },
      data: { stripeSessionId: session.id },
    });

    console.log(`[AUTOMATION-INTAKE] Created Stripe session: ${session.id} for intake: ${intake.id}`);

    return NextResponse.json({
      success: true,
      message: "Intake succesvol ontvangen",
      intakeId: intake.id,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("[AUTOMATION-INTAKE] Error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}

// GET: Retrieve intake by ID (for admin/review)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      // List all intakes (admin only - add auth check in production)
      const intakes = await prisma.automationIntake.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return NextResponse.json({
        success: true,
        data: intakes,
      });
    }

    const intake = await prisma.automationIntake.findUnique({
      where: { id },
    });

    if (!intake) {
      return NextResponse.json({ error: "Intake niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: intake,
    });
  } catch (error) {
    console.error("[AUTOMATION-INTAKE] GET Error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
