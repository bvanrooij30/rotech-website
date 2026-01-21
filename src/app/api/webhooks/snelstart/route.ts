import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import crypto from "crypto";

/**
 * Snelstart Webhook Endpoint
 * 
 * Receives webhooks from Snelstart B2B API for:
 * - Invoice status updates
 * - Relatie (customer) changes
 * - Payment confirmations
 * 
 * Note: Configure this URL in Snelstart API settings:
 * https://ro-techdevelopment.dev/api/webhooks/snelstart
 */

// Snelstart webhook secret for signature verification (if provided)
const SNELSTART_WEBHOOK_SECRET = process.env.SNELSTART_WEBHOOK_SECRET;

/**
 * Verify Snelstart webhook signature
 * Note: Implement based on Snelstart's actual signature method
 */
function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    return true; // Skip verification if not configured
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Snelstart webhook event types
 */
type SnelstartEventType =
  | "relatie.created"
  | "relatie.updated"
  | "relatie.deleted"
  | "verkoopboeking.created"
  | "verkoopboeking.updated"
  | "verkoopboeking.deleted"
  | "inkoopboeking.created"
  | "inkoopboeking.updated"
  | "betaling.ontvangen"
  | "test";

interface SnelstartWebhookEvent {
  type: SnelstartEventType;
  timestamp: string;
  data: {
    id: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Read raw body for signature verification
    const body = await request.text();

    // Get signature from headers (adjust header name based on Snelstart docs)
    const signature =
      request.headers.get("X-Snelstart-Signature") ||
      request.headers.get("X-Webhook-Signature");

    // Verify signature if secret is configured
    if (SNELSTART_WEBHOOK_SECRET) {
      if (!verifySignature(body, signature, SNELSTART_WEBHOOK_SECRET)) {
        logger.error("Snelstart webhook signature verification failed", "SnelstartWebhook");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Parse event
    let event: SnelstartWebhookEvent;
    try {
      event = JSON.parse(body) as SnelstartWebhookEvent;
    } catch {
      logger.error("Invalid JSON in Snelstart webhook", "SnelstartWebhook");
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }

    logger.info(
      `Received Snelstart webhook: ${event.type}`,
      "SnelstartWebhook",
      { eventType: event.type, dataId: event.data?.id }
    );

    // Handle different event types
    switch (event.type) {
      case "relatie.created":
        await handleRelatieCreated(event.data);
        break;

      case "relatie.updated":
        await handleRelatieUpdated(event.data);
        break;

      case "verkoopboeking.created":
        await handleVerkoopboekingCreated(event.data);
        break;

      case "verkoopboeking.updated":
        await handleVerkoopboekingUpdated(event.data);
        break;

      case "betaling.ontvangen":
        await handleBetalingOntvangen(event.data);
        break;

      case "test":
        logger.info("Snelstart test webhook received", "SnelstartWebhook");
        break;

      default:
        logger.info(
          `Unhandled Snelstart event type: ${event.type}`,
          "SnelstartWebhook"
        );
    }

    const duration = Date.now() - startTime;
    logger.info(
      `Snelstart webhook processed in ${duration}ms`,
      "SnelstartWebhook"
    );

    // Always return 200 to acknowledge receipt
    return NextResponse.json({
      received: true,
      type: event.type,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Snelstart webhook error", "SnelstartWebhook", error);

    // Still return 200 to prevent retries for unrecoverable errors
    return NextResponse.json({
      received: true,
      error: "Processing error - logged for investigation",
    });
  }
}

// =============================================================================
// Event Handlers
// =============================================================================

async function handleRelatieCreated(data: { id: string; [key: string]: unknown }) {
  logger.info(`Relatie created in Snelstart: ${data.id}`, "SnelstartWebhook");

  // TODO: Sync back to Admin Portal if needed
  // This could update customer records or create new ones
}

async function handleRelatieUpdated(data: { id: string; [key: string]: unknown }) {
  logger.info(`Relatie updated in Snelstart: ${data.id}`, "SnelstartWebhook");

  // TODO: Sync changes back to Admin Portal
}

async function handleVerkoopboekingCreated(data: { id: string; [key: string]: unknown }) {
  logger.info(
    `Verkoopboeking created in Snelstart: ${data.id}`,
    "SnelstartWebhook"
  );

  // This confirms our invoice was successfully created in Snelstart
  // Could update local invoice status
}

async function handleVerkoopboekingUpdated(data: { id: string; [key: string]: unknown }) {
  logger.info(
    `Verkoopboeking updated in Snelstart: ${data.id}`,
    "SnelstartWebhook"
  );

  // Handle status changes (e.g., payment received)
}

async function handleBetalingOntvangen(data: { id: string; [key: string]: unknown }) {
  logger.info(`Betaling ontvangen in Snelstart: ${data.id}`, "SnelstartWebhook");

  // Payment was recorded in Snelstart
  // Could mark invoice as paid in our system
}

// =============================================================================
// GET handler for testing
// =============================================================================

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Snelstart Webhook",
    description:
      "This endpoint receives webhooks from Snelstart B2B API. Configure in Snelstart API settings.",
    configured: !!SNELSTART_WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  });
}
