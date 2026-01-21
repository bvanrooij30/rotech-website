import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/tokens";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is verplicht"),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal 1 hoofdletter bevatten")
    .regex(/[a-z]/, "Wachtwoord moet minimaal 1 kleine letter bevatten")
    .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = resetPasswordSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0]?.message || "Validatie mislukt" },
        { status: 400 }
      );
    }
    
    const { token, password } = validatedData.data;
    
    // Verify token and get email
    const email = await verifyToken(token, "passwordReset");
    
    if (!email) {
      return NextResponse.json(
        { error: "Deze link is verlopen of ongeldig. Vraag een nieuwe wachtwoord reset aan." },
        { status: 400 }
      );
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Account niet gevonden." },
        { status: 404 }
      );
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(password);
    
    // Update password and invalidate all sessions
    await prisma.$transaction([
      // Update password
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }),
      // Delete all existing sessions (force re-login)
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);
    
    return NextResponse.json({
      success: true,
      message: "Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.",
    });
    
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}

// Verify token validity (GET request)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token ontbreekt" },
        { status: 400 }
      );
    }
    
    // Check if token exists and is not expired (without consuming it)
    const record = await prisma.verificationToken.findFirst({
      where: {
        token,
        identifier: { startsWith: "passwordReset:" },
        expires: { gt: new Date() },
      },
    });
    
    if (!record) {
      return NextResponse.json({
        valid: false,
        error: "Deze link is verlopen of ongeldig.",
      });
    }
    
    return NextResponse.json({ valid: true });
    
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Er is een fout opgetreden." },
      { status: 500 }
    );
  }
}
