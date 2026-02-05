# Automation Service Aanbod - RoTech Development

> **Eerlijk Overzicht | Februari 2026**
> 
> Dit document beschrijft wat RoTech realistisch kan aanbieden op het gebied van automation services met de huidige Cursor + MCP + n8n setup.

---

## 📊 Huidige Technische Setup

### Wat Je Hebt

| Component | Status | Capability |
|-----------|--------|------------|
| **n8n Instance** | ✅ Actief | Self-hosted, onbeperkte executions |
| **MCP Server** | ✅ Werkend | 18 tools voor workflow management |
| **Cursor IDE** | ✅ Geïntegreerd | AI-assisted workflow development |
| **Bestaande Workflows** | 11 workflows | Faceless YouTube pipelines |

### MCP Tools Beschikbaar

```
Workflow Management:
- n8n_list_workflows      - n8n_get_workflow
- n8n_create_workflow     - n8n_update_workflow
- n8n_delete_workflow     - n8n_activate_workflow
- n8n_deactivate_workflow - n8n_execute_workflow

Execution & Monitoring:
- n8n_list_executions     - n8n_get_execution
- n8n_list_credentials

Project Management:
- n8n_list_projects       - n8n_get_project
- n8n_create_project      - n8n_update_project
- n8n_delete_project      - n8n_transfer_workflows
- n8n_get_project_workflows
```

---

## 🎯 Wat Je EERLIJK Kunt Aanbieden

### Tier 1: Quick Wins (Simpele Automaties)

**Doorlooptijd:** 1-3 dagen  
**Prijs:** €150-500 eenmalig

| Automatisering | Complexiteit | Wat Het Doet |
|----------------|--------------|--------------|
| **Lead Capture → CRM** | Laag | Formulier → HubSpot/Pipedrive/Notion |
| **Email naar Slack/Teams** | Laag | Belangrijke emails → teamnotificatie |
| **Nieuwe klant welcome flow** | Laag | Welkomstmail + Trello/Notion taak |
| **Social media scheduler** | Laag | Content calendar → automatisch posten |
| **Factuur reminder** | Laag | Automatische betaalherinneringen |
| **Form → Spreadsheet** | Laag | Alle formulieren naar Google Sheets |

**Waarom dit werkt:**
- Standaard n8n nodes
- Weinig custom code nodig
- Snelle oplevering mogelijk
- Makkelijk te onderhouden

---

### Tier 2: Business Automaties (Medium Complexiteit)

**Doorlooptijd:** 1-2 weken  
**Prijs:** €500-1.500 eenmalig

| Automatisering | Complexiteit | Wat Het Doet |
|----------------|--------------|--------------|
| **Order processing** | Medium | Webshop order → factuur + verzendlabel |
| **Content distributie** | Medium | Blog → social posts (LinkedIn, X, FB) |
| **Customer onboarding** | Medium | Nieuwe klant → volledige setup flow |
| **Invoice automation** | Medium | Mollie betaling → boekhouding update |
| **Review aggregatie** | Medium | Verzamel reviews → één dashboard |
| **AI email categorisatie** | Medium | Inkomende mail → labels + routing |

**Vereisten:**
- API toegang tot klant's systemen
- Credentials setup
- Testdata voor ontwikkeling

---

### Tier 3: Geavanceerde Automaties (Hoge Complexiteit)

**Doorlooptijd:** 2-4 weken  
**Prijs:** €1.500-5.000+ eenmalig

| Automatisering | Complexiteit | Wat Het Doet |
|----------------|--------------|--------------|
| **AI Chatbot backend** | Hoog | WhatsApp/Telegram → AI response → escalatie |
| **Lead scoring + nurturing** | Hoog | AI-gebaseerde lead classificatie |
| **Multi-platform publishing** | Hoog | Content repurposing + scheduling |
| **Data sync pipelines** | Hoog | Realtime sync tussen systemen |
| **Custom reporting** | Hoog | Automatische rapportages + dashboards |
| **Faceless content pipeline** | Hoog | AI content → video → publishing |

**Vereisten:**
- Duidelijke requirements
- Toegang tot alle systemen
- Actieve samenwerking met klant

---

## 💰 Subscription Model (Automation-as-a-Service)

### Waarom Subscriptions?

1. **Recurring revenue** voor jou
2. **Zekerheid** voor klant (altijd support)
3. **Monitoring** van workflows
4. **Updates** wanneer APIs veranderen
5. **Uitbreiding** mogelijkheden over tijd

---

### Voorgestelde Subscription Tiers

#### 🌱 Starter - €99/maand

**Voor:** Kleine bedrijven met 1-3 simpele automaties

| Feature | Inbegrepen |
|---------|------------|
| Actieve workflows | Max 3 |
| Maandelijkse executions | 5.000 |
| Error monitoring | ✅ Basis |
| Support | Email (48u response) |
| Wijzigingen | 1 kleine aanpassing/maand |
| Uptime garantie | 95% |

**Ideaal voor:**
- Lead capture automaties
- Email notificaties
- Simpele integraties

---

#### 🚀 Business - €249/maand

**Voor:** Groeiende bedrijven met meerdere processen

| Feature | Inbegrepen |
|---------|------------|
| Actieve workflows | Max 10 |
| Maandelijkse executions | 25.000 |
| Error monitoring | ✅ Proactief + alerts |
| Support | Email + Chat (24u response) |
| Wijzigingen | 3 uur werk/maand |
| Uptime garantie | 99% |
| Maandelijks rapport | ✅ |
| Priority fixes | ✅ |

**Ideaal voor:**
- E-commerce automaties
- Multi-system integraties
- Content automation

---

#### 🏢 Professional - €499/maand

**Voor:** Bedrijven die zwaar leunen op automation

| Feature | Inbegrepen |
|---------|------------|
| Actieve workflows | Onbeperkt |
| Maandelijkse executions | 100.000 |
| Error monitoring | ✅ 24/7 + auto-recovery |
| Support | Telefoon + Chat (4u response) |
| Wijzigingen | 8 uur werk/maand |
| Uptime garantie | 99.5% |
| Wekelijks rapport | ✅ |
| Dedicated account manager | ✅ |
| Kwartaal review meeting | ✅ |
| New workflow development | 50% korting |

**Ideaal voor:**
- Kritieke bedrijfsprocessen
- Hoog volume operaties
- Complexe multi-step workflows

---

#### 🎯 Enterprise - Op maat (vanaf €999/maand)

**Voor:** Grote organisaties met custom requirements

| Feature | Inbegrepen |
|---------|------------|
| Alles van Professional | ✅ |
| Dedicated n8n instance | ✅ |
| Custom SLA | ✅ |
| On-site training | ✅ |
| Custom integraties | Inbegrepen |
| API development | Inbegrepen |

---

## 📋 Subscription Implementatie - Database Schema

Je hebt al een `Subscription` model in Prisma. Hier is een uitbreiding specifiek voor automation:

```prisma
// Toevoegen aan schema.prisma

model AutomationSubscription {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Plan details
  planType        String   // starter, business, professional, enterprise
  planName        String
  monthlyPrice    Float
  
  // Limits
  maxWorkflows       Int
  maxExecutions      Int
  supportHoursIncl   Float  @default(0)
  supportHoursUsed   Float  @default(0)
  
  // Stripe
  stripeSubscriptionId String? @unique
  stripeCustomerId     String?
  
  // Status
  status          String   @default("active")
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  workflows       AutomationWorkflow[]
  executionLogs   ExecutionLog[]
  supportRequests AutomationSupportRequest[]
  
  @@index([userId])
  @@index([status])
}

model AutomationWorkflow {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    AutomationSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  // n8n reference
  n8nWorkflowId   String   @unique
  name            String
  description     String?
  
  // Status
  isActive        Boolean  @default(false)
  
  // Metadata
  category        String   // lead-capture, content, order, integration, custom
  complexity      String   // simple, medium, complex
  
  // Metrics (updated by monitoring)
  totalExecutions    Int      @default(0)
  successfulExecutions Int    @default(0)
  failedExecutions   Int      @default(0)
  lastExecutionAt    DateTime?
  lastErrorAt        DateTime?
  lastError          String?
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([subscriptionId])
  @@index([n8nWorkflowId])
}

model ExecutionLog {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    AutomationSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  workflowId      String?
  n8nExecutionId  String
  
  status          String   // success, error, running
  startedAt       DateTime
  finishedAt      DateTime?
  durationMs      Int?
  
  errorMessage    String?
  
  createdAt       DateTime @default(now())
  
  @@index([subscriptionId])
  @@index([workflowId])
  @@index([status])
}

model AutomationSupportRequest {
  id              String   @id @default(cuid())
  subscriptionId  String
  subscription    AutomationSubscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  
  type            String   // bug, change, new-feature, question
  priority        String   @default("normal") // low, normal, high, urgent
  
  subject         String
  description     String
  
  // Time tracking
  estimatedHours  Float?
  actualHours     Float?
  
  // Status
  status          String   @default("open") // open, in-progress, resolved, closed
  
  resolution      String?
  resolvedAt      DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([subscriptionId])
  @@index([status])
}
```

---

## 🖥️ Website Pagina Structuur

### Pagina: `/diensten/automation`

```
1. Hero Section
   - "Automatiseer uw bedrijfsprocessen"
   - "Bespaar uren per week met slimme workflows"
   - CTA: "Gratis Automation Scan"

2. Wat is automation (uitleg)
   - Visuele flow diagram
   - Voorbeelden per industrie

3. Diensten overzicht
   - Quick Wins (Tier 1)
   - Business Automaties (Tier 2)
   - Geavanceerde Automaties (Tier 3)

4. Subscription pakketten
   - Vergelijkingstabel
   - Pricing cards
   - "Meest gekozen" highlight op Business

5. Use Cases / Voorbeelden
   - Lead processing
   - E-commerce orders
   - Content automation
   - AI chatbots

6. Hoe het werkt (process)
   1. Gratis intake gesprek
   2. Automation scan & voorstel
   3. Ontwikkeling & testen
   4. Go-live + monitoring
   5. Ongoing support (subscription)

7. FAQ
   - Wat als mijn systeem niet ondersteund wordt?
   - Hoe veilig is mijn data?
   - Wat als er iets kapot gaat?
   - Kan ik overstappen van plan?

8. CTA Section
   - "Start met een gratis automation scan"
   - Contactformulier
```

---

## ⚠️ Eerlijke Beperkingen

### Wat Je NOG NIET Kunt Aanbieden (met huidige setup)

| Service | Reden | Oplossing |
|---------|-------|-----------|
| **24/7 monitoring met auto-fix** | Vereist dedicated DevOps | → Upgrade infra eerst |
| **Gegarandeerde response < 1u** | Solo developer | → Eerlijk communiceren |
| **100+ concurrent klanten** | Capacity limiet | → Schaal geleidelijk |
| **Real-time video processing** | Zware compute nodig | → External service (Shotstack) |
| **Native mobile app automation** | Beperkte tooling | → Focus op web/API |

### Eerlijke Communicatie naar Klanten

```
✅ ZEG:
"Wij bouwen op betrouwbare, open-source automation technologie"
"Uw workflows draaien op dedicated infrastructuur"
"Wij monitoren proactief en lossen problemen snel op"

❌ ZEG NIET:
"Wij garanderen 100% uptime"
"Wij hebben een groot team klaarstaan"
"Wij kunnen alles automatiseren"
```

---

## 💡 Marketing Strategie

### Positionering

```
"Automation voor het MKB - Persoonlijk, Betaalbaar, Betrouwbaar"
```

### Unique Selling Points

1. **Transparante pricing** - Geen verborgen kosten
2. **Self-hosted** - Uw data blijft bij u
3. **Persoonlijke service** - Eén aanspreekpunt
4. **Geen vendor lock-in** - n8n is open-source
5. **Snelle oplevering** - Simpele automaties binnen dagen

### Lead Magnets

1. **Gratis Automation Scan** (15 min video call)
2. **"10 Processen Die U Vandaag Kunt Automatiseren"** (PDF)
3. **ROI Calculator** (interactieve tool)
4. **Workflow Template Pack** (5 gratis n8n templates)

---

## 📈 Opschaalplan

### Fase 1: Launch (Maand 1-3)
- Focus op 3-5 klanten
- Alleen Tier 1 & 2 automaties
- Starter & Business subscriptions
- Verzamel testimonials

### Fase 2: Validatie (Maand 4-6)
- Uitbreiden naar 10-15 klanten
- Tier 3 automaties toevoegen
- Professional subscription lanceren
- Templates library bouwen

### Fase 3: Schalen (Maand 7-12)
- Hire eerste support medewerker
- Enterprise tier lanceren
- Partner programma (white-label)
- Automated onboarding

---

## 🎯 Conclusie & Aanbevelingen

### Start Hiermee

1. **Voeg subscription tiers toe aan website**
2. **Maak "Gratis Automation Scan" formulier**
3. **Bouw 5 template workflows voor demo's**
4. **Creëer case study van YouTube automation**

### Realistische Verwachtingen

| Metric | Maand 3 | Maand 6 | Maand 12 |
|--------|---------|---------|----------|
| Klanten | 3-5 | 8-12 | 20-30 |
| MRR | €500-800 | €1.500-2.500 | €4.000-8.000 |
| Eenmalig werk | €2.000-4.000 | €5.000-10.000 | €15.000-25.000 |

### Kritieke Succesfactoren

1. **Betrouwbaarheid** - Workflows moeten 99%+ werken
2. **Communicatie** - Proactief over issues informeren
3. **Documentatie** - Elke workflow goed gedocumenteerd
4. **Monitoring** - Error alerts binnen minuten

---

*Document gegenereerd: Februari 2026*
*Gebaseerd op huidige n8n MCP Server setup*
