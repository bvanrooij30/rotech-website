# ⚙️ MASTER PROMPT: MAATWERK WEB APPLICATIE

## Pakket Informatie
- **Pakket:** Maatwerk (Custom Web Applicatie)
- **Prijsrange:** Vanaf €9.995
- **Doorlooptijd:** In overleg (6-12+ weken typisch)
- **Complexiteit:** Hoog - Volledig op specificatie

---

## 📋 KLANTGEGEVENS

```
=== BEDRIJFSINFORMATIE ===
BEDRIJFSNAAM: [Invullen]
CONTACTPERSOON: [Invullen]
FUNCTIE: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]

=== PROJECT STAKEHOLDERS ===
BESLISSER: [Naam + rol]
TECHNISCH CONTACT: [Naam - indien anders]
EINDGEBRUIKERS: [Wie gaat de applicatie gebruiken?]
```

---

## 🎯 PROJECT DEFINITIE (CRUCIAAL - GRONDIG INVULLEN)

```
=== PROBLEEMSTELLING ===
Welk probleem lost deze applicatie op?
[Gedetailleerde beschrijving van het huidige probleem/pijnpunt]

=== HUIDIGE SITUATIE ===
Hoe wordt dit nu opgelost?
- [ ] Handmatig (Excel, papier, etc.)
- [ ] Bestaande software: [Welke?]
- [ ] Helemaal niet
Wat zijn de beperkingen van de huidige oplossing?
[Beschrijving]

=== GEWENSTE SITUATIE ===
Wat moet de applicatie bereiken?
[Concrete doelen en gewenste uitkomsten]

=== SUCCES CRITERIA ===
Wanneer is het project geslaagd?
1. [Meetbaar criterium 1]
2. [Meetbaar criterium 2]
3. [Meetbaar criterium 3]
```

---

## 👥 GEBRUIKERS & ROLLEN

```
=== GEBRUIKERSROLLEN ===
Definieer alle gebruikerstypen:

ROL 1: [Naam, bijv: "Admin"]
- Beschrijving: [Wie is dit?]
- Aantal gebruikers: [Schatting]
- Belangrijkste taken:
  1. [Taak]
  2. [Taak]
  3. [Taak]

ROL 2: [Naam, bijv: "Medewerker"]
- Beschrijving:
- Aantal gebruikers:
- Belangrijkste taken:
  1. [Taak]
  2. [Taak]

ROL 3: [Naam, bijv: "Klant"]
- Beschrijving:
- Aantal gebruikers:
- Belangrijkste taken:
  1. [Taak]
  2. [Taak]

=== AUTHENTICATIE ===
- [ ] Email + wachtwoord
- [ ] Magic link (passwordless)
- [ ] OAuth (Google, Microsoft)
- [ ] SSO (SAML)
- [ ] 2FA vereist

=== AUTORISATIE ===
Welke rol mag wat?
| Actie | Admin | Medewerker | Klant |
|-------|-------|------------|-------|
| [Actie 1] | ✅ | ✅ | ❌ |
| [Actie 2] | ✅ | ❌ | ❌ |
| etc. | | | |
```

---

## 📱 FUNCTIONELE REQUIREMENTS

```
=== CORE FEATURES (Must Have) ===
Lijst van essentiële functionaliteit:

FEATURE 1: [Naam]
- Beschrijving: [Wat doet het?]
- User story: Als [rol] wil ik [actie] zodat [resultaat]
- Acceptatiecriteria:
  1. [Criterium]
  2. [Criterium]

FEATURE 2: [Naam]
- Beschrijving:
- User story:
- Acceptatiecriteria:

[Herhaal voor alle features]

=== NICE TO HAVE (Fase 2) ===
Features die later kunnen:
1. [Feature]
2. [Feature]

=== EXPLICIET NIET IN SCOPE ===
Wat bouwen we NIET:
1. [Niet in scope]
2. [Niet in scope]
```

---

## 🔗 INTEGRATIES

```
=== EXTERNE SYSTEMEN ===
Welke systemen moeten gekoppeld worden?

SYSTEEM 1: [Naam, bijv: "Exact Online"]
- Type: [API/Export-Import/Webhook]
- Richting: [Van systeem/Naar systeem/Beide]
- Welke data: [Specificeer]
- Frequentie: [Realtime/Dagelijks/Handmatig]
- API documentatie: [URL indien beschikbaar]
- Credentials beschikbaar: [Ja/Nee]

SYSTEEM 2: [Naam]
- Type:
- Richting:
- Welke data:

=== EMAIL/NOTIFICATIES ===
Welke emails moeten worden verstuurd?
1. [Trigger] → [Ontvanger] - [Inhoud]
2. [Trigger] → [Ontvanger] - [Inhoud]

=== BETALINGEN (indien van toepassing) ===
- [ ] Eenmalige betalingen
- [ ] Abonnementen/recurring
- [ ] Facturen genereren
- Provider: [Mollie/Stripe]
```

---

## 🗄️ DATA REQUIREMENTS

```
=== BELANGRIJKSTE ENTITEITEN ===
Welke "dingen" beheert de applicatie?

ENTITEIT 1: [Naam, bijv: "Order"]
- Velden:
  - [veldnaam]: [type] - [beschrijving]
  - [veldnaam]: [type] - [beschrijving]
- Relaties:
  - Heeft veel [andere entiteit]
  - Behoort tot [andere entiteit]

ENTITEIT 2: [Naam]
- Velden:
- Relaties:

=== DATA MIGRATIE ===
Is er bestaande data die moet worden geïmporteerd?
- [ ] Nee, we starten leeg
- [ ] Ja, vanuit: [bron]
  - Formaat: [CSV/Excel/Database/API]
  - Volume: [aantal records]
  - Wie levert aan: [klant/huidige leverancier]

=== DATA RETENTIE ===
Hoe lang moet data bewaard worden?
- Actieve data: [Periode]
- Archief: [Periode]
- Verwijdering: [Automatisch/Handmatig]
```

---

## 🎨 UI/UX REQUIREMENTS

```
=== DESIGN ===
- [ ] Klant levert design (Figma/Sketch)
- [ ] RoTech ontwerpt op basis van huisstijl
- [ ] Geen specifiek design, functioneel moet werken

HUISSTIJL (indien RoTech ontwerpt):
- Primaire kleur: [HEX]
- Secundaire kleur: [HEX]
- Logo: [Aangeleverd/Nog maken]
- Font: [Specifiek/Geen voorkeur]

=== APPARATEN ===
- [ ] Desktop first (meeste gebruik op computer)
- [ ] Mobile first (veel mobiel gebruik)
- [ ] Beide even belangrijk
- [ ] Alleen desktop (interne tool)

=== NAVIGATIE STRUCTUUR ===
Schets de hoofdnavigatie:
- Dashboard
- [Menu item 1]
  - [Submenu]
  - [Submenu]
- [Menu item 2]
- [etc.]
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Tech Stack (Aanpassen per project)
```
=== STANDAARD STACK ===
Frontend:       Next.js 15 (App Router) + React
Language:       TypeScript (strict)
Styling:        Tailwind CSS + shadcn/ui components
State:          Zustand (client) / React Query (server)
Forms:          React Hook Form + Zod
Database:       PostgreSQL + Prisma ORM
Auth:           NextAuth.js / Clerk
Email:          Resend
File Storage:   Vercel Blob / Cloudflare R2
Hosting:        Vercel
Monitoring:     Vercel Analytics + Sentry (errors)

=== ALTERNATIEVEN (indien nodig) ===
- Supabase: voor realtime, auth, storage in één
- Stripe: voor betalingen/subscriptions
- Socket.io: voor realtime features
- Redis: voor caching/queues
- BullMQ: voor achtergrond jobs
```

### Project Structuur
```
/[project-naam]
├── .env.local
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Publieke auth routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/                # Geauthenticeerde routes
│   │   │   ├── layout.tsx              # Dashboard layout met sidebar
│   │   │   ├── page.tsx                # Dashboard home
│   │   │   │
│   │   │   ├── [resource-1]/           # CRUD voor entiteit 1
│   │   │   │   ├── page.tsx            # Lijst
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx        # Nieuw maken
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Detail/bewerken
│   │   │   │       └── edit/
│   │   │   │
│   │   │   ├── [resource-2]/           # Herhaal per entiteit
│   │   │   │
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   ├── team/
│   │   │   │   └── billing/
│   │   │   │
│   │   │   └── admin/                  # Admin-only routes
│   │   │       └── users/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── [resource-1]/
│   │   │   │   └── route.ts
│   │   │   ├── webhooks/
│   │   │   └── cron/                   # Scheduled jobs
│   │   │
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   └── [etc...]
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── [feature-1]/                # Feature-specifieke components
│   │   │   ├── List.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Filters.tsx
│   │   │
│   │   └── shared/
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchInput.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                       # Prisma client
│   │   ├── auth.ts                     # Auth config
│   │   ├── email.ts
│   │   ├── utils.ts
│   │   └── validations/
│   │       └── [schema].ts             # Zod schemas
│   │
│   ├── hooks/
│   │   ├── use-[resource].ts           # Data hooks
│   │   └── use-toast.ts
│   │
│   ├── services/
│   │   ├── [resource].service.ts       # Business logic
│   │   └── integrations/
│   │       └── [external-system].ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── constants/
│       └── index.ts
│
├── docs/
│   ├── OVERDRACHT.md
│   ├── API-DOCUMENTATIE.md
│   ├── GEBRUIKERSHANDLEIDING.md
│   └── BEHEERHANDLEIDING.md
│
└── scripts/
    ├── seed.ts
    └── migrate-data.ts
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 0: Requirements Analyse

```
Voordat je begint met bouwen, analyseer de requirements:

1. Lees alle bovenstaande specificaties
2. Identificeer onduidelijkheden → vraag klant
3. Maak een data model (ERD)
4. Schets de user flows
5. Prioriteer features (MVP vs later)

LEVER OP:
- Data model diagram
- User flow diagrammen
- MVP feature lijst
- Technische architectuur beslissingen
```

### Fase 1: Project Setup

```
Initialiseer het project:

1. Next.js 15 met TypeScript, Tailwind, App Router
2. Installeer en configureer shadcn/ui
3. Setup Prisma met PostgreSQL
4. Configureer NextAuth (of Clerk)
5. Setup Resend voor email
6. Installeer overige dependencies:
   - @tanstack/react-query
   - zustand
   - zod
   - date-fns
   - lucide-react

Maak volledige mappenstructuur klaar.
```

### Fase 2: Database & Auth

```
=== DATABASE ===
Maak Prisma schema gebaseerd op data requirements:
[Plak hier de entiteiten en relaties]

Maak seed script met testdata.

=== AUTHENTICATIE ===
Configureer [NextAuth/Clerk] met:
- Login methode: [specificatie]
- Rollen: [rol lijst]
- Sessie strategie: [JWT/Database]

Maak auth middleware voor route protection.
```

### Fase 3: Core Features (Iteratief)

```
Bouw features in volgorde van prioriteit:

=== FEATURE: [Naam] ===
User story: [...]

Componenten:
1. [Component 1] - [Beschrijving]
2. [Component 2] - [Beschrijving]

API routes:
- GET /api/[resource] - Lijst ophalen
- POST /api/[resource] - Nieuw maken
- GET /api/[resource]/[id] - Detail ophalen
- PUT /api/[resource]/[id] - Bewerken
- DELETE /api/[resource]/[id] - Verwijderen

Pagina's:
- /[resource] - Overzicht
- /[resource]/new - Nieuw maken
- /[resource]/[id] - Detail/bewerken

[Herhaal voor elke feature]
```

### Fase 4: Integraties

```
Bouw de externe integraties:

=== INTEGRATIE: [Systeem] ===
Type: [API/Webhook/etc.]
Documentatie: [URL]

Implementeer:
1. API client/wrapper
2. Data mapping
3. Sync logica
4. Error handling
5. Logging

Test:
1. [Test scenario 1]
2. [Test scenario 2]
```

### Fase 5: Polish & Testing

```
1. Error handling overal
2. Loading states
3. Empty states
4. Validatie feedback
5. Responsive design check
6. Performance optimalisatie
7. Security review

Test scenarios:
- Happy path voor elke feature
- Edge cases
- Error scenarios
- Concurrent users (indien relevant)
```

---

## ✅ OPLEVERING CHECKLIST

### Functioneel
- [ ] Alle core features werken
- [ ] Alle user flows compleet
- [ ] Alle rollen correct geïmplementeerd
- [ ] Integraties werken
- [ ] Email notificaties werken

### Technisch
- [ ] Geen TypeScript errors
- [ ] Geen console errors
- [ ] Build succesvol
- [ ] Database migraties clean
- [ ] API's gedocumenteerd
- [ ] Error handling overal
- [ ] Logging geïmplementeerd

### Security
- [ ] Authenticatie werkt
- [ ] Autorisatie per rol
- [ ] Input validatie
- [ ] SQL injection preventie (Prisma)
- [ ] XSS preventie
- [ ] CSRF protection
- [ ] Rate limiting op API's
- [ ] Sensitive data encrypted

### Deployment
- [ ] Environment variables gedocumenteerd
- [ ] Database gehost
- [ ] Vercel project opgezet
- [ ] Custom domein (indien van toepassing)
- [ ] SSL actief
- [ ] Monitoring actief
- [ ] Backup strategie

### Documentatie
- [ ] Overdracht document
- [ ] Gebruikershandleiding
- [ ] Beheerhandleiding
- [ ] API documentatie
- [ ] Technische documentatie

---

## 📊 ENVIRONMENT VARIABLES TEMPLATE

```env
# App
NEXT_PUBLIC_APP_URL=https://[domein]
NEXT_PUBLIC_APP_NAME=[App Naam]

# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://[domein]
NEXTAUTH_SECRET=[genereer met: openssl rand -base64 32]

# OAuth (indien van toepassing)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# Email
RESEND_API_KEY=
FROM_EMAIL=

# Integrations
[SYSTEEM]_API_KEY=
[SYSTEEM]_API_URL=

# Storage (indien van toepassing)
BLOB_READ_WRITE_TOKEN=

# Monitoring
SENTRY_DSN=
```

---

## 📁 DOCUMENTATIE TEMPLATES

### OVERDRACHT.md
```markdown
# Overdracht Document - [Project Naam]

## Samenvatting
[Wat is opgeleverd]

## Accounts & Toegang
| Service | URL | Inloggegevens |
|---------|-----|---------------|
| Vercel | | |
| Database | | |
| etc. | | |

## Belangrijke URLs
- Productie: https://...
- Staging: https://...
- API docs: https://...

## Contact
Support: support@ro-techdevelopment.dev
```

### GEBRUIKERSHANDLEIDING.md
```markdown
# Gebruikershandleiding - [App Naam]

## Inloggen
[Stappen]

## Dashboard
[Uitleg]

## [Feature 1]
### Overzicht
### Nieuw maken
### Bewerken
### Verwijderen

[Herhaal per feature]

## Veelgestelde Vragen
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
