import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createVerificationToken } from "@/lib/tokens";
import { isRateLimited, recordAttempt, getClientIP, rateLimitResponse } from "@/lib/rate-limiter";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const forgotPasswordSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres"),
});

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateCheck = isRateLimited(clientIP, "passwordReset");
    if (rateCheck.limited) {
      return rateLimitResponse(rateCheck.retryAfter!);
    }
    
    const body = await request.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0]?.message || "Ongeldig e-mailadres" },
        { status: 400 }
      );
    }
    
    const { email } = validatedData.data;
    
    // Record the attempt
    recordAttempt(clientIP, "passwordReset");
    
    // Find user (don't reveal if exists or not)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: "Als er een account bestaat met dit e-mailadres, ontvang je binnen enkele minuten een e-mail met instructies om je wachtwoord te resetten.",
    };
    
    if (!user) {
      return NextResponse.json(successResponse);
    }
    
    if (!user.isActive) {
      return NextResponse.json(successResponse);
    }
    
    // Generate reset token
    const token = await createVerificationToken(email.toLowerCase(), "passwordReset");
    
    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ro-techdevelopment.dev";
    const resetUrl = `${baseUrl}/portal/wachtwoord-resetten?token=${token}`;
    
    // Send reset email
    const fromEmail = process.env.EMAIL_FROM || "noreply@ro-techdevelopment.dev";
    
    await resend.emails.send({
      from: `RoTech Development <${fromEmail}>`,
      to: email,
      subject: "Wachtwoord resetten - RoTech Development",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Wachtwoord Resetten</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hallo ${user.name},</p>
            
            <p>Je hebt een verzoek ingediend om je wachtwoord te resetten voor je RoTech Development account.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                Wachtwoord Resetten
              </a>
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Deze link is <strong>1 uur</strong> geldig. Na deze tijd moet je een nieuwe reset aanvragen.
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Als je deze aanvraag niet hebt gedaan, kun je deze e-mail negeren. Je wachtwoord blijft ongewijzigd.
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
    
    return NextResponse.json(successResponse);
    
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
