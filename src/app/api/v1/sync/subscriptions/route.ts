/**
 * Subscriptions Sync API
 * 
 * GET /api/v1/sync/subscriptions - Get all subscriptions
 * PATCH - Update subscription from portal
 * POST - Create subscription for customer
 */

import { NextRequest } from "next/server";
import { authenticateApiRequest, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  logApiAccess(request, "sync.subscriptions.list");

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (customerId) where.userId = customerId;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              companyName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          usageLogs: {
            orderBy: { date: "desc" },
            take: 10,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.subscription.count({ where }),
    ]);

    return apiSuccess(subscriptions, {
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Subscription sync error:", error);
    return apiError("Failed to fetch subscriptions", "SYNC_ERROR", 500);
  }
}

// Create subscription from portal
export async function POST(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { 
      userId, 
      planType, 
      planName, 
      monthlyPrice, 
      hoursIncluded,
      productId,
      stripeSubscriptionId,
    } = body;

    if (!userId || !planType || !planName || !monthlyPrice) {
      return apiError("Missing required fields", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.subscriptions.create", { userId, planType });

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("User not found", "NOT_FOUND", 404);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType,
        planName,
        monthlyPrice,
        hoursIncluded: hoursIncluded || 0,
        productId: productId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return apiSuccess(subscription);
  } catch (error) {
    console.error("Subscription create error:", error);
    return apiError("Failed to create subscription", "CREATE_ERROR", 500);
  }
}

// Update subscription from portal
export async function PATCH(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { subscriptionId, status, hoursUsed, addUsageLog } = body;

    if (!subscriptionId) {
      return apiError("subscriptionId is required", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.subscriptions.update", { subscriptionId });

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (hoursUsed !== undefined) updates.hoursUsed = hoursUsed;

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updates,
    });

    // Add usage log if provided
    if (addUsageLog) {
      await prisma.usageLog.create({
        data: {
          subscriptionId,
          description: addUsageLog.description,
          hours: addUsageLog.hours,
          category: addUsageLog.category || "update",
        },
      });

      // Update hours used
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          hoursUsed: { increment: addUsageLog.hours },
        },
      });
    }

    return apiSuccess(subscription);
  } catch (error) {
    console.error("Subscription update error:", error);
    return apiError("Failed to update subscription", "UPDATE_ERROR", 500);
  }
}
