---
name: rotech-automation
description: Enterprise automation engineering standaard voor n8n workflows, API integraties en procesautomatisering. Gebruik bij het ontwerpen, bouwen en onderhouden van automation oplossingen voor klanten.
---

# RoTech Automation Engineering Standaard

## Automation Stack

| Component | Technologie | Doel |
|-----------|-------------|------|
| Workflow Engine | n8n (self-hosted) | Workflow orchestratie |
| Backend | Next.js API Routes | Webhook endpoints, data processing |
| Database | Prisma + PostgreSQL | Workflow tracking, execution logs |
| Monitoring | Custom dashboard | Real-time status, error alerts |
| Payments | Stripe Subscriptions | Maandelijkse abonnementen |

## Diensten Aanbod

### Eenmalige Automations (v2.0 - februari 2026)

| Tier | Prijs | Levertijd | Voorbeelden |
|------|-------|-----------|-------------|
| Quick Win | €49-€149 | 1-3 dagen | Email responder, social posting, review alerts |
| Core Business | €149-€449 | 5-14 dagen | WhatsApp bot, lead→CRM, offerte generator |
| AI-Powered | €449-€1.495 | 14-28 dagen | AI klantenservice, content pipeline, CRM sync |

### Abonnementen (v2.0 - februari 2026)

| Plan | Prijs/mnd | Workflows | Executions | Support |
|------|-----------|-----------|------------|---------|
| Starter | €129 | 3 | 5.000 | Email (48u) |
| Business | €349 | 10 | 25.000 | Prioriteit (24u) |
| Professional | €649 | Onbeperkt | 100.000 | Dedicated (4u) |
| Enterprise | Vanaf €1.299 | Onbeperkt | Onbeperkt | Full-service |

> Prijzen halfjaarlijks gereviewed. Zie `rotech-pricing` skill voor volledig overzicht en update-protocol.

## Workflow Design Principes

### 1. Foutbestendigheid

Elke workflow moet:
- Error handling nodes bevatten
- Retry mechanisme hebben (max 3 retries)
- Foutnotificaties sturen naar admin
- Geen data verliezen bij crashes

### 2. Idempotentie

- Dezelfde input moet altijd hetzelfde resultaat geven
- Gebruik deduplicatie keys bij externe API calls
- Voorkom dubbele verwerking van webhooks

### 3. Monitoring

- Log elke execution (status, duur, errors)
- Dashboard met real-time metrics
- Alerts bij failure rate > 5%
- Dagelijkse health check

### 4. Schaalbaarheid

- Gebruik queue-based processing voor bulk operaties
- Rate limiting respecteren bij externe APIs
- Batch processing waar mogelijk

## Workflow Categorien

### Lead Capture & CRM
- Formulier → CRM (HubSpot, Pipedrive, etc.)
- Website bezoeker tracking
- Lead scoring met AI
- Automatische follow-up emails

### Content Automation
- Blog → Social media distributie
- AI content generatie
- Newsletter automatisering
- Review aggregatie

### E-commerce
- Order processing pipelines
- Voorraad synchronisatie
- Automatische factuurverwerking
- Abandoned cart emails

### Business Process
- Invoice automatisering
- Onboarding workflows
- Rapportage dashboards
- Data sync tussen systemen

## Intake Questionnaire Flow

1. Klant vult intake formulier in op website
2. Systeem slaat op in AutomationIntake tabel
3. Stripe checkout voor geselecteerd plan
4. Na betaling: intake status → "submitted"
5. Admin reviewt en plant kickoff
6. Workflows worden opgezet in n8n

## API Integratie Standaard

### Webhook Endpoints

```typescript
// Standaard webhook ontvanger
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-webhook-signature");
  const body = await request.text();
  
  // 1. Verificeer signature
  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  
  // 2. Parse en valideer payload
  const data = JSON.parse(body);
  
  // 3. Process idempotent
  // 4. Return 200 snel (async processing)
  return NextResponse.json({ received: true });
}
```

### Rate Limiting

- Respecteer API rate limits van externe diensten
- Implementeer exponential backoff bij 429 responses
- Gebruik queue voor bulk operaties
