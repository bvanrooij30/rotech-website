/**
 * Health Check API
 * 
 * GET /api/health - Check system health
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL ? "configured" : "MISSING",
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? "configured" : "MISSING",
        ADMIN_SETUP_KEY: !!process.env.ADMIN_SETUP_KEY ? "configured" : "MISSING",
      },
      database: "unknown",
    },
  };

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = "connected";
  } catch (error) {
    health.status = "degraded";
    health.checks.database = `error: ${error instanceof Error ? error.message : "unknown"}`;
  }

  return NextResponse.json(health, {
    status: health.status === "ok" ? 200 : 503,
  });
}
