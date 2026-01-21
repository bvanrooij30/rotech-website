/**
 * Customer Sync API
 * 
 * GET /api/v1/sync/customers - Get all customers (paginated)
 * GET /api/v1/sync/customers?since=ISO_DATE - Get customers updated since date
 * 
 * This endpoint is used by the RoTech Portal to sync customer data.
 */

import { NextRequest } from "next/server";
import { authenticateApiRequest, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Authenticate
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  logApiAccess(request, "sync.customers.list");

  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get("since");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    // Build query
    const where = since ? {
      updatedAt: { gte: new Date(since) },
    } : {};

    // Fetch customers
    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          companyName: true,
          kvkNumber: true,
          vatNumber: true,
          street: true,
          houseNumber: true,
          postalCode: true,
          city: true,
          country: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              products: true,
              subscriptions: true,
              supportTickets: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess(customers, {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + customers.length < total,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Customer sync error:", error);
    return apiError("Failed to fetch customers", "SYNC_ERROR", 500);
  }
}
