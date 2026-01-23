/**
 * Admin Setup API
 * 
 * POST /api/setup/admin - Create initial super_admin account
 * 
 * Security:
 * - Requires ADMIN_SETUP_KEY environment variable
 * - Only works if no super_admin exists OR correct setup key is provided
 * - Logs all setup attempts
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters zijn"),
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
  setupKey: z.string().min(1, "Setup key is verplicht"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = setupSchema.parse(body);

    // Verify setup key
    const validSetupKey = process.env.ADMIN_SETUP_KEY;
    
    if (!validSetupKey) {
      console.error("[SETUP] ADMIN_SETUP_KEY not configured");
      return NextResponse.json(
        { error: "Setup is niet geconfigureerd. Voeg ADMIN_SETUP_KEY toe aan environment variables." },
        { status: 500 }
      );
    }

    if (data.setupKey !== validSetupKey) {
      console.warn(`[SETUP] Invalid setup key attempt from IP: ${request.headers.get("x-forwarded-for") || "unknown"}`);
      return NextResponse.json(
        { error: "Ongeldige setup key" },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      // If user exists, upgrade to super_admin if needed
      if (existingUser.role === "super_admin") {
        return NextResponse.json(
          { error: "Deze gebruiker is al super_admin" },
          { status: 400 }
        );
      }

      // Upgrade existing user to super_admin and update password
      const hashedPassword = await hashPassword(data.password);
      
      await prisma.user.update({
        where: { email: data.email.toLowerCase() },
        data: {
          role: "super_admin",
          password: hashedPassword,
          isActive: true,
          emailVerified: new Date(),
        },
      });

      console.log(`[SETUP] User ${data.email} upgraded to super_admin`);

      return NextResponse.json({
        success: true,
        message: "Bestaande gebruiker geüpgraded naar super_admin",
        email: data.email,
      });
    }

    // Create new super_admin
    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: "super_admin",
        isActive: true,
        emailVerified: new Date(),
      },
    });

    console.log(`[SETUP] New super_admin created: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: "Super admin account aangemaakt",
      email: user.email,
      name: user.name,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("[SETUP] Error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

// GET endpoint to check setup status
export async function GET() {
  try {
    // Check if any super_admin exists
    const superAdminCount = await prisma.user.count({
      where: { role: "super_admin" },
    });

    const adminCount = await prisma.user.count({
      where: { role: "admin" },
    });

    const userCount = await prisma.user.count();

    return NextResponse.json({
      setupRequired: superAdminCount === 0,
      stats: {
        totalUsers: userCount,
        superAdmins: superAdminCount,
        admins: adminCount,
      },
    });
  } catch (error) {
    console.error("[SETUP] Check error:", error);
    return NextResponse.json(
      { error: "Database connectie fout" },
      { status: 500 }
    );
  }
}
