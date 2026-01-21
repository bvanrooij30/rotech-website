import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { createVerificationToken } from "@/lib/tokens";
import { isRateLimited, recordAttempt, getClientIP, rateLimitResponse } from "@/lib/rate-limiter";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const registerSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
  email: z.string().email("Ongeldig e-mailadres"),
  password: z
    .string()
    .min(8, "Wachtwoord moet minimaal 8 tekens zijn")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal 1 hoofdletter bevatten")
    .regex(/[a-z]/, "Wachtwoord moet minimaal 1 kleine letter bevatten")
    .regex(/[0-9]/, "Wachtwoord moet minimaal 1 cijfer bevatten"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  kvkNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateCheck = isRateLimited(clientIP, "register");
    if (rateCheck.limited) {
      return rateLimitResponse(rateCheck.retryAfter!);
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.safeParse(body);
    if (!validatedData.success) {
      const firstError = validatedData.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validatie mislukt" },
        { status: 400 }
      );
    }
    
    const { name, email, password, phone, companyName, kvkNumber } = validatedData.data;
    const normalizedEmail = email.toLowerCase();
    
    // Record the attempt
    recordAttempt(clientIP, "register");
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        companyName,
        kvkNumber,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    // Generate verification token and send email
    try {
      const token = await createVerificationToken(normalizedEmail, "emailVerification");
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ro-techdevelopment.dev";
      const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
      const fromEmail = process.env.EMAIL_FROM || "noreply@ro-techdevelopment.dev";
      
      await resend.emails.send({
        from: `RoTech Development <${fromEmail}>`,
        to: normalizedEmail,
        subject: "Welkom bij RoTech Development - Bevestig je e-mailadres",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Welkom bij RoTech Development!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p>Hallo ${name},</p>
              
              <p>Bedankt voor je registratie! Klik op de onderstaande knop om je e-mailadres te bevestigen en toegang te krijgen tot je klantenportaal.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                  E-mailadres Bevestigen
                </a>
              </p>
              
              <p style="font-size: 14px; color: #64748b;">
                Deze link is <strong>24 uur</strong> geldig.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                RoTech Development<br>
                Veldhoven, Nederland<br>
                <a href="https://ro-techdevelopment.dev" style="color: #6366f1;">ro-techdevelopment.dev</a>
              </p>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      // Log error but don't fail registration
      logger.error("Failed to send verification email", "Auth", emailError);
    }
    
    return NextResponse.json({
      success: true,
      message: "Account succesvol aangemaakt. Check je e-mail om je account te bevestigen.",
      user,
      requiresVerification: true,
    });
    
  } catch (error) {
    logger.error("Registration error", "Auth", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
