/**
 * Automation Scan Request API
 * POST /api/automation-scan - Submit automation scan request
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const scanRequestSchema = z.object({
  naam: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  bedrijf: z.string().min(2, "Bedrijfsnaam is verplicht"),
  processen: z.string().min(10, "Beschrijf de processen die u wilt automatiseren"),
  tijdPerWeek: z.string().min(1, "Selecteer hoeveel tijd deze processen kosten"),
  systemen: z.array(z.string()).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = scanRequestSchema.parse(body);

    // Create scan request in database
    const scanRequest = await prisma.automationScanRequest.create({
      data: {
        naam: data.naam,
        email: data.email.toLowerCase(),
        bedrijf: data.bedrijf,
        processen: data.processen,
        tijdPerWeek: data.tijdPerWeek,
        systemen: JSON.stringify(data.systemen),
        status: "new",
      },
    });

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to requester

    console.log(`[AUTOMATION-SCAN] New request from ${data.email} - ${data.bedrijf}`);

    return NextResponse.json({
      success: true,
      message: "Uw aanvraag is ontvangen. Wij nemen binnen 24 uur contact met u op.",
      id: scanRequest.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("[AUTOMATION-SCAN] Error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
