/**
 * Automation Intake API
 * POST /api/automation/intake - Submit intake questionnaire
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { automationPlans } from "@/data/automation-subscriptions";

const intakeSchema = z.object({
  // Contact
  contactName: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  website: z.string().optional(),
  
  // Plan
  planType: z.enum(["starter", "business", "professional", "enterprise"]),
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
    const plan = automationPlans.find((p) => p.id === data.planType);
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
        ...workflowDetails,
        customRequirements,
      },
    });

    console.log(`[AUTOMATION-INTAKE] New intake submitted: ${intake.id} - ${data.email}`);

    // TODO: Create Stripe checkout session for payment
    // For now, return success without payment
    // In production, you would:
    // 1. Create Stripe checkout session
    // 2. Store session ID in intake record
    // 3. Return checkout URL
    
    // Placeholder response - in production this would be a Stripe checkout URL
    const price = data.billingPeriod === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    
    return NextResponse.json({
      success: true,
      message: "Intake succesvol ontvangen",
      intakeId: intake.id,
      // In production, uncomment and implement Stripe:
      // checkoutUrl: stripeSession.url,
      nextStep: "payment",
      summary: {
        plan: plan.name,
        billingPeriod: data.billingPeriod === "yearly" ? "Jaarlijks" : "Maandelijks",
        price: price,
        workflows: data.selectedWorkflows.length,
      },
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
