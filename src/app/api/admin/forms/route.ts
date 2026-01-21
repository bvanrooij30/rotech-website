/**
 * API endpoint for Admin Portal to sync form submissions.
 * 
 * GET - Fetch unsynced form submissions (contact, offerte)
 * POST - Mark submissions as synced
 */

import { NextRequest, NextResponse } from "next/server";
import { getFormSubmissions, markFormsSynced } from "@/lib/forms-store";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "rotech-admin-secret-key";

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  
  const [type, key] = authHeader.split(" ");
  return type === "Bearer" && key === ADMIN_API_KEY;
}

/**
 * GET /api/admin/forms
 * Fetch form submissions for Admin Portal sync
 */
export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const unsynced = searchParams.get("unsynced") === "true";
    const formType = searchParams.get("type") as "contact" | "offerte" | undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    
    const submissions = await getFormSubmissions({
      unsynced,
      formType,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions,
    });
    
  } catch (error) {
    console.error("Failed to fetch form submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/forms
 * Mark form submissions as synced
 */
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { submissionIds, formMapping } = body;
    
    if (!submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json(
        { error: "Missing submissionIds array" },
        { status: 400 }
      );
    }
    
    await markFormsSynced(submissionIds, formMapping || {});
    
    return NextResponse.json({
      success: true,
      synced: submissionIds.length,
    });
    
  } catch (error) {
    console.error("Failed to mark submissions synced:", error);
    return NextResponse.json(
      { error: "Failed to update sync status" },
      { status: 500 }
    );
  }
}
