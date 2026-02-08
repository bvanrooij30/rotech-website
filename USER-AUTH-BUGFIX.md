# 🔧 USER AUTHENTICATION BUG FIXES

## Datum: 22 januari 2026

---

## 🐛 Bug 1: Database Provider Mismatch

### Probleem
Het Prisma schema wisselt tussen SQLite (lokaal) en PostgreSQL (productie).

### Oplossing
Gebruik een omgevingsafhankelijke provider met Prisma's datasource override:

**Stap 1:** Zet schema terug naar PostgreSQL (voor productie):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Stap 2:** Voeg lokale .env.local toe voor SQLite:
```env
DATABASE_URL="file:./dev.db"
```

**Stap 3:** Installeer SQLite adapter voor lokale dev:
```bash
npm install @prisma/adapter-sqlite better-sqlite3
```

**OF simpeler:** Gebruik PostgreSQL ook lokaal via Docker of een gratis Neon/Supabase database.

---

## 🐛 Bug 2: Ontbrekende AUTH_SECRET op Vercel

### Probleem
De AUTH_SECRET is niet geconfigureerd op Vercel.

### Oplossing
1. Ga naar https://vercel.com/dashboard
2. Selecteer je project → Settings → Environment Variables
3. Voeg toe (voor alle omgevingen: Production, Preview, Development):

| Variable | Value |
|----------|-------|
| `AUTH_SECRET` | `QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=` |
| `NEXTAUTH_SECRET` | `QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=` |
| `NEXTAUTH_URL` | `https://ro-techdevelopment.dev` |
| `JWT_SECRET` | `QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=` |

4. Redeploy de applicatie

---

## 🐛 Bug 3: JWT_SECRET voor Mobile Auth

### Probleem
Mobile API routes vereisen JWT_SECRET die niet is ingesteld.

### Oplossing
Voeg `JWT_SECRET` toe aan zowel `.env` als Vercel:

```env
JWT_SECRET="QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg="
```

---

## 🐛 Bug 4: Auth() zonder Error Handling

### Probleem
De auth() call in portal/layout.tsx faalt stil bij configuratieproblemen.

### Oplossing
Wrap de auth call in try-catch:

```typescript
// src/app/portal/layout.tsx
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  
  try {
    session = await auth();
  } catch (error) {
    console.error("Auth error:", error);
    // Continue without session - login page will still work
  }
  
  // ... rest of component
}
```

---

## 🐛 Bug 5: NextAuth v5 Beta

### Probleem
De beta versie kan instabiel zijn.

### Oplossing
Upgrade naar stable wanneer beschikbaar, of pin naar specifieke versie:

```json
"next-auth": "5.0.0-beta.30"
```

(zonder `^` om automatische updates te voorkomen)

---

## 📋 VOLLEDIGE VERCEL ENV VARS CHECKLIST

Zorg dat ALLE onderstaande variables zijn ingesteld op Vercel:

```
AUTH_SECRET=QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=
NEXTAUTH_SECRET=QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=
NEXTAUTH_URL=https://ro-techdevelopment.dev
JWT_SECRET=QC8k/ZcKezP92/EDUgNYW0UnwFO0QD1PWWzK9/3e9Gg=
DATABASE_URL=postgresql://...je-database-url...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🚀 QUICK FIX STAPPENPLAN

1. **Vercel Dashboard** → Environment Variables → Voeg alle bovenstaande toe
2. **Redeploy** de applicatie
3. **Test login** op https://ro-techdevelopment.dev/portal/login

Als het nog steeds niet werkt, check de Vercel Functions logs voor specifieke foutmeldingen.
