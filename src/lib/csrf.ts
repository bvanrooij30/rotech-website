/**
 * CSRF (Cross-Site Request Forgery) protection
 * 
 * For Next.js API routes, we use SameSite cookies and Origin header validation
 */

import { NextRequest } from "next/server";

/**
 * Validate CSRF token or Origin header
 * For form submissions, we validate the Origin header
 */
export function validateCSRF(request: NextRequest): { valid: boolean; reason?: string } {
  // Get origin from request
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  
  // Get expected origin from environment
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.com";
  const expectedHost = new URL(expectedOrigin).host;
  
  // For same-origin requests, origin might be null (browser behavior)
  // In that case, check referer
  if (!origin && !referer) {
    // This could be a legitimate same-origin request or a malicious request
    // In production, we should be more strict
    if (process.env.NODE_ENV === "production") {
      return {
        valid: false,
        reason: "Missing Origin and Referer headers",
      };
    }
    // In development, allow (for testing)
    return { valid: true };
  }
  
  // Validate origin if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const expectedUrl = new URL(expectedOrigin);
      
      // Check if origin matches expected origin
      if (originUrl.host !== expectedUrl.host) {
        return {
          valid: false,
          reason: `Origin mismatch: ${originUrl.host} !== ${expectedUrl.host}`,
        };
      }
    } catch (error) {
      return {
        valid: false,
        reason: "Invalid Origin header format",
      };
    }
  }
  
  // Validate referer if origin is not present
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      const expectedUrl = new URL(expectedOrigin);
      
      if (refererUrl.host !== expectedUrl.host) {
        return {
          valid: false,
          reason: `Referer mismatch: ${refererUrl.host} !== ${expectedUrl.host}`,
        };
      }
    } catch (error) {
      return {
        valid: false,
        reason: "Invalid Referer header format",
      };
    }
  }
  
  return { valid: true };
}

/**
 * Check if request is from same origin
 */
export function isSameOrigin(request: NextRequest): boolean {
  const result = validateCSRF(request);
  return result.valid;
}
