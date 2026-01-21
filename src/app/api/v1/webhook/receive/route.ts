/**
 * Webhook Receive Endpoint
 * 
 * Receives webhooks FROM the RoTech Portal to the website.
 * Used for:
 * - Ticket status updates from portal
 * - Subscription changes
 * - Customer data updates
 * 
 * POST /api/v1/webhook/receive
 */

import { NextRequest } from "next/server";
import { validateSignature, apiSuccess, apiError, logApiAccess } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.ROTECH_WEBHOOK_SECRET || "dev-webhook-secret";

export async function POST(request: NextRequest) {
  try {
    // Get signature from header
    const signature = request.headers.get("X-Webhook-Signature");
    const event = request.headers.get("X-Webhook-Event");
    
    if (!signature || !event) {
      return apiError("Missing webhook signature or event", "INVALID_WEBHOOK", 400);
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Verify signature
    if (!validateSignature(rawBody, signature, WEBHOOK_SECRET)) {
      logApiAccess(request, "webhook.invalid_signature", { event });
      return apiError("Invalid webhook signature", "INVALID_SIGNATURE", 401);
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    
    logApiAccess(request, `webhook.received.${event}`, { 
      event,
      dataKeys: Object.keys(payload.data || {}),
    });

    // Handle different event types
    switch (event) {
      case "ticket.status_updated":
        await handleTicketStatusUpdate(payload.data);
        break;
        
      case "ticket.message_added":
        await handleTicketMessage(payload.data);
        break;
        
      case "subscription.updated":
        await handleSubscriptionUpdate(payload.data);
        break;
        
      case "customer.updated":
        await handleCustomerUpdate(payload.data);
        break;

      case "product.status_updated":
        await handleProductStatusUpdate(payload.data);
        break;

      case "invoice.created":
        await handleInvoiceCreated(payload.data);
        break;

      default:
        console.log(`[Webhook] Unhandled event: ${event}`);
    }

    return apiSuccess({ received: true, event });
  } catch (error) {
    console.error("[Webhook] Processing error:", error);
    return apiError("Failed to process webhook", "PROCESSING_ERROR", 500);
  }
}

// Event handlers
async function handleTicketStatusUpdate(data: {
  ticketId: string;
  status: string;
  resolution?: string;
  resolvedBy?: string;
}) {
  const { ticketId, status, resolution, resolvedBy } = data;
  
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      ...(resolution && { 
        resolution,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || "portal",
      }),
    },
  });
}

async function handleTicketMessage(data: {
  ticketId: string;
  senderType: string;
  senderName: string;
  message: string;
}) {
  const { ticketId, senderType, senderName, message } = data;
  
  await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderType,
      senderName,
      message,
    },
  });

  // Update ticket status if support replied
  if (senderType === "support") {
    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "waiting_customer" },
    });
  }
}

async function handleSubscriptionUpdate(data: {
  subscriptionId: string;
  status?: string;
  hoursUsed?: number;
  currentPeriodEnd?: string;
}) {
  const { subscriptionId, status, hoursUsed, currentPeriodEnd } = data;
  
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...(status && { status }),
      ...(hoursUsed !== undefined && { hoursUsed }),
      ...(currentPeriodEnd && { currentPeriodEnd: new Date(currentPeriodEnd) }),
    },
  });
}

async function handleCustomerUpdate(data: {
  customerId: string;
  updates: Record<string, unknown>;
}) {
  const { customerId, updates } = data;
  
  // Only allow specific fields to be updated
  const allowedFields = ["phone", "companyName", "kvkNumber", "vatNumber", "street", "houseNumber", "postalCode", "city"];
  const safeUpdates: Record<string, unknown> = {};
  
  for (const field of allowedFields) {
    if (field in updates) {
      safeUpdates[field] = updates[field];
    }
  }
  
  if (Object.keys(safeUpdates).length > 0) {
    await prisma.user.update({
      where: { id: customerId },
      data: safeUpdates,
    });
  }
}

async function handleProductStatusUpdate(data: {
  productId: string;
  status: string;
  statusUpdate?: {
    title: string;
    message: string;
    type: string;
  };
}) {
  const { productId, status, statusUpdate } = data;
  
  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });

  if (statusUpdate) {
    await prisma.statusUpdate.create({
      data: {
        productId,
        title: statusUpdate.title,
        message: statusUpdate.message,
        type: statusUpdate.type,
        createdBy: "portal",
      },
    });
  }
}

async function handleInvoiceCreated(data: {
  userId: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  description?: string;
  dueDate?: string;
  stripeInvoiceId?: string;
  pdfUrl?: string;
}) {
  await prisma.invoice.create({
    data: {
      userId: data.userId,
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      tax: data.tax,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      stripeInvoiceId: data.stripeInvoiceId,
      pdfUrl: data.pdfUrl,
      status: "open",
    },
  });
}
