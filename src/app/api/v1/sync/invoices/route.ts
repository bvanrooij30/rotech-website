/**
 * Invoices Sync API
 */

import { NextRequest } from "next/server";
import { authenticateApiRequest, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  logApiAccess(request, "sync.invoices.list");

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

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return apiSuccess(invoices, {
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Invoice sync error:", error);
    return apiError("Failed to fetch invoices", "SYNC_ERROR", 500);
  }
}

// Create invoice from portal
export async function POST(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { 
      userId, 
      invoiceNumber, 
      amount, 
      tax, 
      description,
      dueDate,
      stripeInvoiceId,
      pdfUrl,
      status,
    } = body;

    if (!userId || !invoiceNumber || amount === undefined || tax === undefined) {
      return apiError("Missing required fields", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.invoices.create", { userId, invoiceNumber });

    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber,
        amount,
        tax,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        stripeInvoiceId,
        pdfUrl,
        status: status || "open",
      },
    });

    return apiSuccess(invoice);
  } catch (error) {
    console.error("Invoice create error:", error);
    return apiError("Failed to create invoice", "CREATE_ERROR", 500);
  }
}

// Update invoice status
export async function PATCH(request: NextRequest) {
  const authError = await authenticateApiRequest(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { invoiceId, status, paidAt, pdfUrl } = body;

    if (!invoiceId) {
      return apiError("invoiceId is required", "VALIDATION_ERROR", 400);
    }

    logApiAccess(request, "sync.invoices.update", { invoiceId, status });

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...(status && { status }),
        ...(paidAt && { paidAt: new Date(paidAt) }),
        ...(pdfUrl && { pdfUrl }),
      },
    });

    return apiSuccess(invoice);
  } catch (error) {
    console.error("Invoice update error:", error);
    return apiError("Failed to update invoice", "UPDATE_ERROR", 500);
  }
}
