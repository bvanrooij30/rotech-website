/**
 * API endpoint for Admin Portal to sync work orders.
 * 
 * GET - Fetch unsynced work orders
 * POST - Mark work orders as synced
 */

import { NextRequest, NextResponse } from "next/server";
import { getWorkOrders, markOrdersSynced, updateOrderStatus } from "@/lib/work-orders-store";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "rotech-admin-secret-key";

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  
  const [type, key] = authHeader.split(" ");
  return type === "Bearer" && key === ADMIN_API_KEY;
}

/**
 * GET /api/admin/work-orders
 * Fetch work orders for Admin Portal sync
 */
export async function GET(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const unsynced = searchParams.get("unsynced") === "true";
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    
    const orders = await getWorkOrders({
      unsynced,
      status,
      limit,
    });
    
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
    
  } catch (error) {
    console.error("Failed to fetch work orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch work orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/work-orders
 * Mark work orders as synced
 */
export async function POST(request: NextRequest) {
  if (!validateAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { orderIds, formMapping } = body;
    
    if (!orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: "Missing orderIds array" },
        { status: 400 }
      );
    }
    
    await markOrdersSynced(orderIds, formMapping || {});
    
    return NextResponse.json({
      success: true,
      synced: orderIds.length,
    });
    
  } catch (error) {
    console.error("Failed to mark orders synced:", error);
    return NextResponse.json(
      { error: "Failed to update sync status" },
      { status: 500 }
    );
  }
}
