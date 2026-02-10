---
name: rotech-deployment
description: Enterprise deployment procedures voor Vercel + Supabase. Gebruik bij deployment issues, database configuratie, environment variables, en productie troubleshooting.
---

# RoTech Deployment Standaard

## Architectuur

```
[GitHub Repository] → [Vercel Build] → [Vercel Edge Network]
                                              ↓
                                    [Supabase PostgreSQL]
                                    (via PgBouncer Pooler)
```

## Supabase Database Configuratie

### Connection URLs

| URL | Gebruik | Poort |
|-----|---------|-------|
| `DATABASE_URL` | Runtime queries (via pooler) | 6543 |
| `DIRECT_URL` | Prisma migraties (direct) | 5432 |

### DATABASE_URL Format (Shared Pooler - IPv4 compatibel)

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### DIRECT_URL Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Kritieke Regels

1. **Gebruik ALTIJD de Shared Pooler** (niet Dedicated Pooler) - alleen Shared is IPv4 compatibel (Vercel vereist IPv4)
2. **`?pgbouncer=true` is VERPLICHT** in DATABASE_URL - voorkomt "prepared statement already exists" fouten
3. **Wachtwoorden ZONDER speciale tekens** (`!@#$%^&*`) in de URL - of URL-encode ze (`!` = `%21`)
4. **Prisma schema MOET `directUrl` hebben**:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Vercel Environment Variables

### Verplicht

| Variable | Voorbeeld | Omgeving |
|----------|-----------|----------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` | All |
| `DIRECT_URL` | `postgresql://...` (direct, poort 5432) | All |
| `AUTH_SECRET` | Random 44+ char base64 string | All |
| `NEXTAUTH_SECRET` | Zelfde als AUTH_SECRET | All |
| `NEXTAUTH_URL` | `https://ro-techdevelopment.dev` | Production |
| `JWT_SECRET` | Random string voor mobile auth | All |

### Optioneel maar aanbevolen

| Variable | Doel |
|----------|------|
| `STRIPE_SECRET_KEY` | Stripe betalingen |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verificatie |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side |
| `RESEND_API_KEY` | Email verzending |
| `OPENAI_API_KEY` | AI chatbot |
| `ADMIN_SETUP_KEY` | Admin account setup API |
| `CRON_SECRET` | Vercel cron job authenticatie |

### Na Wijzigen van Environment Variables

**ALTIJD een Redeploy doen!** Environment variables worden alleen bij deployment geladen.

## Pre-Deploy Checklist

```bash
# 1. Lokale build test
npm run build

# 2. TypeScript check
npm run typecheck

# 3. Lint check
npm run lint

# 4. Commit en push
git add -A
git commit -m "beschrijving"
git push origin main

# 5. Monitor Vercel deployment
# Check: https://vercel.com/dashboard
```

## Troubleshooting

### "prepared statement s1 already exists"

**Oorzaak:** PgBouncer Transaction Pooling conflicteert met Prisma prepared statements.
**Fix:** Voeg `?pgbouncer=true` toe aan DATABASE_URL.

### "Can't reach database server"

**Oorzaken:**
1. Verkeerde hostname/regio in DATABASE_URL
2. Database is gepauzeerd (Supabase pauzeert gratis DBs na 7 dagen)
3. Dedicated Pooler i.p.v. Shared Pooler (IPv4 issue)

**Fix:** Gebruik de Shared Pooler URL uit Supabase Connect dialog.

### "Configuration" error bij login

**Oorzaken:**
1. AUTH_SECRET ontbreekt
2. Database connectie faalt
3. NextAuth authorize() gooit een error i.p.v. null te retourneren

**Fix:** Check environment variables, database connectie, en auth.ts.

### Build faalt met TypeScript errors

**Fix:** Check lessons-learned.mdc voor bekende patronen.

## Database Migraties

```bash
# Schema naar database pushen (development)
npx prisma db push

# Prisma client regenereren
npx prisma generate

# Database inspecteren
npx prisma studio
```

## Admin Account Aanmaken op Productie

Via de Setup API:

```bash
curl -X POST https://ro-techdevelopment.dev/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"bart@rotech.dev","password":"...","name":"Bart van Rooij","setupKey":"[ADMIN_SETUP_KEY]"}'
```

Of via Supabase SQL Editor met een bcrypt-gehashed wachtwoord.
