import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for security and request handling
 * Runs on every request before the page/API route is processed
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers are handled in next.config.ts
  // But we can add additional headers here if needed
  
  // Add security headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Additional API-specific headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    
    // CORS headers (if needed for external access)
    // For now, we only allow same-origin requests
    const origin = request.headers.get("origin");
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.com";
    
    if (origin && origin === expectedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      response.headers.set("Access-Control-Max-Age", "86400");
    }
  }
  
  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
