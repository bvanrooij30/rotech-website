import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { validateCSRF } from "@/lib/csrf";
import { storeFormSubmission } from "@/lib/forms-store";
import { webhooks } from "@/lib/webhook";

// HTML escape function for security
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Request size limit (1MB)
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Naam is verplicht (min. 2 karakters)").max(100),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().optional(),
  company: z.string().max(100).optional(),
  subject: z.string().min(1, "Selecteer een onderwerp"),
  message: z.string().min(20, "Bericht moet minimaal 20 karakters zijn").max(5000),
});

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfValidation = validateCSRF(request);
    if (!csrfValidation.valid) {
      return NextResponse.json(
        { error: "Ongeldige aanvraag" },
        { status: 403 }
      );
    }
    
    // Rate Limiting
    const rateLimitResult = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 requests per 15 minutes for contact form
    })(request);
    
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() : "900",
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimitResult ? rateLimitResult.remaining.toString() : "0",
            "X-RateLimit-Reset": rateLimitResult ? rateLimitResult.resetTime.toString() : Date.now().toString(),
          },
        }
      );
    }
    
    // Check request size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body te groot" },
        { status: 413 }
      );
    }
    
    // Parse body with size check
    const bodyText = await request.text();
    if (bodyText.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body te groot" },
        { status: 413 }
      );
    }
    
    const body = JSON.parse(bodyText);
    
    // Validate with Zod
    const validationResult = contactSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Ongeldige gegevens" },
        { status: 400 }
      );
    }

    const { name, email, phone, company, subject, message } = validationResult.data;

    // Store form submission for Admin Portal sync
    try {
      await storeFormSubmission({
        formType: "contact",
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        subject,
        message,
      });
    } catch (storeError) {
      console.error("Failed to store contact form:", storeError);
    }

    // Send webhook to portal (non-blocking)
    webhooks.contactSubmitted({
      name,
      email,
      phone: phone || "",
      company: company || "",
      subject,
      message,
      submittedAt: new Date().toISOString(),
    }).catch(err => console.error("Webhook failed:", err));

    // Send email using Resend (if configured)
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Escape all user input for HTML safety
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = phone ? escapeHtml(phone) : "Niet opgegeven";
        const safeCompany = company ? escapeHtml(company) : "Niet opgegeven";
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

        const fromEmail = process.env.FROM_EMAIL || "noreply@ro-techdevelopment.dev";

        // Send notification to owner
        await resend.emails.send({
          from: `Ro-Tech Website <${fromEmail}>`,
          to: process.env.CONTACT_EMAIL,
          subject: `Nieuw contactformulier: ${safeSubject}`,
          html: `
            <h2>Nieuw bericht via contactformulier</h2>
            <p><strong>Naam:</strong> ${safeName}</p>
            <p><strong>E-mail:</strong> ${safeEmail}</p>
            <p><strong>Telefoon:</strong> ${safePhone}</p>
            <p><strong>Bedrijf:</strong> ${safeCompany}</p>
            <p><strong>Onderwerp:</strong> ${safeSubject}</p>
            <p><strong>Bericht:</strong></p>
            <p>${safeMessage}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Dit bericht is verzonden via het contactformulier op ro-techdevelopment.dev
            </p>
          `,
          replyTo: email, // Allow direct reply to user
        });

        // Send confirmation to user
        await resend.emails.send({
          from: `Ro-Tech Development <${fromEmail}>`,
          to: email,
          subject: "Bedankt voor uw bericht - Ro-Tech Development",
          html: `
            <h2>Bedankt voor uw bericht!</h2>
            <p>Beste ${safeName},</p>
            <p>Wij hebben uw bericht ontvangen en nemen binnen 24 uur contact met u op.</p>
            <p><strong>Uw bericht:</strong></p>
            <p>${safeMessage}</p>
            <hr>
            <p>Heeft u in de tussentijd vragen? Neem gerust contact op via:</p>
            <ul>
              <li>E-mail: contact@ro-techdevelopment.dev</li>
              <li>Telefoon: +31 6 57 23 55 74</li>
              <li>WhatsApp: +31 6 57 23 55 74</li>
            </ul>
            <br>
            <p>Met vriendelijke groet,</p>
            <p><strong>Ro-Tech Development</strong></p>
            <p style="color: #666; font-size: 12px;">
              Kruisstraat 64, 5502 JG Veldhoven<br>
              KvK: 86858173 | BTW: NL004321198B83
            </p>
          `,
        });
      } catch (emailError) {
        // Log email error but don't fail the request
        if (process.env.NODE_ENV === "development") {
          console.error("Email sending failed:", emailError);
        }
        // Continue - form submission is still successful
      }
    }

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Contact form submission:", {
        name,
        email,
        phone,
        company,
        subject,
        message: message.substring(0, 50) + "...",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Contact form error:", error);
    }
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
