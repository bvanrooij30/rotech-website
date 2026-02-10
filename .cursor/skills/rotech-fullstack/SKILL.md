---
name: rotech-fullstack
description: Enterprise-niveau Next.js 16 full-stack development standaard voor RoTech Development. Gebruik bij het bouwen van pagina's, componenten, API routes, server components, en client-side interacties. Activeer bij werken aan src/ bestanden.
---

# RoTech Full-Stack Development Standaard

## Tech Stack

| Laag | Technologie | Versie |
|------|-------------|--------|
| Framework | Next.js (App Router) | 16+ |
| Taal | TypeScript (strict) | 5+ |
| Styling | Tailwind CSS | v4 |
| Animaties | Framer Motion | 12+ |
| Forms | React Hook Form + Zod | Latest |
| Auth | NextAuth v5 (Auth.js) | 5.0.0-beta |
| Database | Prisma + PostgreSQL (Supabase) | 6+ |
| Payments | Stripe | Latest |
| Icons | Lucide React | Latest |
| State | Zustand (client), Server Components (server) | Latest |

## Server Components vs Client Components

### Server Components (default)

```typescript
// Geen "use client" directive = Server Component
// Kan direct database queries, auth checks, etc.
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function Page() {
  const session = await auth();
  const data = await prisma.user.findMany();
  return <div>{/* render data */}</div>;
}
```

Gebruik voor:
- Pagina's die data ophalen
- Layout components
- Auth checks
- Database queries

### Client Components

```typescript
"use client";
// Nodig voor: hooks, event handlers, browser APIs, animaties

import { useState } from "react";
import { motion } from "framer-motion";
```

Gebruik voor:
- Interactieve UI (forms, modals, dropdowns)
- Animaties (Framer Motion)
- Browser APIs (localStorage, window)
- State management (useState, useEffect)

## API Route Standaard

```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = requestSchema.parse(body);
    
    const result = await prisma.example.create({ data });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
```

Verplicht bij elke API route:
- Zod validatie op alle input
- try/catch error handling
- Correcte HTTP status codes
- Nederlandse foutmeldingen voor gebruikers

## Auth Patronen

### Server-side auth check

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");
  
  // User lookup: altijd email als fallback
  let user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user && session.user.email) {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  }
}
```

### Client-side auth check

```typescript
"use client";
import { useSession } from "next-auth/react";

export function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <Loader />;
  if (!session) return <LoginPrompt />;
  
  return <AuthenticatedContent user={session.user} />;
}
```

## Database Query Patronen (Supabase/PgBouncer)

Altijd error handling bij database queries:

```typescript
try {
  const result = await prisma.user.findMany();
  return result;
} catch {
  // PgBouncer kan prepared statement errors geven
  return [];
}
```

## Component Structuur

```
src/
├── app/                    # Pages (App Router)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── admin/              # Admin panel
│   ├── portal/             # Klantenportaal
│   └── api/                # API routes
├── components/
│   ├── layout/             # Header, Footer
│   ├── sections/           # Homepage secties
│   ├── ui/                 # Herbruikbare UI componenten
│   ├── forms/              # Form componenten
│   ├── portal/             # Portal-specifieke componenten
│   ├── admin/              # Admin-specifieke componenten
│   └── providers/          # Context providers
├── data/                   # Statische data (services, packages, etc.)
├── lib/                    # Utilities, auth, prisma, etc.
└── types/                  # TypeScript type definitions
```

## Naming Conventions

| Type | Patroon | Voorbeeld |
|------|---------|-----------|
| Component files | PascalCase | `UserProfile.tsx` |
| Pages | `page.tsx` in folder | `app/contact/page.tsx` |
| API routes | `route.ts` in folder | `app/api/users/route.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Data files | kebab-case | `blog-articles.ts` |
| Types | PascalCase | `UserRole`, `ApiResponse` |

## Performance Patronen

- Gebruik `loading.tsx` voor Suspense boundaries
- Gebruik `error.tsx` voor error boundaries per route
- Images altijd via `next/image` met width/height
- Dynamische imports voor zware componenten: `dynamic(() => import(...))`
- `export const dynamic = "force-dynamic"` voor auth-pagina's
