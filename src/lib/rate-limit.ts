/**
 * Rate limiting utility for API routes
 * Prevents abuse and DDoS attacks
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for production, use Redis or similar)
const store: RateLimitStore = {};

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 requests per 15 minutes
};

/**
 * Rate limit check
 * Returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = defaultOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up old entries (simple cleanup)
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }
  
  // Initialize or get existing entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + options.windowMs,
    };
  }
  
  const entry = store[key];
  
  // Check if limit exceeded
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses IP address or forwarded IP
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || "unknown";
  
  return `rate-limit:${ip}`;
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(options: RateLimitOptions = defaultOptions) {
  return (request: Request): { allowed: boolean; remaining: number; resetTime: number } | null => {
    const identifier = getClientIdentifier(request);
    return checkRateLimit(identifier, options);
  };
}
