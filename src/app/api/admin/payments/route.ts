/**
 * API endpoint for Admin Portal to sync payments.
 * 
 * GET - Fetch unsynced payments for invoice creation
 * POST - Mark payments as synced
 */

import { NextRequest, NextResponse } from "next/server";
import { getPayments, markPaymentsSynced } from "@/lib/payments-store";

// Simple API key auth for Admin Portal
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "rotech-admin-secret-key";

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  
  const [type, key] = authHeader.split(" ");
  return type === "Bearer" && key === ADMIN_API_KEY;
}

/**
 * GET /api/admin/payments
 * Fetch payments for Admin Portal sync
 * 
 * Query params:
 * - unsynced: "true" to only get unsynced payments
 * - limit: max number of payments
 */
export async function GET(request: NextRequest) {
  // Validate auth
  if (!validateAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const unsynced = searchParams.get("unsynced") === "true";
    const limit = parseInt(searchParams.get("limit") || "100");
    
    const payments = await getPayments({
      unsynced,
      status: "paid",
      limit,
    });
    
    return NextResponse.json({
      success: true,
      count: payments.length,
      payments,
    });
    
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/payments
 * Mark payments as synced to Admin Portal
 * 
 * Body:
 * {
 *   paymentIds: string[],
 *   invoiceMapping: { [paymentId]: invoiceId }
 * }
 */
export async function POST(request: NextRequest) {
  // Validate auth
  if (!validateAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { paymentIds, invoiceMapping } = body;
    
    if (!paymentIds || !Array.isArray(paymentIds)) {
      return NextResponse.json(
        { error: "Missing paymentIds array" },
        { status: 400 }
      );
    }
    
    await markPaymentsSynced(paymentIds, invoiceMapping || {});
    
    return NextResponse.json({
      success: true,
      synced: paymentIds.length,
    });
    
  } catch (error) {
    console.error("Failed to mark payments synced:", error);
    return NextResponse.json(
      { error: "Failed to update sync status" },
      { status: 500 }
    );
  }
}
