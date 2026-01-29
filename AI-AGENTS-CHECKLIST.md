# AI Agent Team - Volledige Implementatie Checklist

**Doel:** 100% live data en volledig autonome AI agents  
**Gekozen oplossing:** Vercel Pro  
**Geschatte kosten:** €20/maand  
**Geschatte implementatietijd:** 4-6 uur

---

## Inhoudsopgave

1. [Huidige Status](#huidige-status)
2. [Vercel Pro Setup Checklist](#vercel-pro-setup-checklist)
3. [Environment Variables Checklist](#environment-variables-checklist)
4. [Database Migratie Checklist](#database-migratie-checklist)
5. [Live Data Implementatie Checklist](#live-data-implementatie-checklist)
6. [Autonome Taken Overzicht](#autonome-taken-overzicht)
7. [Agent Verantwoordelijkheden Matrix](#agent-verantwoordelijkheden-matrix)
8. [Monitoring & Alerting Setup](#monitoring--alerting-setup)
9. [Post-Launch Verificatie](#post-launch-verificatie)

---

## Huidige Status

### Wat WEL Werkt
| Component | Status | Details |
|-----------|--------|---------|
| Dashboard UI | ✅ Klaar | Volledig responsive, modern design |
| Heartbeat Systeem | ✅ Klaar | Agents registreren status elke 30 sec |
| Fallback Controller | ✅ Klaar | Automatische recovery bij uitval |
| Health Monitor API | ✅ Klaar | `/api/ai-agents/health` |
| Database Schema | ✅ Klaar | 9 AI-tabellen in Prisma |
| Agent Classes | ✅ Klaar | 16 volledige agent implementaties |
| Cron Endpoints | ✅ Klaar | 3 endpoints geconfigureerd |

### Wat NIET Werkt (Nog Te Doen)
| Component | Status | Blocker |
|-----------|--------|---------|
| Cron Jobs Executie | ❌ Niet actief | Vereist Vercel Pro |
| OpenAI Integratie | ❌ Niet actief | Mist `OPENAI_API_KEY` |
| Email Notificaties | ❌ Niet actief | Mist `RESEND_API_KEY` |
| Real-time Metrics | ⚠️ Gedeeltelijk | Cron jobs moeten draaien |
| Lead Scraping | ⚠️ Standalone | Python tools niet geïntegreerd |

---

## Vercel Pro Setup Checklist

### Stap 1: Upgrade naar Vercel Pro
- [ ] Ga naar [vercel.com/dashboard](https://vercel.com/dashboard)
- [ ] Klik op je project "rotech-website"
- [ ] Ga naar Settings → Billing
- [ ] Upgrade naar Pro plan ($20/maand)
- [ ] Bevestig betaling

### Stap 2: Verificeer Cron Configuratie
- [ ] Ga naar Project → Settings → Crons
- [ ] Controleer dat alle 3 crons zichtbaar zijn:
  - `/api/cron/scheduler` - Elke minuut
  - `/api/cron/health-check` - Elke 5 minuten
  - `/api/cron/daily-briefing` - Elke dag 8:00

### Stap 3: Test Cron Endpoints
```bash
# Test scheduler lokaal
curl http://localhost:3000/api/cron/scheduler

# Test health check lokaal
curl http://localhost:3000/api/cron/health-check

# Test daily briefing lokaal
curl http://localhost:3000/api/cron/daily-briefing
```

---

## Environment Variables Checklist

### Verplichte Variables (Production)

Ga naar Vercel → Project → Settings → Environment Variables

| Variable | Waarde | Status |
|----------|--------|--------|
| `DATABASE_URL` | PostgreSQL connection string | ⬜ Te configureren |
| `NEXTAUTH_SECRET` | Random 32+ char string | ⬜ Te configureren |
| `NEXTAUTH_URL` | `https://ro-techdevelopment.dev` | ⬜ Te configureren |
| `CRON_SECRET` | Random secure string | ✅ Al ingesteld |
| `OPENAI_API_KEY` | `sk-...` van OpenAI | ⬜ Te configureren |
| `RESEND_API_KEY` | `re_...` van Resend | ⬜ Te configureren |

### OpenAI API Key Verkrijgen
1. Ga naar [platform.openai.com](https://platform.openai.com)
2. Maak account of log in
3. Ga naar API Keys
4. Create new secret key
5. Kopieer en voeg toe als `OPENAI_API_KEY`

### Resend API Key Verkrijgen (voor email notificaties)
1. Ga naar [resend.com](https://resend.com)
2. Maak account
3. Verifieer domein `ro-techdevelopment.dev`
4. Ga naar API Keys → Create API Key
5. Kopieer en voeg toe als `RESEND_API_KEY`

---

## Database Migratie Checklist

### Stap 1: PostgreSQL Database Setup
- [ ] Maak PostgreSQL database aan (Vercel Postgres of externe provider)
- [ ] Kopieer connection string
- [ ] Voeg toe als `DATABASE_URL` in Vercel

### Stap 2: Database Migratie
```bash
# Lokaal testen
npx prisma migrate deploy

# Of push schema direct
npx prisma db push
```

### Stap 3: Seed Data
```bash
# Maak admin gebruiker
npm run admin:create

# Seed test data (optioneel)
npm run db:seed
```

---

## Live Data Implementatie Checklist

### Dashboard Metrics - Nu Hardcoded → Live Data

| Metric | Huidige Bron | Live Bron | Status |
|--------|--------------|-----------|--------|
| Agents Online | Heartbeat systeem | `AIAgentMetrics` tabel | ✅ Klaar |
| Taken Vandaag | Hardcoded | `AIScheduledTask` count | ✅ Klaar |
| Actieve Leads | Hardcoded | `AILead` count | ✅ Klaar |
| Pipeline Waarde | Hardcoded | `AILead` aggregate | ✅ Klaar |
| Health Score | Hardcoded | Heartbeat berekening | ✅ Klaar |

### Stap voor Stap Verificatie

1. **Heartbeat Systeem Actief**
   - [ ] Open `/api/ai-agents/heartbeat` in browser (als admin)
   - [ ] Controleer dat alle agents heartbeats hebben
   - [ ] `isResponsive: true` voor system agents

2. **Scheduler Cron Actief**
   - [ ] Wacht 1 minuut na deploy
   - [ ] Check Vercel logs voor `[CRON] Scheduler cycle`
   - [ ] Controleer `AIScheduledTask` tabel voor updates

3. **Health Check Cron Actief**
   - [ ] Wacht 5 minuten na deploy
   - [ ] Check Vercel logs voor `[CRON] Health check completed`
   - [ ] Controleer dashboard health score update

4. **Daily Briefing Cron Actief**
   - [ ] Wacht tot 8:00 of trigger handmatig
   - [ ] Check `AIDailyBriefing` tabel voor nieuwe entry
   - [ ] Briefing pagina toont actuele data

---

## Autonome Taken Overzicht

### Wat de AI Agents Automatisch Doen

#### Elke Minuut (Scheduler Cron)
| Taak | Agent | Beschrijving |
|------|-------|--------------|
| Taak Verwerking | Scheduler Agent | Verwerkt scheduled tasks uit database |
| Queue Management | Scheduler Agent | Prioriteert en verdeelt taken |
| Deadline Monitoring | Scheduler Agent | Detecteert overdue tasks |

#### Elke 5 Minuten (Health Check Cron)
| Taak | Agent | Beschrijving |
|------|-------|--------------|
| Agent Status Check | Orchestrator Agent | Controleert alle agent heartbeats |
| Performance Monitoring | Orchestrator Agent | Meet response times en success rates |
| Issue Detection | Orchestrator Agent | Detecteert problemen en bottlenecks |
| Auto-Recovery | Orchestrator Agent | Start crashed agents opnieuw |
| Alert Generation | Orchestrator Agent | Creëert alerts bij problemen |

#### Elke Dag 8:00 (Daily Briefing Cron)
| Taak | Agent | Beschrijving |
|------|-------|--------------|
| Systeem Analyse | Master Agent | Analyseert vorige 24 uur |
| Metrics Aggregatie | Master Agent | Verzamelt alle performance data |
| Briefing Generatie | Master Agent | Genereert management rapport |
| Aanbevelingen | Master Agent | AI-gegenereerde verbetervoorstellen |
| Action Items | Master Agent | Prioriteert taken voor vandaag |

---

## Agent Verantwoordelijkheden Matrix

### System Agents (Altijd Online)

| Agent | Primaire Taak | Autonome Acties |
|-------|---------------|-----------------|
| **Master Agent** | CEO & Coördinatie | • Dagelijkse briefings genereren<br>• Autonome beslissingen nemen<br>• Escalatie naar mens<br>• Mode switching (autonomous/emergency) |
| **Orchestrator Agent** | Quality Control | • Health checks uitvoeren<br>• Performance monitoring<br>• Issue detectie & rapportage<br>• Agent recovery |
| **Optimizer Agent** | Continuous Improvement | • Pattern analyse<br>• Self-healing runs<br>• Optimalisatie voorstellen<br>• Resource balancing |
| **Marketing Agent** | Lead Generation | • Lead nurturing automation<br>• Campagne monitoring<br>• Content scheduling<br>• Email automation |
| **Scheduler Agent** | Task Planning | • Taak scheduling<br>• Deadline tracking<br>• Workload balancing<br>• Recurring tasks |

### Service Agents (On-Demand)

| Agent | Primaire Taak | Wordt Geactiveerd Bij |
|-------|---------------|----------------------|
| **Intake Agent** | Client Intake | Nieuwe contact aanvraag |
| **SEO Agent** | SEO Optimalisatie | SEO audit request / maandelijkse check |
| **Onderhoud Agent** | Website Maintenance | Onderhoudscontract taken |
| **Starter Website Agent** | One-page Websites | Starter pakket verkoop |
| **Business Website Agent** | Multi-page Websites | Business pakket verkoop |
| **Webshop Agent** | E-commerce | Webshop pakket verkoop |
| **Maatwerk Agent** | Custom Applications | Maatwerk project start |
| **Automatisering Agent** | n8n/Make.com | Automatisering project |
| **PWA Agent** | Progressive Web Apps | PWA project |
| **API Integratie Agent** | System Integrations | Integratie project |
| **Chatbot Agent** | AI Chatbots | Chatbot deployment |

---

## Customer Support Flow

### Hoe Werkaanvragen Worden Afgehandeld

```
┌─────────────────────────────────────────────────────────────────┐
│                    INKOMENDE AANVRAAG                          │
│         (Website form, Email, Telefoon, Chat)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     INTAKE AGENT                                │
│  • Classificeert aanvraag (support/offerte/vraag)              │
│  • Bepaalt urgentie (low/medium/high/urgent)                   │
│  • Verzamelt ontbrekende info                                   │
│  • Routeert naar juiste agent                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
      ┌───────────┐   ┌───────────┐   ┌───────────┐
      │  SUPPORT  │   │  OFFERTE  │   │  PROJECT  │
      │  TICKET   │   │  AANVRAAG │   │   START   │
      └───────────┘   └───────────┘   └───────────┘
              │               │               │
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Onderhoud Agent │ │ Intake Agent    │ │ Specifieke      │
│ • Bug fixes     │ │ • Offerte gen.  │ │ Project Agent   │
│ • Updates       │ │ • Prijs calc.   │ │ • Starter       │
│ • Backups       │ │ • Follow-up     │ │ • Business      │
└─────────────────┘ └─────────────────┘ │ • Webshop       │
                                         └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULER AGENT                              │
│  • Plant taken in                                               │
│  • Bewaakt deadlines                                            │
│  • Escalleert bij vertraging                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER AGENT                                 │
│  • Dagelijkse rapportage                                        │
│  • Kwaliteitscontrole                                           │
│  • Escalatie naar Bart (indien nodig)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Alerting Setup

### Alert Niveaus

| Niveau | Trigger | Actie |
|--------|---------|-------|
| **INFO** | Routine updates | Alleen loggen |
| **WARNING** | Performance degradatie | Dashboard alert |
| **ERROR** | Agent failure | Email notificatie |
| **CRITICAL** | Systeem down | SMS + Email + Dashboard |

### Alerting Configuratie Checklist

- [ ] Resend API key configureren voor email alerts
- [ ] Email template maken voor alerts
- [ ] Alert escalatie naar `bart@ro-techdevelopment.dev`
- [ ] (Optioneel) Twilio voor SMS alerts

### Dashboard Monitoring

- [ ] Health check badge zichtbaar op dashboard
- [ ] Live/Demo data indicator werkend
- [ ] Alert teller in navigatie
- [ ] Refresh knop functioneel

---

## Post-Launch Verificatie

### Dag 1 Na Vercel Pro Activatie

- [ ] **10:00** - Check Vercel dashboard voor cron execution logs
- [ ] **10:05** - Verify health check ran (elke 5 min)
- [ ] **10:30** - Check `/api/ai-agents` endpoint voor live data
- [ ] **11:00** - Verify scheduler processed any tasks
- [ ] **Einde dag** - Check daily briefing generatie (volgende ochtend 8:00)

### Week 1 Verificatie

| Dag | Check |
|-----|-------|
| Maandag | Daily briefing ontvangen? |
| Dinsdag | Alle cron jobs uitgevoerd? (check logs) |
| Woensdag | Eerste test support ticket door agents? |
| Donderdag | Marketing agent lead nurturing check |
| Vrijdag | Week rapport generatie |

### Succes Criteria

| Criteria | Verwachte Waarde | Hoe Te Meten |
|----------|------------------|--------------|
| Uptime | >99% | Vercel monitoring |
| Cron Success Rate | 100% | Vercel cron logs |
| Agent Response Time | <5s | Dashboard metrics |
| Error Rate | <1% | Agent logs |
| Daily Briefing | Elke dag 8:00 | Database check |

---

## Kosten Overzicht

| Item | Kosten/maand | Notities |
|------|--------------|----------|
| Vercel Pro | €20 | Cron jobs + analytics |
| OpenAI API | €10-50 | Afhankelijk van gebruik |
| Resend Email | €0-20 | Gratis tier vaak voldoende |
| PostgreSQL | €0-10 | Vercel Postgres of extern |
| **Totaal** | **€30-100** | |

---

## Snelle Referentie

### Belangrijke URLs

| Endpoint | Doel |
|----------|------|
| `/api/ai-agents` | Hoofd status API |
| `/api/ai-agents/health` | Health check & recovery |
| `/api/ai-agents/heartbeat` | Agent heartbeats |
| `/api/cron/scheduler` | Task scheduler |
| `/api/cron/health-check` | Auto health check |
| `/api/cron/daily-briefing` | Dagelijkse briefing |
| `/portal/ai-agents` | Admin dashboard |
| `/portal/ai-agents/monitoring` | Live monitoring |
| `/portal/ai-agents/briefing` | Dagelijkse briefing view |

### Handmatige Triggers (voor testen)

```bash
# Trigger scheduler handmatig
curl -X GET https://ro-techdevelopment.dev/api/cron/scheduler \
  -H "Authorization: Bearer $CRON_SECRET"

# Trigger health check handmatig
curl -X GET https://ro-techdevelopment.dev/api/cron/health-check \
  -H "Authorization: Bearer $CRON_SECRET"

# Trigger daily briefing handmatig
curl -X GET https://ro-techdevelopment.dev/api/cron/daily-briefing \
  -H "Authorization: Bearer $CRON_SECRET"

# Recovery uitvoeren
curl -X POST https://ro-techdevelopment.dev/api/ai-agents/health
```

---

## Volgende Stappen

1. **NU** - Upgrade naar Vercel Pro
2. **NU** - Configureer environment variables
3. **NU** - Deploy naar productie
4. **+1 uur** - Verificeer cron jobs draaien
5. **+24 uur** - Check eerste daily briefing
6. **+1 week** - Volledige systeem review

---

## Complete Werkaanvraag → Cursor Prompt Flow

### Welke Agent Doet Wat?

```
┌─────────────────────────────────────────────────────────────────┐
│  STAP 1: LEAD BINNENKOMST                                       │
│  (Contactform, Email, Telefoon, LinkedIn)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  INTAKE AGENT                                                   │
│  src/ai-agents/agents/00-intake/intake-agent.ts                 │
│                                                                 │
│  ✅ Classificeert type project                                  │
│  ✅ Scoort lead (0-100)                                         │
│  ✅ Extraheert requirements uit tekst                           │
│  ✅ Bepaalt aanbevolen pakket + prijsindicatie                  │
│  ✅ Genereert follow-up email                                   │
│                                                                 │
│  OUTPUT: IntakeResult met leadId, score, package, budget        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PROMPT GENERATOR                                               │
│  src/lib/ai-agents/prompt-generator.ts                          │
│                                                                 │
│  ✅ Ontvangt client + project data                              │
│  ✅ Kiest juiste template (starter/business/webshop/etc)        │
│  ✅ Genereert complete Cursor-ready prompt                      │
│  ✅ Inclusief: setup, components, functionality, SEO, deploy    │
│  ✅ Inclusief: checklist en geschatte uren                      │
│                                                                 │
│  API: POST /api/ai-agents/generate-prompt                       │
│                                                                 │
│  OUTPUT: Volledige prompt die je direct in Cursor plakt         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT-SPECIFIEKE AGENT                                       │
│  (Gebaseerd op project type)                                    │
│                                                                 │
│  📄 Starter Website Agent    → One-page websites                │
│  📄 Business Website Agent   → Multi-page bedrijfssites         │
│  📄 Webshop Agent           → E-commerce met iDEAL              │
│  📄 Maatwerk Agent          → Custom web applicaties            │
│  📄 Automatisering Agent    → n8n/Make.com workflows            │
│  📄 SEO Agent               → SEO audits en optimalisatie       │
│  📄 Onderhoud Agent         → Lopend onderhoud                  │
│  📄 Chatbot Agent           → AI chatbots                       │
│                                                                 │
│  DOEL: Bewaakt voortgang, genereert rapporten, QA checks        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  JIJ IN CURSOR                                                  │
│                                                                 │
│  1. Open gegenereerde prompt                                    │
│  2. Plak in Cursor                                              │
│  3. Cursor bouwt het product                                    │
│  4. Review en finetuning                                        │
│  5. Deploy naar Vercel                                          │
│  6. Overdracht aan klant                                        │
└─────────────────────────────────────────────────────────────────┘
```

### API Endpoints voor Prompt Generatie

| Endpoint | Methode | Functie |
|----------|---------|---------|
| `/api/ai-agents/generate-prompt` | POST | Genereer complete Cursor prompt |
| `/api/ai-agents/leads` | GET/POST | Lead management |
| `/api/ai-agents` | GET | Agent status overzicht |
| `/api/ai-agents/health` | GET/POST | Health check & recovery |

### Voorbeeld: Prompt Genereren via API

```javascript
// POST /api/ai-agents/generate-prompt
{
  "client": {
    "companyName": "Bakkerij van Dam",
    "contactName": "Jan van Dam",
    "email": "jan@bakkerijvandam.nl",
    "phone": "06 12345678",
    "businessType": "Bakkerij",
    "industry": "Food & Beverage",
    "targetAudience": "Lokale consumenten in Veldhoven"
  },
  "project": {
    "type": "starter",
    "goals": ["Online zichtbaarheid", "Contactaanvragen"],
    "pages": ["Homepage"],
    "features": ["Contactformulier", "Google Maps"],
    "contentProvided": {
      "logo": true,
      "texts": false,
      "photos": true,
      "brandColors": true
    },
    "inspirationSites": [
      { "url": "https://example.com", "whatLiked": "Warme kleuren" }
    ],
    "budget": { "min": 997, "max": 1500 },
    "timeline": "2 weken",
    "hasDomain": false,
    "hasHosting": false
  }
}

// Response: Complete Cursor-ready prompt
```

---

*Laatste update: 28 januari 2026*  
*Document eigenaar: Bart van Rooij - Ro-Tech Development*
