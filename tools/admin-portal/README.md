# 🏢 Ro-Tech Admin Portal

Lokaal beheerportaal voor Ro-Tech Development - alle werkaanvragen, emails, facturen en klantcommunicatie op één plek.

---

## 🎯 Doel

Een **self-hosted** dashboard op je eigen PC waarin je:
- **Emails** ontvangt en verstuurt (via je domein: @ro-techdevelopment.com)
- **Werkaanvragen** beheert (leads, offertes, contactformulieren)
- **Facturen** ordent en logt (inkoop & verkoop)
- **Alles exporteert** voor je boekhouding

---

## ⚙️ Configuratie

| Aspect | Keuze | Details |
|--------|-------|---------|
| **Hosting** | Lokaal (Self-hosted) | Draait op je eigen PC |
| **Database** | SQLite + Backups | Simpel, geen server nodig |
| **Email IN** | IMAP | Ontvangt van @ro-techdevelopment.com |
| **Email UIT** | SMTP | Verstuurt via @ro-techdevelopment.com |
| **Backups** | Automatisch | Dagelijkse database backup |

---

## ✨ Features

### 📧 Email Hub
- [x] Emails ontvangen van je domein
- [x] Emails versturen/beantwoorden
- [x] Meerdere mailboxen (contact@, info@, facturen@)
- [x] Attachments opslaan (facturen, documenten)
- [x] Labels/folders voor organisatie
- [x] Zoekfunctie

### 📥 Werkaanvragen
- [ ] Website formulier submissions
- [ ] Lead imports (van lead-finder)
- [ ] Status tracking (nieuw → in behandeling → afgerond)
- [ ] Notities toevoegen

### 📄 Facturen & Documenten
- [ ] Automatisch facturen herkennen in emails
- [ ] Inkoop vs Verkoop categorisatie
- [ ] Upload documenten
- [ ] Export voor boekhouding (CSV/Excel)
- [ ] Zoeken op bedrag, datum, leverancier

### 💾 Backup Systeem
- [ ] Dagelijkse automatische database backup
- [ ] Email attachments backup
- [ ] Backup naar externe locatie (optioneel)
- [ ] Restore functionaliteit

---

## 🛠️ Tech Stack

```
Runtime:        Node.js 20+
Framework:      Next.js 15 (App Router)
Taal:           TypeScript
Styling:        Tailwind CSS + shadcn/ui
Database:       SQLite (via Prisma) - lokaal bestand
Email:          IMAP (ontvangen) + SMTP (versturen)
Backups:        Node-cron + file copy
```

### Waarom SQLite?
- ✅ Geen database server nodig
- ✅ Eén bestand = makkelijk backuppen
- ✅ Snel voor lokaal gebruik
- ✅ Makkelijk te verplaatsen

---

## 📁 Projectstructuur

```
admin-portal/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── email/
│   │   │   │   ├── page.tsx          # Inbox
│   │   │   │   ├── [id]/page.tsx     # Email detail
│   │   │   │   └── compose/page.tsx  # Nieuwe email
│   │   │   ├── inbox/                # Werkaanvragen
│   │   │   ├── invoices/             # Facturen
│   │   │   ├── leads/                # Leads
│   │   │   ├── clients/              # Klanten
│   │   │   └── settings/             # Instellingen
│   │   ├── api/
│   │   │   ├── email/
│   │   │   │   ├── fetch/route.ts    # Haal nieuwe emails
│   │   │   │   ├── send/route.ts     # Verstuur email
│   │   │   │   └── sync/route.ts     # Sync mailbox
│   │   │   ├── invoices/
│   │   │   ├── backup/
│   │   │   └── webhook/              # Website form submissions
│   │   └── layout.tsx
│   ├── components/
│   │   ├── email/
│   │   │   ├── EmailList.tsx
│   │   │   ├── EmailView.tsx
│   │   │   └── ComposeEmail.tsx
│   │   ├── invoices/
│   │   ├── dashboard/
│   │   └── ui/                       # shadcn components
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   ├── imap.ts                   # Email ontvangen
│   │   ├── smtp.ts                   # Email versturen
│   │   ├── backup.ts                 # Backup functies
│   │   └── utils.ts
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── dev.db                        # SQLite database bestand
├── backups/                          # Database backups
├── attachments/                      # Email bijlagen
├── .env.local
├── package.json
└── README.md
```

---

## 📊 Database Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

// ============ AUTH ============

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String?
  createdAt DateTime @default(now())
}

// ============ EMAIL ============

model EmailAccount {
  id           String   @id @default(cuid())
  name         String   // "Contact", "Facturen", etc.
  email        String   @unique
  imapHost     String
  imapPort     Int
  smtpHost     String
  smtpPort     Int
  username     String
  password     String   // encrypted
  isActive     Boolean  @default(true)
  lastSync     DateTime?
  emails       Email[]
  createdAt    DateTime @default(now())
}

model Email {
  id            String       @id @default(cuid())
  messageId     String       @unique
  threadId      String?
  
  // Headers
  from          String
  fromName      String?
  to            String
  cc            String?
  subject       String
  
  // Content
  bodyText      String?
  bodyHtml      String?
  
  // Status
  isRead        Boolean      @default(false)
  isStarred     Boolean      @default(false)
  isArchived    Boolean      @default(false)
  folder        String       @default("inbox")
  labels        String?      // JSON array
  
  // Timestamps
  sentAt        DateTime
  receivedAt    DateTime     @default(now())
  
  // Relations
  account       EmailAccount @relation(fields: [accountId], references: [id])
  accountId     String
  attachments   Attachment[]
  invoice       Invoice?     @relation(fields: [invoiceId], references: [id])
  invoiceId     String?
  
  createdAt     DateTime     @default(now())
}

model Attachment {
  id          String   @id @default(cuid())
  filename    String
  mimeType    String
  size        Int
  path        String   // lokaal pad naar bestand
  
  email       Email    @relation(fields: [emailId], references: [id])
  emailId     String
  
  createdAt   DateTime @default(now())
}

// ============ FACTUREN ============

model Invoice {
  id            String        @id @default(cuid())
  type          InvoiceType   // INKOOP of VERKOOP
  status        InvoiceStatus
  
  // Details
  invoiceNumber String?
  vendor        String        // Leverancier of klant naam
  description   String?
  
  // Bedragen
  amountExVat   Float?
  vatAmount     Float?
  amountIncVat  Float
  currency      String        @default("EUR")
  
  // Datums
  invoiceDate   DateTime?
  dueDate       DateTime?
  paidDate      DateTime?
  
  // Bestand
  filePath      String?       // PDF locatie
  
  // Relaties
  emails        Email[]
  client        Client?       @relation(fields: [clientId], references: [id])
  clientId      String?
  
  notes         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum InvoiceType {
  INKOOP    // Facturen die je ontvangt
  VERKOOP   // Facturen die je verstuurt
}

enum InvoiceStatus {
  OPEN
  BETAALD
  VERVALLEN
  GECREDITEERD
}

// ============ WERKAANVRAGEN ============

model Inquiry {
  id          String        @id @default(cuid())
  type        InquiryType
  status      InquiryStatus
  
  // Contact
  name        String
  email       String
  phone       String?
  company     String?
  
  // Content
  subject     String?
  message     String
  
  // Meta
  source      String?       // website, lead-finder, handmatig
  
  // Relaties
  client      Client?       @relation(fields: [clientId], references: [id])
  clientId    String?
  notes       Note[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum InquiryType {
  CONTACT
  OFFERTE
  LEAD
}

enum InquiryStatus {
  NIEUW
  IN_BEHANDELING
  OFFERTE_VERSTUURD
  GEWONNEN
  VERLOREN
  GEARCHIVEERD
}

// ============ KLANTEN ============

model Client {
  id          String    @id @default(cuid())
  name        String
  email       String
  phone       String?
  company     String?
  address     String?
  
  inquiries   Inquiry[]
  invoices    Invoice[]
  projects    Project[]
  notes       Note[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus
  budget      Float?
  
  client      Client        @relation(fields: [clientId], references: [id])
  clientId    String
  
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum ProjectStatus {
  OFFERTE
  ACTIEF
  GEPAUZEERD
  AFGEROND
  GEANNULEERD
}

model Note {
  id          String    @id @default(cuid())
  content     String
  
  inquiry     Inquiry?  @relation(fields: [inquiryId], references: [id])
  inquiryId   String?
  client      Client?   @relation(fields: [clientId], references: [id])
  clientId    String?
  
  createdAt   DateTime  @default(now())
}

// ============ SYSTEEM ============

model Backup {
  id          String   @id @default(cuid())
  filename    String
  size        Int
  path        String
  type        String   // database, attachments, full
  status      String   // success, failed
  createdAt   DateTime @default(now())
}

model Setting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  updatedAt   DateTime @updatedAt
}
```

---

## 🔐 Environment Variables

```env
# .env.local

# ============ APP ============
NEXTAUTH_SECRET="genereer-een-lange-random-string"
NEXTAUTH_URL="http://localhost:3000"

# ============ DATABASE ============
DATABASE_URL="file:./prisma/dev.db"

# ============ EMAIL ACCOUNTS ============
# Primaire email (contact@)
EMAIL_1_NAME="Contact"
EMAIL_1_ADDRESS="contact@ro-techdevelopment.com"
EMAIL_1_IMAP_HOST="mail.ro-techdevelopment.com"
EMAIL_1_IMAP_PORT="993"
EMAIL_1_SMTP_HOST="mail.ro-techdevelopment.com"
EMAIL_1_SMTP_PORT="587"
EMAIL_1_USERNAME="contact@ro-techdevelopment.com"
EMAIL_1_PASSWORD="jouw-email-wachtwoord"

# Facturen email (optioneel)
EMAIL_2_NAME="Facturen"
EMAIL_2_ADDRESS="facturen@ro-techdevelopment.com"
# ... etc

# ============ BACKUP ============
BACKUP_PATH="./backups"
BACKUP_SCHEDULE="0 2 * * *"  # Dagelijks om 02:00

# ============ WEBHOOK (voor website forms) ============
WEBHOOK_SECRET="gedeelde-secret-met-website"
```

---

## 📧 Email Configuratie

### Wat heb je nodig van je hosting provider?

| Setting | Waar te vinden | Voorbeeld |
|---------|----------------|-----------|
| IMAP Host | Hosting panel | `mail.ro-techdevelopment.com` |
| IMAP Port | Hosting panel | `993` (SSL) |
| SMTP Host | Hosting panel | `mail.ro-techdevelopment.com` |
| SMTP Port | Hosting panel | `587` (TLS) of `465` (SSL) |
| Username | Meestal volledige email | `contact@ro-techdevelopment.com` |
| Password | Email wachtwoord | Je email wachtwoord |

### Email Flow

```
ONTVANGEN:
[Iemand stuurt email] → [IMAP Server] → [Portal haalt op] → [Database + UI]

VERSTUREN:
[Compose in Portal] → [SMTP Server] → [Email verstuurd] → [Kopie in Sent]
```

---

## 📄 Facturen Workflow

```
1. EMAIL BINNENKOMT
   ↓
2. BIJLAGE GEDETECTEERD (PDF)
   ↓
3. HANDMATIG OF AUTO LABELEN
   - Type: Inkoop / Verkoop
   - Leverancier/Klant
   - Bedrag
   - Factuurnummer
   ↓
4. OPGESLAGEN IN DATABASE
   ↓
5. EXPORT NAAR BOEKHOUDING
   - CSV export
   - Excel export
   - Gefilterd op periode
```

---

## 💾 Backup Systeem

### Automatische Backups

```
Dagelijks om 02:00:
├── database_2026-01-18.db      # SQLite kopie
├── attachments_2026-01-18.zip  # Alle bijlagen
└── backup_log.json             # Backup historie
```

### Handmatige Backup

Via Settings pagina of:
```bash
npm run backup
```

### Restore

```bash
npm run restore -- --date 2026-01-18
```

---

## 🚀 Installatie

### Stap 1: Project Opzetten
```bash
cd tools/admin-portal
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --yes
```

### Stap 2: Dependencies
```bash
# Core
npm install @prisma/client next-auth bcryptjs
npm install -D prisma @types/bcryptjs

# Email
npm install imap-simple nodemailer mailparser
npm install -D @types/nodemailer @types/mailparser

# UI
npx shadcn@latest init -y
npx shadcn@latest add button card input table badge dialog tabs avatar dropdown-menu

# Utilities
npm install date-fns node-cron
npm install -D @types/node-cron
```

### Stap 3: Database Setup
```bash
npx prisma init --datasource-provider sqlite
# Kopieer schema uit deze README
npx prisma db push
```

### Stap 4: Environment
```bash
cp .env.example .env.local
# Vul je email credentials in
```

### Stap 5: Starten
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🎨 UI Preview (Concept)

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 Ro-Tech Portal                      [Robin] [Settings]  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  📊 Dashboard│  Dashboard                                   │
│              │  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  📧 Email    │  │ 12      │ │ 3       │ │ €2.450  │        │
│    └ Inbox   │  │ Emails  │ │ Leads   │ │ Openst. │        │
│    └ Sent    │  └─────────┘ └─────────┘ └─────────┘        │
│    └ Compose │                                              │
│              │  Recente Emails                              │
│  📥 Aanvragen│  ┌──────────────────────────────────────┐   │
│              │  │ 📧 Klant X - Offerte aanvraag    10m │   │
│  📄 Facturen │  │ 📧 Leverancier Y - Factuur #123  2u  │   │
│    └ Inkoop  │  │ 📧 Lead - Website contact        1d  │   │
│    └ Verkoop │  └──────────────────────────────────────┘   │
│              │                                              │
│  👥 Klanten  │  Openstaande Facturen                       │
│              │  ┌──────────────────────────────────────┐   │
│  ⚙️ Settings │  │ #2024-001  Klant A    €1.200  ⚠️     │   │
│              │  │ #2024-002  Klant B    €1.250  ✓      │   │
│              │  └──────────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 📅 Development Roadmap

### Week 1: Fundament
- [ ] Project setup (Next.js, Prisma, Auth)
- [ ] Basic layout + navigatie
- [ ] Login pagina
- [ ] Dashboard homepage

### Week 2: Email Core
- [ ] IMAP connectie + email ophalen
- [ ] Email inbox view
- [ ] Email detail view
- [ ] SMTP + email versturen
- [ ] Reply/Forward functionaliteit

### Week 3: Facturen & Documenten
- [ ] Facturen overzicht
- [ ] Handmatig factuur toevoegen
- [ ] Factuur koppelen aan email
- [ ] Export functionaliteit
- [ ] Attachment viewer

### Week 4: Polish & Extras
- [ ] Backup systeem
- [ ] Werkaanvragen inbox
- [ ] Zoekfunctionaliteit
- [ ] Settings pagina
- [ ] Website webhook integratie

---

## ❓ Vragen Voordat We Starten

1. **Welke email provider gebruik je?**
   - TransIP / Hostnet / Antagonist / Andere?
   - (Voor correcte IMAP/SMTP settings)

2. **Hoeveel email accounts wil je koppelen?**
   - Alleen contact@ ?
   - Of ook facturen@, info@, etc.?

3. **Welk boekhoudprogramma gebruik je?**
   - (Om te weten welk export formaat handig is)

4. **Wil je direct beginnen met bouwen?**

---

*Ro-Tech Admin Portal - Jouw lokale command center* 🚀
