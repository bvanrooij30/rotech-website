import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/portal",
  "/admin",
  "/dashboard",
];

// Routes that should redirect to portal if already authenticated
const authRoutes = [
  "/portal/login",
  "/portal/registreren",
  "/portal/wachtwoord-vergeten",
  "/portal/wachtwoord-resetten",
];

/**
 * Check if user has a valid session token
 * Uses lightweight cookie check instead of full auth import to stay under Edge Function size limit
 */
function hasSessionToken(request: NextRequest): boolean {
  // NextAuth v5 uses authjs.session-token cookie
  const sessionToken = request.cookies.get("authjs.session-token")?.value ||
                       request.cookies.get("__Secure-authjs.session-token")?.value;
  return !!sessionToken;
}

/**
 * Middleware for security, authentication, and request handling
 * Runs on every request before the page/API route is processed
 * 
 * Note: Full session validation happens in the page/API route.
 * Middleware only does a lightweight token presence check.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route) && !authRoutes.some((authRoute) => pathname.startsWith(authRoute))
  );
  
  // Check if route is an auth route (login, register, etc.)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  // Check for session token (lightweight check)
  const hasSession = hasSessionToken(request);
  
  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/portal/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth routes
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }
  
  // Note: Admin role check happens in the admin pages themselves
  // since we can't decode JWT in Edge without the full auth library
  
  const response = NextResponse.next();
  
  // Add security headers for API routes
  if (pathname.startsWith("/api/")) {
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    
    // CORS headers
    const origin = request.headers.get("origin");
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://ro-techdevelopment.dev";
    
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
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
