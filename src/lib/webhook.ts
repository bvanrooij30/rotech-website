/**
 * Webhook Service
 * 
 * Sends real-time notifications to the Ro-Tech Admin Portal
 * when events occur on the website.
 * 
 * Events:
 * - customer.created - New customer registration
 * - customer.updated - Customer profile updated
 * - ticket.created - New support ticket
 * - ticket.updated - Ticket status changed
 * - ticket.message - New message on ticket
 * - quote.requested - New quote request
 * - payment.completed - Payment successful
 * - subscription.created - New subscription
 * - subscription.cancelled - Subscription cancelled
 */

import { generateSignature } from "./api-auth";

const PORTAL_WEBHOOK_URL = process.env.ROTECH_PORTAL_WEBHOOK_URL;
const WEBHOOK_SECRET = process.env.ROTECH_WEBHOOK_SECRET || "dev-webhook-secret";
const WEBHOOK_TIMEOUT = 10000; // 10 seconds

export type WebhookEvent =
  | "customer.created"
  | "customer.updated"
  | "ticket.created"
  | "ticket.updated"
  | "ticket.message"
  | "quote.requested"
  | "payment.completed"
  | "subscription.created"
  | "subscription.cancelled"
  | "contact.submitted"
  | "lead.created";

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

interface WebhookResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  retryable?: boolean;
}

// Queue for failed webhooks (in production, use Redis/database)
const webhookQueue: Array<{ payload: WebhookPayload; attempts: number; nextRetry: number }> = [];
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

/**
 * Send webhook to the Admin Portal
 */
export async function sendWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<WebhookResult> {
  if (!PORTAL_WEBHOOK_URL) {
    console.log("[Webhook] No portal URL configured, skipping:", event);
    return { success: true }; // Silent success if not configured
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);
  const signature = generateSignature(payloadString, WEBHOOK_SECRET);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

    const response = await fetch(PORTAL_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
        "X-Webhook-Timestamp": payload.timestamp,
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log("[Webhook] Sent successfully:", event);
      return { success: true, statusCode: response.status };
    }

    // Check if retryable (5xx errors)
    const retryable = response.status >= 500;
    console.error("[Webhook] Failed:", event, response.status);
    
    if (retryable) {
      queueForRetry(payload);
    }

    return { 
      success: false, 
      statusCode: response.status, 
      error: `HTTP ${response.status}`,
      retryable,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Webhook] Error:", event, errorMessage);
    
    // Network errors are retryable
    queueForRetry(payload);
    
    return { 
      success: false, 
      error: errorMessage,
      retryable: true,
    };
  }
}

/**
 * Queue failed webhook for retry
 */
function queueForRetry(payload: WebhookPayload) {
  const existingIndex = webhookQueue.findIndex(
    (item) => JSON.stringify(item.payload) === JSON.stringify(payload)
  );

  if (existingIndex === -1) {
    webhookQueue.push({
      payload,
      attempts: 0,
      nextRetry: Date.now() + RETRY_DELAYS[0],
    });
  }
}

/**
 * Process webhook retry queue
 * Call this periodically (e.g., via cron)
 */
export async function processWebhookQueue(): Promise<number> {
  const now = Date.now();
  let processed = 0;

  for (let i = webhookQueue.length - 1; i >= 0; i--) {
    const item = webhookQueue[i];
    
    if (now < item.nextRetry) continue;
    
    item.attempts++;
    const result = await sendWebhook(item.payload.event, item.payload.data);

    if (result.success || item.attempts >= MAX_RETRIES) {
      webhookQueue.splice(i, 1);
      processed++;
    } else {
      item.nextRetry = now + (RETRY_DELAYS[item.attempts] || RETRY_DELAYS[RETRY_DELAYS.length - 1]);
    }
  }

  return processed;
}

/**
 * Get webhook queue status
 */
export function getWebhookQueueStatus() {
  return {
    pending: webhookQueue.length,
    items: webhookQueue.map((item) => ({
      event: item.payload.event,
      attempts: item.attempts,
      nextRetry: new Date(item.nextRetry).toISOString(),
    })),
  };
}

// Helper functions for common webhook events
export const webhooks = {
  async customerCreated(customer: { id: string; email: string; name: string; [key: string]: unknown }) {
    return sendWebhook("customer.created", customer);
  },

  async ticketCreated(ticket: { 
    id: string; 
    ticketNumber: string; 
    subject: string; 
    customerEmail: string;
    [key: string]: unknown 
  }) {
    return sendWebhook("ticket.created", ticket);
  },

  async ticketMessage(message: {
    ticketId: string;
    ticketNumber: string;
    senderType: string;
    message: string;
    [key: string]: unknown;
  }) {
    return sendWebhook("ticket.message", message);
  },

  async quoteRequested(quote: {
    id: string;
    customerEmail: string;
    customerName: string;
    features: string[];
    totalPrice: number;
    [key: string]: unknown;
  }) {
    return sendWebhook("quote.requested", quote);
  },

  async paymentCompleted(payment: {
    id: string;
    amount: number;
    customerEmail: string;
    [key: string]: unknown;
  }) {
    return sendWebhook("payment.completed", payment);
  },

  async contactSubmitted(contact: {
    name: string;
    email: string;
    subject: string;
    message: string;
    [key: string]: unknown;
  }) {
    return sendWebhook("contact.submitted", contact);
  },

  async leadCreated(lead: {
    id: string;
    email: string;
    source: string;
    [key: string]: unknown;
  }) {
    return sendWebhook("lead.created", lead);
  },
};
