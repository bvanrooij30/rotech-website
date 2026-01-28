# 🤖 ROTECH AI AGENTS - MASTER IMPLEMENTATIE PROMPT

---

## 📋 PROJECTOVERZICHT

### Doel
Ontwikkel een complete suite van 11 gespecialiseerde AI Agents voor Ro-Tech Development die elk een specifieke dienst volledig kunnen beheren, uitvoeren, documenteren en optimaliseren. Deze agents worden geïntegreerd in het RoTech Portal voor real-time monitoring en management.

### Diensten & Agents

| # | Agent | Dienst | Kernfunctie |
|---|-------|--------|-------------|
| 00 | IntakeAgent | Klant Intake | Lead kwalificatie, requirement gathering |
| 01 | StarterWebsiteAgent | Starter Website | One-page website projecten |
| 02 | BusinessWebsiteAgent | Business Website | Professionele bedrijfswebsites |
| 03 | WebshopAgent | Webshop/E-commerce | Complete webshop oplossingen |
| 04 | MaatwerkAgent | Maatwerk Web App | Complexe applicaties |
| 05 | AutomatiseringAgent | Digital Process Automation | n8n/Make workflows |
| 06 | PWAAgent | Progressive Web App | Installeerbare web apps |
| 07 | APIIntegratieAgent | API Integraties | Systeem koppelingen |
| 08 | SEOAgent | SEO Optimalisatie | Zoekmachine optimalisatie |
| 09 | OnderhoudAgent | Website Onderhoud | Beheer & monitoring |
| 10 | ChatbotAgent | AI Chatbot | Klantenservice bots |

---

## 🏗️ ARCHITECTUUR

### Core Modules (Gedeeld)

```
ai-agents/
├── MASTER-PROMPT-AI-AGENTS.md      # Dit document
├── core/                            # Gedeelde functionaliteit
│   ├── base-agent.ts               # Abstract base class
│   ├── logger.ts                   # Logging systeem
│   ├── error-handler.ts            # Error handling & recovery
│   ├── pdf-generator.ts            # PDF rapportage
│   ├── prompt-engine.ts            # Prompt generatie
│   ├── project-manager.ts          # Project lifecycle
│   ├── notification-service.ts     # Alerts & notificaties
│   ├── metrics-collector.ts        # Performance metrics
│   └── types.ts                    # Shared TypeScript types
├── agents/                          # Individuele agents
│   ├── 00-intake/
│   │   ├── intake-agent.ts
│   │   ├── prompts/
│   │   └── templates/
│   ├── 01-starter-website/
│   ├── 02-business-website/
│   ├── 03-webshop/
│   ├── 04-maatwerk/
│   ├── 05-automatisering/
│   ├── 06-pwa/
│   ├── 07-api-integratie/
│   ├── 08-seo/
│   ├── 09-onderhoud/
│   └── 10-chatbot/
├── api/                             # API routes voor portal
│   └── agent-routes.ts
├── dashboard/                       # Portal integratie
│   └── components/
└── tests/                           # Test suites
    └── agent-tests/
```

---

## 🔧 CORE MODULES SPECIFICATIES

### 1. BaseAgent (Abstract Class)

```typescript
abstract class BaseAgent {
  // Identificatie
  abstract agentId: string;
  abstract agentName: string;
  abstract agentType: AgentType;
  abstract version: string;
  
  // Lifecycle
  abstract initialize(): Promise<void>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract healthCheck(): Promise<HealthStatus>;
  
  // Core functies
  abstract processRequest(request: AgentRequest): Promise<AgentResponse>;
  abstract generatePrompt(context: PromptContext): Promise<string>;
  abstract createReport(data: ReportData): Promise<PDFDocument>;
  
  // Project management
  abstract createProject(specs: ProjectSpecs): Promise<Project>;
  abstract updateProject(projectId: string, updates: ProjectUpdate): Promise<Project>;
  abstract getProjectStatus(projectId: string): Promise<ProjectStatus>;
  
  // Logging & Metrics
  protected log(level: LogLevel, message: string, data?: object): void;
  protected recordMetric(name: string, value: number, tags?: Tags): void;
  
  // Error handling
  protected handleError(error: Error, context: ErrorContext): Promise<void>;
  protected retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>;
}
```

### 2. Logger System

```typescript
interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  agentId: string;
  projectId?: string;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
}

class AgentLogger {
  // Log levels
  debug(message: string, data?: object): void;
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, error?: Error, data?: object): void;
  critical(message: string, error?: Error, data?: object): void;
  
  // Query logs
  getLogs(filter: LogFilter): Promise<LogEntry[]>;
  exportLogs(format: 'json' | 'csv' | 'pdf'): Promise<Buffer>;
  
  // Real-time streaming
  subscribe(callback: (log: LogEntry) => void): Unsubscribe;
}
```

### 3. Error Handler

```typescript
interface ErrorContext {
  agentId: string;
  projectId?: string;
  operation: string;
  input?: unknown;
  timestamp: Date;
}

class AgentErrorHandler {
  // Error categorization
  categorize(error: Error): ErrorCategory;
  
  // Recovery strategies
  recover(error: Error, context: ErrorContext): Promise<RecoveryResult>;
  
  // Troubleshooting
  diagnose(error: Error): Promise<DiagnosisReport>;
  suggestFixes(error: Error): Promise<FixSuggestion[]>;
  
  // Escalation
  shouldEscalate(error: Error): boolean;
  escalateToHuman(error: Error, context: ErrorContext): Promise<void>;
  
  // Learning
  recordErrorPattern(error: Error, solution: string): Promise<void>;
  findPreviousSolution(error: Error): Promise<string | null>;
}
```

### 4. PDF Generator

```typescript
interface PDFTemplate {
  id: string;
  name: string;
  category: 'report' | 'invoice' | 'proposal' | 'documentation';
  sections: PDFSection[];
}

class PDFGenerator {
  // Template management
  loadTemplate(templateId: string): Promise<PDFTemplate>;
  
  // Generation
  generate(template: PDFTemplate, data: object): Promise<Buffer>;
  generateReport(type: ReportType, data: ReportData): Promise<Buffer>;
  
  // Report types
  generateProjectReport(projectId: string): Promise<Buffer>;
  generateProgressReport(projectId: string): Promise<Buffer>;
  generateAuditReport(auditData: AuditData): Promise<Buffer>;
  generateInvoice(invoiceData: InvoiceData): Promise<Buffer>;
  
  // Customization
  addBranding(pdf: Buffer, branding: BrandingOptions): Promise<Buffer>;
  addWatermark(pdf: Buffer, text: string): Promise<Buffer>;
}
```

### 5. Prompt Engine

```typescript
interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  basePrompt: string;
  variables: PromptVariable[];
  examples: PromptExample[];
  qualityScore: number;
}

class PromptEngine {
  // Template management
  loadTemplate(templateId: string): Promise<PromptTemplate>;
  createTemplate(template: PromptTemplate): Promise<string>;
  
  // Generation
  generate(templateId: string, context: PromptContext): Promise<string>;
  enhance(prompt: string, options: EnhanceOptions): Promise<string>;
  
  // Quality
  evaluatePrompt(prompt: string): Promise<PromptQuality>;
  optimizePrompt(prompt: string): Promise<OptimizedPrompt>;
  
  // Learning
  recordSuccess(promptId: string, result: PromptResult): Promise<void>;
  improveFromFeedback(promptId: string, feedback: string): Promise<PromptTemplate>;
}
```

### 6. Project Manager

```typescript
interface Project {
  id: string;
  clientId: string;
  agentId: string;
  type: ProjectType;
  status: ProjectStatus;
  phases: ProjectPhase[];
  timeline: Timeline;
  budget: Budget;
  documents: Document[];
  logs: LogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

class ProjectManager {
  // CRUD
  createProject(specs: ProjectSpecs): Promise<Project>;
  getProject(projectId: string): Promise<Project>;
  updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
  archiveProject(projectId: string): Promise<void>;
  
  // Lifecycle
  startPhase(projectId: string, phaseId: string): Promise<void>;
  completePhase(projectId: string, phaseId: string, deliverables: Deliverable[]): Promise<void>;
  
  // Monitoring
  getProgress(projectId: string): Promise<ProgressReport>;
  getHealth(projectId: string): Promise<HealthReport>;
  
  // Timeline
  estimateCompletion(projectId: string): Promise<Date>;
  detectDelays(projectId: string): Promise<Delay[]>;
  
  // Documents
  addDocument(projectId: string, document: Document): Promise<void>;
  generateDocumentation(projectId: string): Promise<Documentation>;
}
```

---

## 🎯 AGENT SPECIFICATIES

### Agent 00: IntakeAgent (Klant Intake)

**Doel:** Automatische lead kwalificatie en requirement gathering

**Kernfuncties:**
1. Lead scoring en kwalificatie
2. Automatische requirement extraction uit klantgesprekken
3. Pakket matching (welk pakket past bij de klant)
4. Prijsindicatie generatie
5. Intake rapport creatie
6. CRM synchronisatie

**Prompt Specialisaties:**
- Intake vragenlijst generatie
- Requirement samenvatting
- Pakket aanbevelingen met onderbouwing
- Follow-up email templates

**PDF Rapporten:**
- Intake samenvatting
- Requirement document
- Budgetindicatie
- Tijdlijn voorstel

---

### Agent 01: StarterWebsiteAgent

**Doel:** Volledig beheer van one-page website projecten (€997+)

**Kernfuncties:**
1. Project setup en configuratie
2. Design brief generatie
3. Content structuur planning
4. Development checklist management
5. Quality assurance
6. Deployment automation
7. Klantcommunicatie

**Prompt Specialisaties:**
- One-page website content structuur
- Hero sectie copy
- Call-to-action optimalisatie
- SEO meta content
- Contactformulier configuratie

**PDF Rapporten:**
- Project voorstel
- Design specificaties
- Voortgangsrapportage
- Opleverdocument
- Handleiding

---

### Agent 02: BusinessWebsiteAgent

**Doel:** Beheer van professionele bedrijfswebsites (€2.497+)

**Kernfuncties:**
1. Multi-page site planning
2. CMS configuratie
3. Blog/nieuws module setup
4. Geavanceerde SEO implementatie
5. Analytics integratie
6. Content migratie
7. Training materiaal generatie

**Prompt Specialisaties:**
- Pagina-specifieke content
- Blog artikel structuren
- SEO-geoptimaliseerde teksten
- CMS handleiding
- Lokale SEO content

**PDF Rapporten:**
- Sitemap document
- Content planning
- SEO strategie rapport
- CMS handleiding
- Overdracht document

---

### Agent 03: WebshopAgent

**Doel:** E-commerce projecten volledig beheren (€3.997+)

**Kernfuncties:**
1. Webshop architectuur planning
2. Product catalogus structurering
3. Betaalsysteem integratie
4. Voorraad- en orderbeheer setup
5. Verzendkoppeling configuratie
6. Conversie optimalisatie
7. E-commerce analytics

**Prompt Specialisaties:**
- Productbeschrijvingen
- Categorie structuur
- Checkout flow optimalisatie
- Email templates (bestelbevestiging, verzending)
- Retourbeleid documentatie

**PDF Rapporten:**
- E-commerce strategie
- Product import templates
- Betalingsprovider handleiding
- Order fulfillment handleiding
- Maandelijkse verkooprapporten

---

### Agent 04: MaatwerkAgent

**Doel:** Complexe web applicaties beheren (€7.500+)

**Kernfuncties:**
1. Requirements analyse en documentatie
2. Technische architectuur ontwerp
3. Database modellering
4. API design en documentatie
5. User story management
6. Sprint planning
7. Code review coördinatie
8. Deployment pipeline management

**Prompt Specialisaties:**
- Technische specificaties
- API documentatie
- Database schema's
- User stories en acceptance criteria
- Testplannen
- Deployment checklists

**PDF Rapporten:**
- Technische architectuur document
- API specificaties
- Database ERD
- Sprint reports
- Acceptatie testresultaten
- Productie deployment rapport

---

### Agent 05: AutomatiseringAgent

**Doel:** Digital Process Automation projecten (n8n, Make.com)

**Kernfuncties:**
1. Proces analyse en mapping
2. Workflow design
3. n8n/Make.com configuratie
4. Trigger en conditie setup
5. Error handling implementatie
6. Monitoring dashboard
7. Performance optimalisatie

**Prompt Specialisaties:**
- Proces flow documentatie
- Workflow stap beschrijvingen
- Error handling scenario's
- API koppeling specificaties
- Monitoring alerts

**PDF Rapporten:**
- Proces analyse rapport
- Workflow documentatie
- Implementatie handleiding
- Monitoring rapport
- ROI berekening

---

### Agent 06: PWAAgent

**Doel:** Progressive Web App development

**Kernfuncties:**
1. PWA feature planning
2. Service worker configuratie
3. Manifest setup
4. Offline functionaliteit
5. Push notificatie setup
6. App store-like installatie
7. Performance optimalisatie

**Prompt Specialisaties:**
- PWA feature specificaties
- Offline content strategie
- Push notificatie teksten
- App beschrijvingen
- Installatie instructies

**PDF Rapporten:**
- PWA audit rapport
- Feature specificaties
- Performance rapport
- Lighthouse scores
- Installatie handleiding

---

### Agent 07: APIIntegratieAgent

**Doel:** Systeem koppelingen en API integraties

**Kernfuncties:**
1. Integratie analyse
2. API mapping
3. Data transformatie design
4. Webhook configuratie
5. Rate limiting implementatie
6. Error handling
7. Monitoring en alerting

**Prompt Specialisaties:**
- API endpoint documentatie
- Data mapping specificaties
- Error scenario's
- Webhook payload structuren
- Integratie test cases

**PDF Rapporten:**
- Integratie analyse
- API documentatie
- Data flow diagram
- Test resultaten
- Monitoring rapport

---

### Agent 08: SEOAgent

**Doel:** Zoekmachine optimalisatie

**Kernfuncties:**
1. SEO audit uitvoering
2. Keyword research
3. On-page optimalisatie
4. Technical SEO fixes
5. Content strategie
6. Linkbuilding planning
7. Ranking monitoring
8. Competitor analyse

**Prompt Specialisaties:**
- Meta titles en descriptions
- Heading structuur
- Alt teksten
- Schema markup
- Content outlines
- Linkbuilding outreach

**PDF Rapporten:**
- SEO audit rapport
- Keyword research rapport
- Competitor analyse
- Ranking rapport (maandelijks)
- Content kalender
- Backlink profiel

---

### Agent 09: OnderhoudAgent

**Doel:** Website onderhoud en beheer

**Kernfuncties:**
1. Uptime monitoring
2. Security scanning
3. Backup management
4. Performance monitoring
5. Update management
6. Content wijzigingen
7. Incident response
8. Kwartaal rapportages

**Prompt Specialisaties:**
- Incident rapporten
- Update notificaties
- Security alerts
- Performance suggesties
- Klant communicatie

**PDF Rapporten:**
- Uptime rapport
- Security scan rapport
- Performance rapport
- Backup status
- Kwartaal overzicht
- Incident rapport

---

### Agent 10: ChatbotAgent

**Doel:** AI Chatbot development en beheer

**Kernfuncties:**
1. Chatbot personality design
2. Knowledge base opbouw
3. Intent mapping
4. Response templates
5. Escalatie flows
6. Analytics en insights
7. Continuous improvement

**Prompt Specialisaties:**
- Chatbot responses
- Intent classificatie
- Fallback berichten
- Escalatie triggers
- Persoonlijkheid en tone of voice
- FAQ antwoorden

**PDF Rapporten:**
- Chatbot analyse rapport
- Conversatie analytics
- Intent coverage rapport
- Escalatie rapport
- Improvement suggestions
- ROI rapport

---

## 🔐 SECURITY & COMPLIANCE

### Data Protection
- Alle klantdata versleuteld at rest en in transit
- GDPR compliance voor persoonlijke gegevens
- Audit logging voor alle data toegang
- Data retention policies per project type

### Access Control
- Role-based access (Admin, Developer, Client)
- JWT token authenticatie
- Rate limiting per agent
- IP whitelisting optie

### Error Handling
- Geen sensitive data in error logs
- Automatic PII redaction
- Secure error reporting
- Incident classification

---

## 📊 PORTAL INTEGRATIE

### Dashboard Componenten

```typescript
// Agent status overview
interface AgentDashboard {
  agents: AgentStatus[];
  activeProjects: number;
  completedToday: number;
  errorRate: number;
  avgResponseTime: number;
}

// Per-agent detail view
interface AgentDetailView {
  agent: Agent;
  projects: Project[];
  recentLogs: LogEntry[];
  metrics: MetricsSummary;
  health: HealthReport;
}

// Project timeline
interface ProjectTimeline {
  project: Project;
  phases: PhaseProgress[];
  milestones: Milestone[];
  predictions: Prediction[];
}
```

### Real-time Updates
- WebSocket verbinding voor live updates
- Agent status changes
- Project progress updates
- Error notifications
- Metric streaming

### Notifications
- Email notificaties voor kritieke events
- In-app notificaties
- Slack/Teams integratie
- SMS voor urgente issues

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Elke agent methode getest
- Mock data voor externe services
- Error scenario coverage

### Integration Tests
- Agent-to-agent communicatie
- Database operations
- External API calls

### End-to-End Tests
- Complete project workflows
- Error recovery scenarios
- Performance benchmarks

### Load Tests
- Concurrent project handling
- PDF generation under load
- API response times

---

## 📈 MONITORING & OBSERVABILITY

### Metrics
- Project completion rate
- Average response time
- Error rate per agent
- Resource utilization
- Client satisfaction scores

### Alerts
- Agent health degradation
- Error rate threshold
- Performance degradation
- Security incidents
- Budget overruns

### Dashboards
- Real-time agent status
- Project pipeline view
- Error analytics
- Performance trends
- Business metrics

---

## 🚀 DEPLOYMENT

### Environment Variables
```env
# Core
AI_AGENTS_ENABLED=true
AI_AGENTS_LOG_LEVEL=info

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# Database
DATABASE_URL=postgresql://...

# PDF Generation
PDF_STORAGE_PATH=/tmp/pdf
PDF_BRANDING_LOGO=/public/logo.png

# Notifications
SMTP_HOST=smtp.resend.com
SLACK_WEBHOOK_URL=https://...

# Monitoring
SENTRY_DSN=https://...
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Infrastructure
- [ ] BaseAgent abstract class
- [ ] Logger system
- [ ] Error handler
- [ ] Types definitions
- [ ] Database schema

### Phase 2: Shared Services
- [ ] PDF generator
- [ ] Prompt engine
- [ ] Project manager
- [ ] Notification service
- [ ] Metrics collector

### Phase 3: Individual Agents
- [ ] IntakeAgent (00)
- [ ] StarterWebsiteAgent (01)
- [ ] BusinessWebsiteAgent (02)
- [ ] WebshopAgent (03)
- [ ] MaatwerkAgent (04)
- [ ] AutomatiseringAgent (05)
- [ ] PWAAgent (06)
- [ ] APIIntegratieAgent (07)
- [ ] SEOAgent (08)
- [ ] OnderhoudAgent (09)
- [ ] ChatbotAgent (10)

### Phase 4: Portal Integration
- [ ] API routes
- [ ] Dashboard components
- [ ] Real-time updates
- [ ] Notification system

### Phase 5: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Documentation
- [ ] Deployment

---

## 🎯 SUCCESS CRITERIA

1. **Functionality**: Elke agent kan zijn dienst volledig beheren
2. **Reliability**: 99.9% uptime, graceful error handling
3. **Performance**: Responses < 2 seconden, PDF < 5 seconden
4. **Quality**: Gegenereerde prompts scoren 8+ op kwaliteit
5. **Visibility**: Real-time inzicht in alle agents via portal
6. **Documentation**: Complete handleiding en API docs
7. **Scalability**: Kan 100+ gelijktijdige projecten aan

---

*RoTech AI Agents - Master Prompt v1.0*
*Datum: Januari 2026*
