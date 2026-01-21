/**
 * API Status Endpoint
 * 
 * GET /api/v1/status - Check API health and get system status
 * 
 * Public endpoint (no auth required) for basic health check.
 * With auth: returns detailed stats.
 */

import { NextRequest, NextResponse } from "next/server";
import { validateApiKey, apiSuccess, getWebhookQueueStatus } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authResult = validateApiKey(request);
  const isAuthenticated = authResult.authenticated;

  // Basic health check (public)
  const basicStatus = {
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  };

  if (!isAuthenticated) {
    return NextResponse.json(basicStatus);
  }

  // Detailed stats (authenticated)
  try {
    const [
      customerCount,
      activeSubscriptions,
      openTickets,
      productCount,
      recentTickets,
      webhookQueue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.supportTicket.count({ where: { status: { notIn: ["closed", "resolved"] } } }),
      prisma.product.count(),
      prisma.supportTicket.findMany({
        where: { status: { notIn: ["closed", "resolved"] } },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          ticketNumber: true,
          subject: true,
          status: true,
          priority: true,
          updatedAt: true,
        },
      }),
      getWebhookQueueStatus(),
    ]);

    return apiSuccess({
      ...basicStatus,
      stats: {
        customers: customerCount,
        activeSubscriptions,
        openTickets,
        products: productCount,
      },
      recentOpenTickets: recentTickets,
      webhookQueue,
      endpoints: {
        sync: {
          customers: "/api/v1/sync/customers",
          tickets: "/api/v1/sync/tickets",
          subscriptions: "/api/v1/sync/subscriptions",
          products: "/api/v1/sync/products",
        },
        webhooks: {
          receive: "/api/v1/webhook/receive",
        },
      },
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({
      ...basicStatus,
      status: "degraded",
      error: "Database connection issue",
    }, { status: 503 });
  }
}
