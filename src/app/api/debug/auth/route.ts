import { NextResponse } from "next/server";

export async function GET() {
  // Check auth configuration
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  
  // Test database connection
  let dbStatus = "unknown";
  let dbError = null;
  
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$connect();
    const userCount = await prisma.user.count();
    dbStatus = `connected (${userCount} users)`;
    await prisma.$disconnect();
  } catch (error) {
    dbStatus = "failed";
    dbError = error instanceof Error ? error.message : String(error);
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    auth: {
      hasAuthSecret: !!authSecret,
      authSecretLength: authSecret?.length || 0,
      authSecretPreview: authSecret ? `${authSecret.substring(0, 4)}...` : null,
    },
    database: {
      hasUrl: !!databaseUrl,
      urlPrefix: databaseUrl?.substring(0, 15) || null,
      status: dbStatus,
      error: dbError,
    },
    envVars: {
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      DATABASE_URL: !!process.env.DATABASE_URL,
      AUTH_URL: !!process.env.AUTH_URL,
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    }
  });
}
