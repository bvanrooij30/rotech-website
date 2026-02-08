import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Debug endpoint to check auth configuration
 * DELETE THIS IN PRODUCTION after debugging!
 */
export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    auth: {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authSecretLength: process.env.AUTH_SECRET?.length || 0,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL || "not set",
      hasJwtSecret: !!process.env.JWT_SECRET,
    },
    database: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "..." || "not set",
      connectionTest: "pending",
      userCount: 0,
    },
  };

  // Test database connection
  try {
    const userCount = await prisma.user.count();
    status.database.connectionTest = "success";
    status.database.userCount = userCount;
  } catch (error) {
    status.database.connectionTest = `failed: ${error instanceof Error ? error.message : "unknown error"}`;
  }

  return NextResponse.json(status);
}
