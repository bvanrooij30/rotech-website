/**
 * Support Tickets Sync API
 * 
 * GET /api/v1/sync/tickets - Get all tickets (paginated)
 * GET /api/v1/sync/tickets?since=ISO_DATE - Get tickets updated since date
 * GET /api/v1/sync/tickets?status=open - Filter by status
 * 
 * PATCH /api/v1/sync/tickets/:id - Update ticket from portal
 */

import { NextRequest } from "next/server";
import { authenticateApiRequest, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Authenticate
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  logApiAccess(request, "sync.tickets.list");

  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get("since");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = (page - 1) * limit;

    // Build query
    const where: Record<string, unknown> = {};
    
    if (since) {
      where.updatedAt = { gte: new Date(since) };
    }
    
    if (status) {
      where.status = status;
    }

    // Fetch tickets
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
              companyName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              type: true,
              domain: true,
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              senderType: true,
              senderName: true,
              message: true,
              createdAt: true,
              isRead: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return apiSuccess(tickets, {
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + tickets.length < total,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Ticket sync error:", error);
    return apiError("Failed to fetch tickets", "SYNC_ERROR", 500);
  }
}

// Update ticket from portal
export async function PATCH(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { ticketId, status, resolution, message, adminPortalId } = body;

    if (!ticketId) {
      return apiError("ticketId is required", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.tickets.update", { ticketId });

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return apiError("Ticket not found", "NOT_FOUND", 404);
    }

    // Update ticket
    const updates: Record<string, unknown> = {};
    
    if (status) updates.status = status;
    if (resolution) {
      updates.resolution = resolution;
      updates.resolvedAt = new Date();
      updates.resolvedBy = "portal";
    }
    if (adminPortalId) {
      updates.adminPortalId = adminPortalId;
      updates.syncedAt = new Date();
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updates,
    });

    // Add message if provided
    if (message) {
      await prisma.ticketMessage.create({
        data: {
          ticketId,
          senderType: "support",
          senderName: "RoTech Support",
          message,
        },
      });
    }

    return apiSuccess(updatedTicket);
  } catch (error) {
    console.error("Ticket update error:", error);
    return apiError("Failed to update ticket", "UPDATE_ERROR", 500);
  }
}
