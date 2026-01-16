import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { validateCSRF } from "@/lib/csrf";

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

// Request size limit (2MB for offerte form - larger than contact)
const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB

// Offerte form validation schema
const offerteSchema = z.object({
  name: z.string().min(2, "Naam is verplicht").max(100),
  email: z.string().email("Voer een geldig e-mailadres in"),
  phone: z.string().min(10, "Voer een geldig telefoonnummer in").max(20),
  company: z.string().max(100).optional(),
  projectType: z.enum(["website", "webshop", "webapp", "app", "andere"]),
  currentWebsite: z.string().url("Voer een geldige URL in").optional().or(z.literal("")),
  description: z.string().min(20, "Beschrijf uw project in minimaal 20 karakters").max(5000),
  features: z.array(z.string()).optional(),
  deadline: z.string().max(200).optional(),
  budgetRange: z.enum([
    "< €2.500",
    "€2.500 - €5.000",
    "€5.000 - €10.000",
    "€10.000 - €20.000",
    "> €20.000",
    "Weet ik nog niet",
  ]),
  howDidYouFindUs: z.string().max(100).optional(),
  additionalInfo: z.string().max(2000).optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: "U moet akkoord gaan met het privacybeleid",
  }),
});

type OfferteFormData = z.infer<typeof offerteSchema>;

// Project type labels
const projectTypeLabels: Record<string, string> = {
  website: "Website",
  webshop: "Webshop",
  webapp: "Web Applicatie",
  app: "Mobile App",
  andere: "Anders",
};

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
    
    // Rate Limiting (more lenient for offerte form)
    const rateLimitResult = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 3, // 3 requests per 15 minutes for offerte form
    })(request);
    
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult ? Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() : "900",
            "X-RateLimit-Limit": "3",
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
    const validationResult = offerteSchema.safeParse(body);
    
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Ongeldige gegevens" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      company,
      projectType,
      currentWebsite,
      description,
      features,
      deadline,
      budgetRange,
      howDidYouFindUs,
      additionalInfo,
    } = validationResult.data;

    // Send email using Resend (if configured)
    if (process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        // Escape all user input for HTML safety
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safePhone = escapeHtml(phone);
        const safeCompany = company ? escapeHtml(company) : "Niet opgegeven";
        const safeCurrentWebsite = currentWebsite ? escapeHtml(currentWebsite) : "Niet opgegeven";
        const safeDescription = escapeHtml(description).replace(/\n/g, "<br>");
        const safeFeatures = features && features.length > 0 
          ? features.map(escapeHtml).join(", ") 
          : "Geen geselecteerd";
        const safeDeadline = deadline ? escapeHtml(deadline) : "Niet opgegeven";
        const safeBudgetRange = escapeHtml(budgetRange);
        const safeHowDidYouFindUs = howDidYouFindUs ? escapeHtml(howDidYouFindUs) : "Niet opgegeven";
        const safeAdditionalInfo = additionalInfo ? escapeHtml(additionalInfo) : "Geen";

        const fromEmail = process.env.FROM_EMAIL || "noreply@ro-techdevelopment.com";

        // Send notification to owner
        await resend.emails.send({
          from: `Ro-Tech Website <${fromEmail}>`,
          to: process.env.CONTACT_EMAIL,
          subject: `Nieuwe offerte aanvraag: ${projectTypeLabels[projectType]}`,
          html: `
            <h2>Nieuwe offerte aanvraag</h2>
            
            <h3>Contactgegevens</h3>
            <p><strong>Naam:</strong> ${safeName}</p>
            <p><strong>E-mail:</strong> ${safeEmail}</p>
            <p><strong>Telefoon:</strong> ${safePhone}</p>
            <p><strong>Bedrijf:</strong> ${safeCompany}</p>
            
            <h3>Project Details</h3>
            <p><strong>Type:</strong> ${projectTypeLabels[projectType]}</p>
            <p><strong>Huidige website:</strong> ${safeCurrentWebsite}</p>
            <p><strong>Omschrijving:</strong></p>
            <p>${safeDescription}</p>
            <p><strong>Gewenste features:</strong> ${safeFeatures}</p>
            <p><strong>Deadline:</strong> ${safeDeadline}</p>
            
            <h3>Budget & Extra</h3>
            <p><strong>Budget:</strong> ${safeBudgetRange}</p>
            <p><strong>Gevonden via:</strong> ${safeHowDidYouFindUs}</p>
            <p><strong>Opmerkingen:</strong> ${safeAdditionalInfo}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Dit bericht is verzonden via het offerte formulier op ro-techdevelopment.com<br>
              <a href="mailto:${safeEmail}">Reageer direct</a>
            </p>
          `,
          replyTo: email, // Allow direct reply to user
        });

        // Send confirmation to user
        await resend.emails.send({
          from: `Ro-Tech Development <${fromEmail}>`,
          to: email,
          subject: "Uw offerte aanvraag is ontvangen - Ro-Tech Development",
          html: `
            <h2>Bedankt voor uw offerte aanvraag!</h2>
            <p>Beste ${safeName},</p>
            <p>Wij hebben uw offerte aanvraag voor een <strong>${projectTypeLabels[projectType].toLowerCase()}</strong> ontvangen.</p>
            <p>Binnen 24 uur nemen wij contact met u op om uw project te bespreken en een gepersonaliseerde offerte te presenteren.</p>
            
            <h3>Uw aanvraag samenvatting:</h3>
            <ul>
              <li><strong>Type project:</strong> ${projectTypeLabels[projectType]}</li>
              <li><strong>Budget indicatie:</strong> ${safeBudgetRange}</li>
              ${deadline ? `<li><strong>Gewenste deadline:</strong> ${safeDeadline}</li>` : ""}
            </ul>
            
            <p>Heeft u in de tussentijd vragen? Neem gerust contact op via:</p>
            <ul>
              <li>E-mail: <a href="mailto:contact@ro-techdevelopment.com">contact@ro-techdevelopment.com</a></li>
              <li>Telefoon: <a href="tel:+31657235574">+31 6 57 23 55 74</a></li>
              <li>WhatsApp: <a href="https://wa.me/31657235574">+31 6 57 23 55 74</a></li>
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
      console.log("Offerte form submission:", {
        name,
        email,
        phone,
        company,
        projectType,
        currentWebsite,
        description: description.substring(0, 50) + "...",
        features,
        deadline,
        budgetRange,
        howDidYouFindUs,
        additionalInfo: additionalInfo?.substring(0, 50) + "...",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Offerte form error:", error);
    }
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
