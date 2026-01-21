/**
 * Products Sync API
 * 
 * Sync products (websites, webshops, apps) between portal and website
 */

import { NextRequest } from "next/server";
import { authenticateApiRequest, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  logApiAccess(request, "sync.products.list");

  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (customerId) where.userId = customerId;
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
          subscriptions: {
            where: { status: "active" },
            take: 1,
          },
          statusUpdates: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return apiSuccess(products, {
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Product sync error:", error);
    return apiError("Failed to fetch products", "SYNC_ERROR", 500);
  }
}

// Create product from portal
export async function POST(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { 
      userId, 
      name, 
      type, 
      domain, 
      hostingProvider,
      techStack,
      status,
      launchDate,
      projectValue,
    } = body;

    if (!userId || !name || !type) {
      return apiError("Missing required fields (userId, name, type)", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.products.create", { userId, name });

    const product = await prisma.product.create({
      data: {
        userId,
        name,
        type,
        domain,
        hostingProvider,
        techStack,
        status: status || "development",
        launchDate: launchDate ? new Date(launchDate) : null,
        projectValue,
      },
    });

    return apiSuccess(product);
  } catch (error) {
    console.error("Product create error:", error);
    return apiError("Failed to create product", "CREATE_ERROR", 500);
  }
}

// Update product from portal
export async function PATCH(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { productId, status, domain, addStatusUpdate, ...updates } = body;

    if (!productId) {
      return apiError("productId is required", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.products.update", { productId });

    const updateData: Record<string, unknown> = { ...updates };
    if (status) updateData.status = status;
    if (domain) updateData.domain = domain;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Add status update if provided
    if (addStatusUpdate) {
      await prisma.statusUpdate.create({
        data: {
          productId,
          title: addStatusUpdate.title,
          message: addStatusUpdate.message,
          type: addStatusUpdate.type || "info",
          isPublic: addStatusUpdate.isPublic ?? true,
          createdBy: "portal",
        },
      });
    }

    return apiSuccess(product);
  } catch (error) {
    console.error("Product update error:", error);
    return apiError("Failed to update product", "UPDATE_ERROR", 500);
  }
}
