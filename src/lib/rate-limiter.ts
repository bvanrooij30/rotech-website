/**
 * Rate Limiter for RoTech Development
 * In-memory rate limiting for authentication endpoints
 * For production: Consider using Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  lockedUntil?: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs?: number;
  lockoutAfter?: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && (!entry.lockedUntil || entry.lockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit configurations
export const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
    lockoutAfter: 5, // Lock after 5 failed attempts
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  verifyEmail: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check if an identifier (IP, email) is rate limited
 */
export function isRateLimited(
  identifier: string,
  type: RateLimitType
): { limited: boolean; retryAfter?: number; remaining?: number } {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  // Check if locked out
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return {
      limited: true,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }
  
  // Check if window expired, reset if so
  if (!entry || entry.resetAt < now) {
    return {
      limited: false,
      remaining: config.maxAttempts,
    };
  }
  
  // Check if over limit
  if (entry.count >= config.maxAttempts) {
    return {
      limited: true,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  
  return {
    limited: false,
    remaining: config.maxAttempts - entry.count,
  };
}

/**
 * Record an attempt for an identifier
 */
export function recordAttempt(identifier: string, type: RateLimitType): void {
  const config = RATE_LIMITS[type];
  const key = `${type}:${identifier}`;
  const now = Date.now();
  
  const entry = rateLimitStore.get(key);
  
  // If no entry or expired, create new
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return;
  }
  
  // Increment count
  entry.count++;
  
  // Check if should lock out (only for configs with lockout settings)
  if ('lockoutAfter' in config && 'lockoutMs' in config && 
      config.lockoutAfter && entry.count >= config.lockoutAfter && config.lockoutMs) {
    entry.lockedUntil = now + config.lockoutMs;
  }
  
  rateLimitStore.set(key, entry);
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string, type: RateLimitType): void {
  const key = `${type}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback - in production, always use proper headers
  return "unknown";
}

/**
 * Create a rate limit error response
 */
export function rateLimitResponse(retryAfter: number): Response {
  const minutes = Math.ceil(retryAfter / 60);
  
  return new Response(
    JSON.stringify({
      error: `Te veel pogingen. Probeer het over ${minutes} ${minutes === 1 ? 'minuut' : 'minuten'} opnieuw.`,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    }
  );
}
