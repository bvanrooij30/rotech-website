/**
 * API Authentication & Security
 * 
 * This module provides secure authentication for the internal API system
 * that connects the website with the RoTech Admin Portal.
 * 
 * Security measures:
 * - API key authentication (Bearer token)
 * - IP whitelist (optional)
 * - Rate limiting
 * - Request signing (HMAC)
 * - Audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

// Configuration - MUST be set in environment variables for production
const API_KEY = process.env.ROTECH_API_KEY;
const API_SECRET = process.env.ROTECH_API_SECRET;
const WEBHOOK_SECRET = process.env.ROTECH_WEBHOOK_SECRET;

// Log warnings if not configured (but don't crash - allows local dev without full setup)
if (process.env.NODE_ENV === 'production') {
  if (!API_KEY) console.error('ROTECH_API_KEY not configured');
  if (!API_SECRET) console.error('ROTECH_API_SECRET not configured');
  if (!WEBHOOK_SECRET) console.error('ROTECH_WEBHOOK_SECRET not configured');
}

// IP Whitelist (optional - set in env as comma-separated)
const IP_WHITELIST = process.env.API_IP_WHITELIST?.split(",").map(ip => ip.trim()) || [];

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_REQUESTS = 100; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export interface ApiAuthResult {
  authenticated: boolean;
  error?: string;
  clientId?: string;
}

/**
 * Validate API key from Authorization header
 */
export function validateApiKey(request: NextRequest): ApiAuthResult {
  // If API_KEY is not configured, deny access in production
  if (!API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      return { authenticated: false, error: "API authentication not configured" };
    }
    // In development, allow access without key for testing
    return { authenticated: true, clientId: "dev-mode" };
  }

  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader) {
    return { authenticated: false, error: "Missing Authorization header" };
  }

  const [type, key] = authHeader.split(" ");
  
  if (type !== "Bearer") {
    return { authenticated: false, error: "Invalid authorization type. Use Bearer token." };
  }

  if (!key || key !== API_KEY) {
    return { authenticated: false, error: "Invalid API key" };
  }

  return { authenticated: true, clientId: "rotech-portal" };
}

/**
 * Validate request signature (HMAC)
 * Use this for webhook callbacks to verify authenticity
 */
export function validateSignature(
  payload: string,
  signature: string,
  secret: string = API_SECRET || ''
): boolean {
  if (!secret) return false;
  try {
    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    
    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Generate signature for outgoing webhooks
 */
export function generateSignature(payload: string, secret: string = WEBHOOK_SECRET || ''): string {
  if (!secret) throw new Error('WEBHOOK_SECRET is required');
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Check IP whitelist
 */
export function checkIpWhitelist(request: NextRequest): boolean {
  if (IP_WHITELIST.length === 0) {
    return true; // No whitelist configured, allow all
  }

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || request.headers.get("x-real-ip")
    || "unknown";

  return IP_WHITELIST.includes(clientIp) || clientIp === "127.0.0.1" || clientIp === "::1";
}

/**
 * Rate limiting
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetAt - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - record.count, resetIn: record.resetAt - now };
}

/**
 * Full API authentication middleware
 */
export async function authenticateApiRequest(request: NextRequest): Promise<NextResponse | null> {
  // Check IP whitelist
  if (!checkIpWhitelist(request)) {
    return NextResponse.json(
      { error: "Access denied", code: "IP_NOT_ALLOWED" },
      { status: 403 }
    );
  }

  // Validate API key
  const authResult = validateApiKey(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { error: authResult.error, code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // Check rate limit
  const clientId = authResult.clientId || "unknown";
  const rateLimit = checkRateLimit(clientId);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: "Rate limit exceeded", 
        code: "RATE_LIMITED",
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      },
      { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000)),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
        }
      }
    );
  }

  // All checks passed
  return null;
}

/**
 * API response helpers
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function apiError(message: string, code: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { message, code },
      meta: { timestamp: new Date().toISOString() },
    },
    { status }
  );
}

/**
 * Audit log entry (in production, send to logging service)
 */
export function logApiAccess(
  request: NextRequest,
  action: string,
  details?: Record<string, unknown>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    method: request.method,
    path: request.nextUrl.pathname,
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent"),
    ...details,
  };

  // In production, send to logging service
  console.log("[API Access]", JSON.stringify(logEntry));
}

/**
 * Get webhook queue status
 * Returns pending webhooks and queue health
 */
export async function getWebhookQueueStatus(): Promise<{
  pending: number;
  failed: number;
  lastProcessed: string | null;
  healthy: boolean;
}> {
  // Placeholder - in production, this would query a Redis queue or database
  return {
    pending: 0,
    failed: 0,
    lastProcessed: new Date().toISOString(),
    healthy: true,
  };
}
