# 🏢 Ro-Tech Admin Portal

Lokale Python GUI applicatie voor Ro-Tech Development - alle emails, werkaanvragen, leads en klantcommunicatie op één plek.

---

## 🎯 Doel

Een **lokale desktop applicatie** waarin je:
- **Emails** ontvangt en verstuurt (via @ro-techdevelopment.com)
- **Website formulieren** beheert (contact, offerte aanvragen)
- **Leads** importeert en beheert (van lead-finder)
- **Klanten** en projecten volgt
- **Alles lokaal** opslaat (SQLite database)

---

## ⚙️ Architectuur

```
┌─────────────────────────────────────────────────────────────────┐
│                    RO-TECH ADMIN PORTAL                         │
│                    (Python GUI - CustomTkinter)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   📧 EMAIL   │  │  📥 WEBSITE  │  │  🔍 LEADS    │          │
│  │   Module     │  │   Module     │  │   Module     │          │
│  │              │  │              │  │              │          │
│  │  IMAP/SMTP   │  │  Webhook     │  │  CSV Import  │          │
│  │  Sync        │  │  Listener    │  │  Scraper     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │   SQLite    │                              │
│                    │   Database  │                              │
│                    │   (lokaal)  │                              │
│                    └─────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Externe Bronnen:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Email Server   │    │   Website       │    │   Lead Finder   │
│  IMAP/SMTP      │    │  .dev domain    │    │   Python        │
│  @ro-tech...    │    │  (webhooks)     │    │   (CSV output)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛠️ Tech Stack

```
GUI Framework:     CustomTkinter (moderne Tkinter wrapper)
Taal:              Python 3.11+
Database:          SQLite (via SQLAlchemy)
Email:             imaplib + smtplib (standaard library)
Async:             asyncio + threading voor background tasks
Styling:           CustomTkinter themes (dark/light mode)
```

### Waarom CustomTkinter?
- ✅ Moderne, professionele UI look
- ✅ Geen externe dependencies (draait overal)
- ✅ Dark mode support out-of-the-box
- ✅ Makkelijk te leren, Python-native
- ✅ Geen licentie-issues (open source)

---

## 📁 Projectstructuur

```
admin-portal/
├── main.py                     # Entry point - start de GUI
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── .env                        # Jouw credentials (git ignored)
│
├── src/
│   ├── __init__.py
│   │
│   ├── gui/                    # GUI Components
│   │   ├── __init__.py
│   │   ├── app.py              # Main application window
│   │   ├── sidebar.py          # Navigation sidebar
│   │   ├── dashboard.py        # Dashboard view
│   │   ├── email_view.py       # Email inbox/compose
│   │   ├── leads_view.py       # Leads management
│   │   ├── inbox_view.py       # Website form submissions
│   │   ├── clients_view.py     # Client CRM
│   │   └── settings_view.py    # Settings panel
│   │
│   ├── database/               # Database Layer
│   │   ├── __init__.py
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── database.py         # DB connection & session
│   │   └── migrations.py       # Schema migrations
│   │
│   ├── services/               # Business Logic
│   │   ├── __init__.py
│   │   ├── email_service.py    # IMAP/SMTP operations
│   │   ├── lead_service.py     # Lead import/management
│   │   ├── webhook_service.py  # Website form receiver
│   │   └── sync_service.py     # Background sync tasks
│   │
│   ├── utils/                  # Utilities
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   └── helpers.py          # Helper functions
│   │
│   └── assets/                 # Static assets
│       └── icons/              # UI icons
│
├── data/                       # Data folder (git ignored)
│   ├── admin_portal.db         # SQLite database
│   ├── attachments/            # Email attachments
│   └── backups/                # Database backups
│
└── logs/                       # Log files
    └── app.log
```

---

## 📊 Database Schema (SQLAlchemy)

```python
# Emails
class Email(Base):
    id: int (PK)
    message_id: str (unique)
    account: str              # welke mailbox
    from_address: str
    from_name: str
    to_address: str
    subject: str
    body_text: str
    body_html: str
    is_read: bool
    is_starred: bool
    folder: str               # inbox, sent, archive
    sent_at: datetime
    created_at: datetime
    
    # Relations
    attachments: List[Attachment]

# Attachments
class Attachment(Base):
    id: int (PK)
    email_id: int (FK)
    filename: str
    mime_type: str
    size: int
    file_path: str            # lokaal pad
    created_at: datetime

# Website Form Submissions
class FormSubmission(Base):
    id: int (PK)
    form_type: str            # contact, offerte, quote
    status: str               # new, in_progress, done, archived
    
    # Contact info
    name: str
    email: str
    phone: str
    company: str
    
    # Content
    subject: str
    message: str
    
    # Meta
    source: str               # website, api
    ip_address: str
    submitted_at: datetime
    created_at: datetime
    
    # Relations
    notes: List[Note]
    client_id: int (FK, optional)

# Leads (van lead-finder)
class Lead(Base):
    id: int (PK)
    status: str               # new, contacted, qualified, converted, lost
    
    # Business info
    business_name: str
    address: str
    city: str
    phone: str
    email: str
    website: str
    
    # Scores & meta
    lead_score: float
    has_website: bool
    website_quality: str      # none, poor, average, good
    
    # Import info
    import_batch: str         # batch identifier
    imported_at: datetime
    
    # Relations
    notes: List[Note]
    client_id: int (FK, optional)

# Clients (CRM)
class Client(Base):
    id: int (PK)
    name: str
    email: str
    phone: str
    company: str
    address: str
    
    # Status
    status: str               # prospect, active, inactive
    
    created_at: datetime
    updated_at: datetime
    
    # Relations
    form_submissions: List[FormSubmission]
    leads: List[Lead]
    projects: List[Project]
    notes: List[Note]

# Projects
class Project(Base):
    id: int (PK)
    client_id: int (FK)
    name: str
    description: str
    status: str               # quote, active, paused, completed, cancelled
    budget: float
    start_date: date
    end_date: date
    created_at: datetime

# Notes (polymorphic)
class Note(Base):
    id: int (PK)
    content: str
    
    # Polymorphic relations
    form_submission_id: int (FK, optional)
    lead_id: int (FK, optional)
    client_id: int (FK, optional)
    
    created_at: datetime

# Settings
class Setting(Base):
    id: int (PK)
    key: str (unique)
    value: str
    updated_at: datetime

# Email Accounts
class EmailAccount(Base):
    id: int (PK)
    name: str                 # "Contact", "Facturen"
    email: str
    imap_host: str
    imap_port: int
    smtp_host: str
    smtp_port: int
    username: str
    password: str             # encrypted
    is_active: bool
    last_sync: datetime
```

---

## 🔐 Environment Variables

```env
# .env

# ============ EMAIL ACCOUNTS ============
# Primaire email
EMAIL_HOST=mail.ro-techdevelopment.com
EMAIL_PORT_IMAP=993
EMAIL_PORT_SMTP=587
EMAIL_USERNAME=contact@ro-techdevelopment.com
EMAIL_PASSWORD=jouw-wachtwoord

# ============ WEBSITE WEBHOOK ============
WEBHOOK_SECRET=gedeelde-secret-met-website
WEBHOOK_PORT=8765

# ============ LEAD FINDER ============
LEAD_FINDER_OUTPUT=../lead-finder/output

# ============ APP ============
APP_THEME=dark
LOG_LEVEL=INFO
```

---

## ✨ Features

### 📧 Email Hub
- [x] Emails ontvangen via IMAP
- [x] Emails versturen via SMTP
- [x] Compose/Reply/Forward
- [x] Attachments opslaan
- [x] Zoeken in emails
- [x] Mark as read/starred
- [x] Meerdere accounts support

### 📥 Website Inbox
- [x] Ontvang contact formulieren
- [x] Ontvang offerte aanvragen
- [x] Status tracking
- [x] Notities toevoegen
- [x] Omzetten naar klant

### 🔍 Leads Manager
- [x] Import CSV van lead-finder
- [x] Lead scoring weergave
- [x] Filter op status/score
- [x] Contact tracking
- [x] Omzetten naar klant

### 👥 Klanten CRM
- [x] Klant database
- [x] Projecten per klant
- [x] Historie (forms, leads, emails)
- [x] Notities

### ⚙️ Dashboard
- [x] Overzicht van alles
- [x] Nieuwe items teller
- [x] Snelle acties
- [x] Dark/Light mode

---

## 🎨 UI Concept

```
┌─────────────────────────────────────────────────────────────────┐
│  🏢 Ro-Tech Admin Portal                      [🌙] [⚙️] [❌]   │
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│  📊 Dashboard  │  Dashboard                                     │
│                │                                                │
│  📧 Email      │  ┌─────────────┐ ┌─────────────┐ ┌───────────┐│
│    ├ Inbox     │  │    📧 12    │ │    📥 3     │ │   🔍 45   ││
│    ├ Sent      │  │   Emails    │ │   Forms     │ │   Leads   ││
│    └ Compose   │  │   unread    │ │   pending   │ │   total   ││
│                │  └─────────────┘ └─────────────┘ └───────────┘│
│  📥 Inbox      │                                                │
│    ├ Contact   │  ┌────────────────────────────────────────────┐│
│    └ Offerte   │  │ Recent Activity                            ││
│                │  ├────────────────────────────────────────────┤│
│  🔍 Leads      │  │ 📧 Nieuwe email - Klant vraagt offerte  5m ││
│                │  │ 📥 Contact form - Website bezoeker     12m ││
│  👥 Klanten    │  │ 🔍 15 leads geïmporteerd               1u  ││
│                │  │ 📧 Email verstuurd naar Lead #42       2u  ││
│  ⚙️ Settings   │  └────────────────────────────────────────────┘│
│                │                                                │
└────────────────┴────────────────────────────────────────────────┘
```

---

## 🚀 Installatie & Starten

### Stap 1: Dependencies installeren
```bash
cd tools/admin-portal
pip install -r requirements.txt
```

### Stap 2: Environment configureren
```bash
cp .env.example .env
# Vul je email credentials in
```

### Stap 3: Database initialiseren
```bash
python main.py --init-db
```

### Stap 4: Starten
```bash
python main.py
```

Of maak een snelkoppeling:
```bash
# Windows
pythonw main.py
```

---

## 🔄 Integraties

### 1. Email Sync
- Automatische sync elke 5 minuten
- Handmatige sync via knop
- Push notificaties bij nieuwe email

### 2. Website Webhook
- Lokale webhook server (port 8765)
- Website stuurt form data naar jouw PC
- Vereist port forwarding of lokale tunnel

**Alternatief: API Polling**
- Portal pollt website API elke X minuten
- Geen port forwarding nodig
- Simpeler setup

### 3. Lead Finder
- Import knop in GUI
- Selecteer CSV file
- Automatische deduplicatie
- Batch tagging

---

## ❓ FAQ

**Q: Moet mijn PC altijd aan staan?**
A: Nee, emails worden opgehaald bij opstarten. Je mist geen emails - ze staan op de server tot je synct.

**Q: Hoe krijg ik website forms binnen?**
A: Twee opties:
1. Webhook (realtime, vereist port forward)
2. API polling (periodiek checken)

**Q: Kan ik dit op meerdere PCs draaien?**
A: Ja, maar database is lokaal. Gebruik cloud sync (Dropbox) voor data folder of switch naar PostgreSQL.

**Q: Wat als ik de database kwijtraak?**
A: Emails staan nog op server, leads kun je opnieuw importeren. Maak regelmatig backups!

---

*Ro-Tech Admin Portal - Jouw lokale command center* 🚀
