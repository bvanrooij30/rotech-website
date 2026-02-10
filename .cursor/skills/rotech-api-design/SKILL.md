---
name: rotech-api-design
description: Enterprise REST API design standaard voor RoTech klantprojecten en interne APIs. Gebruik bij het ontwerpen en bouwen van API routes, webhook endpoints, en externe integraties.
---

# RoTech API Design Standaard

## API Structuur (Next.js App Router)

```
src/app/api/
├── auth/                    # Authenticatie
│   ├── [...nextauth]/       # NextAuth handler
│   ├── register/            # Registratie
│   ├── verify-email/        # Email verificatie
│   └── mobile/              # Mobile app auth
├── admin/                   # Admin-only endpoints
│   ├── users/               # Gebruikersbeheer
│   └── subscriptions/       # Abonnementen
├── portal/                  # Klant portal endpoints
│   ├── account/             # Account beheer
│   ├── support/             # Support tickets
│   └── products/            # Klant producten
├── stripe/                  # Stripe integratie
│   ├── webhook/             # Stripe webhooks
│   ├── checkout/            # Checkout sessies
│   └── portal/              # Klant billing portal
├── v1/                      # Versioned external API
│   ├── sync/                # Data synchronisatie
│   └── webhook/             # Inkomende webhooks
└── contact/                 # Publieke endpoints
```

## Request/Response Standaard

### Succesvolle Response

```typescript
// 200 OK - Data ophalen
NextResponse.json({ data: result });

// 201 Created - Resource aangemaakt
NextResponse.json({ success: true, data: newResource }, { status: 201 });

// 204 No Content - Verwijdering
new NextResponse(null, { status: 204 });
```

### Error Response

```typescript
// Standaard error formaat
NextResponse.json(
  { error: "Nederlandse foutmelding voor de gebruiker" },
  { status: 400 }
);

// Met details (optioneel)
NextResponse.json(
  { error: "Validatie mislukt", details: validationErrors },
  { status: 422 }
);
```

### HTTP Status Codes

| Code | Gebruik |
|------|---------|
| 200 | Succesvol ophalen/updaten |
| 201 | Resource aangemaakt |
| 204 | Succesvol verwijderd |
| 400 | Ongeldige input |
| 401 | Niet geauthenticeerd |
| 403 | Geen rechten |
| 404 | Niet gevonden |
| 409 | Conflict (duplicate) |
| 422 | Validatie fout |
| 429 | Rate limit overschreden |
| 500 | Server fout |

## Input Validatie (Zod)

```typescript
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 tekens zijn"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().optional(),
  amount: z.number().positive("Bedrag moet positief zijn"),
});

// In route handler
const validated = schema.safeParse(body);
if (!validated.success) {
  return NextResponse.json(
    { error: validated.error.issues[0]?.message },
    { status: 400 }
  );
}
```

## Authenticatie Patronen

### Public Endpoint (geen auth)
```typescript
export async function GET() {
  // Iedereen mag dit aanroepen
}
```

### Protected Endpoint (ingelogde user)
```typescript
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  // Gebruik session.user.id / session.user.email
}
```

### Admin Endpoint
```typescript
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Geen admin rechten" }, { status: 403 });
  }
}
```

## Webhook Ontvangst Standaard

```typescript
export async function POST(request: NextRequest) {
  // 1. Lees raw body voor signature verificatie
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  
  // 2. Verifieer signature VOORDAT je parsed
  try {
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  // 3. Process idempotent (check of al verwerkt)
  // 4. Return 200 snel - doe zware verwerking async
  return NextResponse.json({ received: true });
}
```

## Rate Limiting

```typescript
import { isRateLimited, recordAttempt, rateLimitResponse } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateCheck = isRateLimited(clientIP, "api-endpoint");
  if (rateCheck.limited) {
    return rateLimitResponse(rateCheck.retryAfter!);
  }
  recordAttempt(clientIP, "api-endpoint");
  // ... handle request
}
```

## Error Handling

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... business logic
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    // Log server errors, toon generieke melding aan user
    console.error("[API] Error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden. Probeer het later opnieuw." },
      { status: 500 }
    );
  }
}
```
