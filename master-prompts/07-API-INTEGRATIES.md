# 🔌 MASTER PROMPT: API INTEGRATIES

## Dienst Informatie
- **Dienst:** API Integraties & Koppelingen
- **Type:** Standalone dienst OF onderdeel van groter project
- **Prijsrange:** Vanaf €750 per integratie (simpel) / €2.500+ (complex)
- **Doorlooptijd:** 1-4 weken per integratie

---

## 📋 KLANTGEGEVENS

```
BEDRIJFSNAAM: [Invullen]
CONTACTPERSOON: [Invullen]
TECHNISCH CONTACT: [Indien anders]
EMAIL: [Invullen]
TELEFOON: [Invullen]

=== CONTEXT ===
ONDERDEEL VAN PROJECT?: [Ja - welk project / Nee - standalone]
BESTAANDE SYSTEMEN: [Lijst van huidige software]
```

---

## 🎯 INTEGRATIE REQUIREMENTS

```
=== OVERZICHT ===
Welke systemen moeten gekoppeld worden?

BRON SYSTEEM: [Naam]
- Type: [CRM/ERP/Webshop/Boekhouding/etc.]
- Leverancier: [Bijv: Salesforce, Exact, WooCommerce]
- Heeft API?: [Ja/Nee/Onbekend]

DOEL SYSTEEM: [Naam]
- Type: [...]
- Leverancier: [...]
- Heeft API?: [Ja/Nee/Onbekend]

=== DATA FLOW ===
Welke richting gaat de data?
- [ ] Eenrichting: Bron → Doel
- [ ] Eenrichting: Doel → Bron
- [ ] Tweerichting (sync)

Welke data moet worden uitgewisseld?
| Veld in Bron | Veld in Doel | Transformatie nodig? |
|--------------|--------------|---------------------|
| [veld] | [veld] | [Ja/Nee - beschrijf] |
| [veld] | [veld] | [Ja/Nee - beschrijf] |

=== FREQUENTIE ===
Hoe vaak moet data gesynchroniseerd worden?
- [ ] Realtime (direct na wijziging)
- [ ] Near-realtime (binnen minuten)
- [ ] Periodiek: [elk uur/dagelijks/wekelijks]
- [ ] Handmatig (op verzoek)

=== TRIGGERS ===
Wat triggert de data sync?
- [ ] Webhook van bron systeem
- [ ] Polling (periodiek ophalen)
- [ ] Scheduled job
- [ ] Handmatige actie
- [ ] Event in applicatie

=== VOLUME ===
Hoeveel data wordt verwerkt?
- Records per dag: [aantal]
- Piekmomenten: [tijden/situaties]
- Initiële migratie nodig?: [Ja - aantal records / Nee]

=== ERROR SCENARIOS ===
Wat moet er gebeuren bij fouten?
- [ ] Email notificatie naar: [email]
- [ ] Retry automatisch (x keer)
- [ ] Log en handmatig oplossen
- [ ] Fallback proces

=== TOEGANG ===
Zijn de benodigde credentials beschikbaar?
BRON SYSTEEM:
- [ ] API key/credentials ontvangen
- [ ] Testomgeving beschikbaar
- [ ] API documentatie beschikbaar: [URL]

DOEL SYSTEEM:
- [ ] API key/credentials ontvangen
- [ ] Testomgeving beschikbaar
- [ ] API documentatie beschikbaar: [URL]
```

---

## 🔧 VEELVOORKOMENDE INTEGRATIES

### Boekhoudpakketten
```
=== EXACT ONLINE ===
API: REST API (OAuth 2.0)
Docs: https://developers.exact.com
Mogelijkheden:
- Facturen aanmaken/ophalen
- Relaties synchroniseren
- Grootboekrekeningen
- BTW aangiftes
Rate limits: 60 calls/minuut

=== MONEYBIRD ===
API: REST API (OAuth 2.0)
Docs: https://developer.moneybird.com
Mogelijkheden:
- Facturen, offertes
- Contacten
- Producten
- Betalingen
Rate limits: 150 calls/5 minuten

=== SNELSTART ===
API: REST API (API key)
Docs: https://developers.snelstart.nl
Mogelijkheden:
- Artikelen, relaties
- Facturen, bestellingen
- Dagboeken
```

### CRM Systemen
```
=== HUBSPOT ===
API: REST API (API key of OAuth)
Docs: https://developers.hubspot.com
Mogelijkheden:
- Contacts, Companies, Deals
- Marketing (forms, emails)
- Workflows
Rate limits: Tier-based

=== SALESFORCE ===
API: REST/SOAP API (OAuth)
Docs: https://developer.salesforce.com
Mogelijkheden:
- Volledige CRM data
- Custom objects
- Apex triggers
Rate limits: Edition-based

=== PIPEDRIVE ===
API: REST API (API key)
Docs: https://developers.pipedrive.com
Mogelijkheden:
- Deals, Persons, Organizations
- Activities, Notes
- Webhooks
```

### E-commerce
```
=== SHOPIFY ===
API: REST + GraphQL (Access token)
Docs: https://shopify.dev
Mogelijkheden:
- Orders, Products, Customers
- Inventory
- Webhooks
Rate limits: 2 calls/second

=== WOOCOMMERCE ===
API: REST API (Consumer key/secret)
Docs: https://woocommerce.github.io/woocommerce-rest-api-docs
Mogelijkheden:
- Orders, Products, Customers
- Coupons, Shipping
- Webhooks

=== LIGHTSPEED ===
API: REST API (OAuth)
Docs: https://developers.lightspeedhq.com
Mogelijkheden:
- Products, Orders, Customers
- Inventory
- POS data
```

### Verzending
```
=== SENDCLOUD ===
API: REST API (API key)
Docs: https://api.sendcloud.dev
Mogelijkheden:
- Labels genereren
- Tracking
- Returns

=== MYPARCEL ===
API: REST API (API key)
Docs: https://developer.myparcel.nl
Mogelijkheden:
- Shipments
- Webhooks voor tracking
- Print labels
```

### Email Marketing
```
=== MAILCHIMP ===
API: REST API (API key)
Docs: https://mailchimp.com/developer
Mogelijkheden:
- Lists, Subscribers
- Campaigns
- Automations

=== KLAVIYO ===
API: REST API (Private key)
Docs: https://developers.klaviyo.com
Mogelijkheden:
- Profiles, Events
- Flows, Campaigns
- Metrics

=== ACTIVECAMPAIGN ===
API: REST API (API key)
Docs: https://developers.activecampaign.com
Mogelijkheden:
- Contacts, Lists, Tags
- Deals, Automations
```

---

## 🛠️ TECHNISCHE IMPLEMENTATIE

### Architectuur Opties

```
=== OPTIE 1: DIRECTE INTEGRATIE ===
Voor: Simpele, eenmalige integraties
Implementatie: API routes in Next.js

/api/integrations/[systeem]/route.ts
└── Directe API calls naar extern systeem

Voordelen:
- Simpel
- Geen extra infra
- Snel te bouwen

Nadelen:
- Niet schaalbaar
- Geen retry/queue
- Moeilijk te monitoren

=== OPTIE 2: n8n WORKFLOWS ===
Voor: Complexe flows, meerdere systemen
Implementatie: n8n workflows

Voordelen:
- Visueel
- Ingebouwde error handling
- Veel connectors
- Klant kan aanpassen

Nadelen:
- Extra infrastructuur
- Learning curve

=== OPTIE 3: DEDICATED SERVICE ===
Voor: High-volume, kritieke integraties
Implementatie: Aparte Node.js service met queue

/integration-service
├── src/
│   ├── jobs/
│   ├── connectors/
│   ├── transformers/
│   └── queue/
└── workers/

Voordelen:
- Schaalbaar
- Robuust
- Full control

Nadelen:
- Complexer
- Meer onderhoud
- Hogere kosten
```

### Code Structuur (Directe Integratie)

```
/src/
├── lib/
│   └── integrations/
│       ├── base.ts                 # Base integration class
│       ├── types.ts                # Shared types
│       │
│       ├── exact/
│       │   ├── client.ts           # API client
│       │   ├── auth.ts             # OAuth handling
│       │   ├── types.ts            # Exact types
│       │   └── mappers.ts          # Data transformers
│       │
│       ├── moneybird/
│       │   ├── client.ts
│       │   └── ...
│       │
│       └── [andere systemen]/
│
├── app/
│   └── api/
│       └── integrations/
│           ├── exact/
│           │   ├── sync/route.ts    # Trigger sync
│           │   └── webhook/route.ts # Receive webhooks
│           └── [andere]/
│
└── services/
    └── sync/
        ├── customers.ts            # Customer sync logic
        ├── orders.ts               # Order sync logic
        └── invoices.ts             # Invoice sync logic
```

---

## 📝 CURSOR AI INSTRUCTIES

### Fase 1: API Client Setup

```
Maak een robuuste API client voor [SYSTEEM]:

=== CLIENT REQUIREMENTS ===
1. Authenticatie: [API key / OAuth / Basic Auth]
2. Base URL: [API base URL]
3. Rate limiting handling
4. Retry logic (exponential backoff)
5. Error handling en logging
6. TypeScript types voor responses

=== OAUTH FLOW (indien van toepassing) ===
1. Authorization URL
2. Token exchange
3. Token refresh
4. Token storage (encrypted)

=== ENDPOINTS TE IMPLEMENTEREN ===
1. [Endpoint 1]: [GET/POST] /path - [Beschrijving]
2. [Endpoint 2]: [GET/POST] /path - [Beschrijving]
3. [Endpoint 3]: [GET/POST] /path - [Beschrijving]

=== ERROR TYPES ===
- Rate limit exceeded → Retry met delay
- Auth expired → Refresh token
- Not found → Log en continue
- Server error → Retry 3x, dan notify
```

### Fase 2: Data Mapping

```
Maak data transformers tussen systemen:

=== MAPPING: [Bron Entiteit] → [Doel Entiteit] ===

Bron velden:
{
  "id": "123",
  "full_name": "Jan Jansen",
  "email_address": "jan@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}

Doel velden:
{
  "externalId": "123",
  "name": "Jan Jansen",
  "email": "jan@example.com",
  "createdAt": 1705315800
}

Transformaties nodig:
- full_name → name (rename)
- email_address → email (rename)
- created_at → createdAt (ISO string → Unix timestamp)

=== VALIDATION ===
Valideer data voor sync:
- Verplichte velden aanwezig
- Email formaat correct
- Datum formaat correct
```

### Fase 3: Sync Logic

```
Implementeer de synchronisatie logica:

=== SYNC TYPE: [Volledige sync / Incrementele sync] ===

VOLLEDIGE SYNC:
1. Haal alle records op uit bron
2. Vergelijk met bestaande in doel
3. Create/Update/Delete

INCREMENTELE SYNC:
1. Track laatste sync timestamp
2. Haal alleen gewijzigde records op
3. Process changes

=== CONFLICT HANDLING ===
Bij bidirectionele sync:
- [Last write wins / Merge / Manual resolution]

=== BATCH PROCESSING ===
Bij grote volumes:
- Chunk size: [aantal]
- Delay tussen chunks: [ms]
- Rate limit respecteren
```

### Fase 4: Webhooks (indien van toepassing)

```
Implementeer webhook endpoint:

=== WEBHOOK ENDPOINT ===
POST /api/integrations/[systeem]/webhook

1. Valideer signature/secret
2. Parse payload
3. Bepaal event type
4. Process event
5. Return 200 snel (async processing)

=== EVENT HANDLING ===
Event: [event.type]
→ Actie: [wat moet er gebeuren]

Event: [event.type]
→ Actie: [wat moet er gebeuren]

=== IDEMPOTENCY ===
- Track verwerkte webhook IDs
- Skip duplicates
- Herverwerk bij retry
```

### Fase 5: Monitoring & Logging

```
Implementeer monitoring:

=== LOGGING ===
Log bij elke sync:
- Start/end timestamp
- Records processed
- Errors encountered
- Duration

=== ALERTING ===
Stuur alert bij:
- Sync failure
- High error rate
- Rate limit hit
- Auth issues

Alert kanalen:
- Email: [email]
- [Slack/Discord/etc.]

=== DASHBOARD (optioneel) ===
Metrics te tonen:
- Laatste sync status
- Records synced vandaag
- Error rate
- Sync history
```

---

## ✅ OPLEVERING CHECKLIST

### Technisch
- [ ] API client werkt
- [ ] Authenticatie correct
- [ ] Rate limiting gerespecteerd
- [ ] Error handling compleet
- [ ] Retry logic werkt
- [ ] Logging geïmplementeerd

### Data
- [ ] Mapping correct
- [ ] Validatie werkt
- [ ] Transformaties correct
- [ ] Test data gesynchroniseerd

### Betrouwbaarheid
- [ ] Getest met echte data
- [ ] Edge cases getest
- [ ] Error scenarios getest
- [ ] Recovery getest

### Documentatie
- [ ] API mapping gedocumenteerd
- [ ] Error codes beschreven
- [ ] Troubleshooting guide
- [ ] Credentials overzicht

---

## 🔐 CREDENTIALS TEMPLATE

```
=== INTEGRATIE: [Naam] ===
SYSTEEM: [Bron/Doel systeem naam]
TYPE: [API Key / OAuth / Basic Auth]

PRODUCTION:
- API Key: [veilig opgeslagen]
- Base URL: [URL]
- Webhook Secret: [indien van toepassing]

STAGING/TEST:
- API Key: [veilig opgeslagen]
- Base URL: [URL]

OAUTH TOKENS (indien van toepassing):
- Opgeslagen in: [database/env/vault]
- Refresh automatisch: [Ja/Nee]
- Expiry: [duur]

CONTACT BIJ PROBLEMEN:
- Technisch contact klant: [naam + email]
- Support leverancier: [indien bekend]
```

---

## 📊 ENVIRONMENT VARIABLES

```env
# [SYSTEEM 1]
[SYSTEEM]_API_KEY=
[SYSTEEM]_API_URL=https://api.[systeem].com
[SYSTEEM]_WEBHOOK_SECRET=

# OAuth (indien van toepassing)
[SYSTEEM]_CLIENT_ID=
[SYSTEEM]_CLIENT_SECRET=
[SYSTEEM]_REDIRECT_URI=

# [SYSTEEM 2]
# ... herhaal voor elk systeem

# Monitoring
ALERT_EMAIL=
SLACK_WEBHOOK_URL=
```

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
