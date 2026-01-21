import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, createVerificationToken } from "@/lib/tokens";
import { isRateLimited, recordAttempt, getClientIP, rateLimitResponse } from "@/lib/rate-limiter";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify email with token (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return NextResponse.redirect(new URL("/portal/login?error=invalid_token", request.url));
    }
    
    // Verify token and get email
    const email = await verifyToken(token, "emailVerification");
    
    if (!email) {
      return NextResponse.redirect(new URL("/portal/login?error=expired_token", request.url));
    }
    
    // Update user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
    
    // Redirect to login with success message
    return NextResponse.redirect(new URL("/portal/login?verified=true", request.url));
    
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/portal/login?error=verification_failed", request.url));
  }
}

// Resend verification email (POST)
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateCheck = isRateLimited(clientIP, "verifyEmail");
    if (rateCheck.limited) {
      return rateLimitResponse(rateCheck.retryAfter!);
    }
    
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: "E-mailadres is verplicht" },
        { status: 400 }
      );
    }
    
    // Record the attempt
    recordAttempt(clientIP, "verifyEmail");
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    
    // Always return success to prevent enumeration
    const successResponse = {
      success: true,
      message: "Als je account nog niet geverifieerd is, ontvang je binnen enkele minuten een nieuwe verificatie e-mail.",
    };
    
    if (!user) {
      return NextResponse.json(successResponse);
    }
    
    if (user.emailVerified) {
      return NextResponse.json(successResponse);
    }
    
    // Generate verification token
    const token = await createVerificationToken(email.toLowerCase(), "emailVerification");
    
    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ro-techdevelopment.dev";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    
    // Send verification email
    const fromEmail = process.env.EMAIL_FROM || "noreply@ro-techdevelopment.dev";
    
    await resend.emails.send({
      from: `RoTech Development <${fromEmail}>`,
      to: email,
      subject: "Bevestig je e-mailadres - RoTech Development",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">E-mailadres Bevestigen</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p>Hallo ${user.name},</p>
            
            <p>Bedankt voor je registratie bij RoTech Development! Klik op de onderstaande knop om je e-mailadres te bevestigen.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">
                E-mailadres Bevestigen
              </a>
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Deze link is <strong>24 uur</strong> geldig.
            </p>
            
            <p style="font-size: 14px; color: #64748b;">
              Als je je niet hebt geregistreerd bij RoTech Development, kun je deze e-mail negeren.
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
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
