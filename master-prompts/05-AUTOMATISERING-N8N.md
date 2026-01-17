# 🔄 MASTER PROMPT: DIGITAL PROCESS AUTOMATION (n8n / Make.com)

## Dienst Informatie
- **Dienst:** Digital Process Automation
- **Prijsrange:** Op maat (vanaf €500 voor simpele workflow)
- **Doorlooptijd:** 1-4 weken afhankelijk van complexiteit
- **Tools:** n8n (self-hosted of cloud), Make.com, Zapier

---

## 📋 KLANTGEGEVENS

```
BEDRIJFSNAAM: [Invullen]
CONTACTPERSOON: [Invullen]
EMAIL: [Invullen]
TELEFOON: [Invullen]

TECHNISCH NIVEAU: [Basis/Gemiddeld/Gevorderd]
HUIDIGE AUTOMATISERING: [Geen/Zapier/Make/Anders: ___]
```

---

## 🎯 AUTOMATISERING REQUIREMENTS

```
=== PROBLEEMSTELLING ===
Welk proces kost nu te veel tijd?
[Beschrijving]

Hoeveel tijd kost dit per week/maand?
[Schatting in uren]

=== GEWENSTE AUTOMATISERING ===
Wat moet er automatisch gebeuren?
[Beschrijving stap voor stap]

=== TRIGGER ===
Wat start de automatisering?
- [ ] Nieuwe email ontvangen
- [ ] Formulier ingevuld op website
- [ ] Nieuwe order/bestelling
- [ ] Nieuwe lead in CRM
- [ ] Nieuwe rij in spreadsheet
- [ ] Webhook van extern systeem
- [ ] Scheduled (dagelijks/wekelijks/etc.)
- [ ] Handmatige trigger
- [ ] Anders: [...]

=== BETROKKEN SYSTEMEN ===
Welke apps/systemen moeten gekoppeld worden?

SYSTEEM 1: [Naam]
- Type: [CRM/Email/Boekhouding/etc.]
- Heeft API?: [Ja/Nee/Weet niet]
- Inloggegevens beschikbaar?: [Ja/Nee]

SYSTEEM 2: [Naam]
- Type:
- Heeft API?:
- Inloggegevens beschikbaar?:

[Herhaal indien nodig]

=== GEWENSTE ACTIES ===
Wat moet er gebeuren? (in volgorde)
1. [Actie 1, bijv: "Data ophalen uit systeem A"]
2. [Actie 2, bijv: "Transformeren naar juiste formaat"]
3. [Actie 3, bijv: "Opslaan in systeem B"]
4. [Actie 4, bijv: "Email versturen naar team"]

=== CONDITIES ===
Zijn er voorwaarden/beslissingen?
- [ ] Ja: [Beschrijf de if/else logica]
- [ ] Nee, altijd dezelfde flow

=== ERROR HANDLING ===
Wat moet er gebeuren als iets mislukt?
- [ ] Email naar: [email]
- [ ] Slack notificatie
- [ ] Log en later opnieuw proberen
- [ ] Anders: [...]

=== VOLUME ===
Hoe vaak wordt dit proces getriggerd?
- Per dag: [aantal]
- Per week: [aantal]
- Per maand: [aantal]
```

---

## 🛠️ TECHNISCHE SPECIFICATIES

### Platform Keuze
```
=== n8n (Aanbevolen) ===
Voordelen:
- Self-hosted mogelijk (privacy, geen limieten)
- Gratis voor self-hosted
- 400+ integraties
- Custom code mogelijk (JavaScript)
- Complexe workflows

Wanneer kiezen:
- Privacy gevoelige data
- Hoog volume
- Complexe logica
- Budget bewust

=== Make.com ===
Voordelen:
- Gebruiksvriendelijk
- Visuele builder
- 1500+ integraties
- Managed service

Wanneer kiezen:
- Klant wil zelf aanpassen
- Minder technisch
- Standaard integraties

=== Zapier ===
Voordelen:
- Meest integraties (5000+)
- Zeer gebruiksvriendelijk
- Bekende merknaam

Wanneer kiezen:
- Simpele workflows
- Klant kent Zapier al
- Enterprise apps
```

### n8n Hosting Opties
```
1. SELF-HOSTED (Docker)
   - Server nodig (VPS, €5-20/maand)
   - Volledige controle
   - Geen limieten
   - Setup: Docker Compose

2. n8n CLOUD
   - Managed service
   - Starter: €20/maand (2.500 executions)
   - Geen server beheer

3. KLANT'S INFRASTRUCTUUR
   - Op hun servers
   - Zij beheren
   - Wij configureren
```

---

## 📝 WORKFLOW DOCUMENTATIE TEMPLATE

Voor elke workflow, documenteer:

```markdown
# Workflow: [Naam]

## Doel
[Wat doet deze workflow?]

## Trigger
[Wat start de workflow?]

## Stappen
1. [Stap 1]
2. [Stap 2]
3. [etc.]

## Systemen
- [Systeem 1]: [Wat doet het in deze flow]
- [Systeem 2]: [Wat doet het in deze flow]

## Credentials Nodig
- [Systeem 1]: [Type auth - API key/OAuth/etc.]
- [Systeem 2]: [Type auth]

## Error Handling
[Wat gebeurt er bij fouten?]

## Monitoring
- Succesvol: [Hoe weten we dat het werkt?]
- Gefaald: [Hoe worden we genotificeerd?]

## Onderhoud
- [Wat moet periodiek gecheckt worden?]
```

---

## 🔧 VEELVOORKOMENDE WORKFLOWS

### 1. Lead Capture naar CRM
```
Trigger: Formulier ingevuld (website, Typeform, etc.)
↓
Stap 1: Data ontvangen via webhook
Stap 2: Opschonen/formatteren data
Stap 3: Check of lead al bestaat in CRM
Stap 4a (nieuw): Maak contact in CRM
Stap 4b (bestaand): Update contact
Stap 5: Voeg toe aan juiste lijst/pipeline
Stap 6: Stuur welkomst email
Stap 7: Notificatie naar sales team (Slack/Email)
```

### 2. Order Verwerking
```
Trigger: Nieuwe order in webshop
↓
Stap 1: Order data ontvangen
Stap 2: Valideer order data
Stap 3: Maak factuur in boekhouding (Moneybird/Exact)
Stap 4: Update voorraad in systeem
Stap 5: Stuur orderbevestiging naar klant
Stap 6: Maak verzendlabel (Sendcloud)
Stap 7: Update order status naar "verwerkt"
Stap 8: Notificatie naar magazijn
```

### 3. Factuur Automatisering
```
Trigger: Factuur betaald (Mollie webhook)
↓
Stap 1: Betaling data ontvangen
Stap 2: Zoek bijbehorende factuur
Stap 3: Markeer als betaald in boekhouding
Stap 4: Update order status
Stap 5: Stuur bedankmail naar klant
Stap 6: Log in spreadsheet
```

### 4. Content Distributie
```
Trigger: Nieuw blog artikel gepubliceerd
↓
Stap 1: Artikel data ophalen
Stap 2: Genereer social media posts (AI)
Stap 3: Post naar LinkedIn
Stap 4: Post naar Twitter/X
Stap 5: Post naar Facebook
Stap 6: Stuur naar nieuwsbrief lijst
Stap 7: Log resultaten
```

### 5. Klantenservice Ticket
```
Trigger: Nieuwe email naar support@
↓
Stap 1: Email ontvangen
Stap 2: Categoriseer met AI
Stap 3: Maak ticket in helpdesk
Stap 4: Prioriteit bepalen
Stap 5: Toewijzen aan juiste medewerker
Stap 6: Stuur auto-reply naar klant
Stap 7: Notificatie naar team
```

---

## 📝 CURSOR AI INSTRUCTIES (voor n8n)

### n8n Self-Hosted Setup

```
Maak Docker Compose configuratie voor n8n:

=== REQUIREMENTS ===
- PostgreSQL database
- Persistent storage voor workflows
- SSL via reverse proxy (Traefik of Nginx)
- Webhook URL accessible

=== DOCKER-COMPOSE.YML ===
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=[username]
      - N8N_BASIC_AUTH_PASSWORD=[password]
      - N8N_HOST=[domein]
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://[domein]/
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=[password]
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=[password]
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

### Workflow Implementatie

```
Voor de workflow [NAAM]:

1. TRIGGER NODE
   - Type: [Webhook/Schedule/etc.]
   - Configuratie: [...]

2. STAP 1: [Beschrijving]
   - Node type: [HTTP Request/Function/etc.]
   - Input: [Wat komt binnen]
   - Output: [Wat gaat door]
   - Settings: [Configuratie]

3. STAP 2: [Beschrijving]
   [Herhaal format]

[etc.]

ERROR HANDLING:
- Error trigger node toevoegen
- Stuur naar: [email/Slack]

ACTIVEREN:
- Test met sample data
- Activeer workflow
- Monitor eerste executions
```

---

## ✅ OPLEVERING CHECKLIST

### Workflow
- [ ] Workflow werkt end-to-end
- [ ] Error handling geïmplementeerd
- [ ] Alle credentials correct
- [ ] Test met echte data geslaagd
- [ ] Edge cases getest

### Documentatie
- [ ] Workflow documentatie compleet
- [ ] Credentials overzicht
- [ ] Troubleshooting guide
- [ ] Handleiding voor klant

### Overdracht
- [ ] Klant toegang tot platform
- [ ] Credentials veilig gedeeld
- [ ] Training/walkthrough gegeven
- [ ] Support periode afgesproken

---

## 🔐 CREDENTIALS BEHEER

```
=== CREDENTIALS TEMPLATE ===

WORKFLOW: [Naam]
PLATFORM: [n8n/Make/Zapier]
AANGEMAAKT: [Datum]

| Systeem | Credential Type | Waar te vinden | Expiratie |
|---------|-----------------|----------------|-----------|
| [Systeem 1] | API Key | [Locatie] | [Nooit/Datum] |
| [Systeem 2] | OAuth | [Locatie] | [Refresh token] |

TOEGANG KLANT:
- Platform login: [URL]
- Username: [...]
- Password: [Deel veilig via 1Password/Bitwarden]
```

---

## 💡 TIPS

1. **Start simpel** - Begin met MVP, breidt later uit
2. **Test grondig** - Gebruik testdata voordat je live gaat
3. **Monitor** - Check de eerste dagen of alles werkt
4. **Documenteer** - Klant moet later kunnen begrijpen wat er gebeurt
5. **Error handling** - Beter te veel dan te weinig notificaties
6. **Idempotent** - Zorg dat dubbele triggers geen problemen veroorzaken

---

*Master Prompt Versie 1.0 | RoTech Development | Januari 2026*
