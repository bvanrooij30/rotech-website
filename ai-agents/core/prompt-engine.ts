/**
 * RoTech AI Agents - Prompt Engine
 * Geavanceerd prompt generatie en optimalisatie systeem
 */

import {
  PromptTemplate,
  PromptContext,
  PromptVariable,
  PromptExample,
  PromptQuality,
  OptimizedPrompt,
  PromptResult,
  PromptCategory,
  AgentType,
  ProjectType,
} from './types';
import { AgentLogger } from './logger';

// ============================================
// PROMPT QUALITY CRITERIA
// ============================================

interface QualityCriteria {
  name: string;
  weight: number;
  check: (prompt: string) => number; // Returns 0-1
}

const QUALITY_CRITERIA: QualityCriteria[] = [
  {
    name: 'length',
    weight: 0.15,
    check: (prompt) => {
      const length = prompt.length;
      if (length < 50) return 0.3;
      if (length < 200) return 0.6;
      if (length < 500) return 0.9;
      if (length < 2000) return 1.0;
      if (length < 5000) return 0.8;
      return 0.6; // Too long
    },
  },
  {
    name: 'specificity',
    weight: 0.25,
    check: (prompt) => {
      // Check for specific details
      const specificIndicators = [
        /\b(exact|specific|precies|concreet)\b/i,
        /\b\d+\s*(px|%|em|rem|seconden?|minuten?|uur|dagen?)\b/i,
        /\b(moet|dient|verplicht|altijd|nooit)\b/i,
        /\b(stap\s*\d|fase\s*\d|punt\s*\d)\b/i,
      ];
      const matches = specificIndicators.filter(regex => regex.test(prompt));
      return Math.min(1, matches.length / 3);
    },
  },
  {
    name: 'clarity',
    weight: 0.25,
    check: (prompt) => {
      // Penalize vague language
      const vagueTerms = [
        /\b(misschien|wellicht|mogelijk|eventueel|ongeveer|zo'n|enz\.?|etc\.?)\b/gi,
      ];
      const vagueMatches = vagueTerms.reduce((count, regex) => {
        const matches = prompt.match(regex);
        return count + (matches ? matches.length : 0);
      }, 0);
      return Math.max(0, 1 - (vagueMatches * 0.1));
    },
  },
  {
    name: 'structure',
    weight: 0.20,
    check: (prompt) => {
      const structureIndicators = [
        /^#+\s/m, // Markdown headers
        /^\d+\./m, // Numbered lists
        /^[-*]\s/m, // Bullet points
        /\n\n/, // Paragraphs
        /```/, // Code blocks
        /\|.*\|/, // Tables
      ];
      const matches = structureIndicators.filter(regex => regex.test(prompt));
      return Math.min(1, matches.length / 3);
    },
  },
  {
    name: 'completeness',
    weight: 0.15,
    check: (prompt) => {
      // Check for complete instructions
      const completenessIndicators = [
        /\b(context|achtergrond|situatie)\b/i,
        /\b(doel|objective|resultaat)\b/i,
        /\b(output|format|formaat)\b/i,
        /\b(voorbeeld|example)\b/i,
        /\b(belangrijk|let\s+op|note)\b/i,
      ];
      const matches = completenessIndicators.filter(regex => regex.test(prompt));
      return Math.min(1, matches.length / 3);
    },
  },
];

// ============================================
// PROMPT TEMPLATES DATABASE
// ============================================

const BUILTIN_TEMPLATES: PromptTemplate[] = [
  // Project Planning Templates
  {
    id: 'project-scope-definition',
    name: 'Project Scope Definitie',
    description: 'Definieer de volledige scope van een project',
    category: 'project-planning',
    agentType: 'maatwerk',
    basePrompt: `# Project Scope Definitie

## Context
Je bent een ervaren project manager bij Ro-Tech Development. Je taak is om een complete scope definitie te maken voor het volgende project.

## Projectinformatie
- **Klant:** {{clientName}}
- **Project Type:** {{projectType}}
- **Budget:** {{budget}}
- **Deadline:** {{deadline}}

## Klant Requirements
{{requirements}}

## Opdracht
Maak een gedetailleerde scope definitie met:

1. **Project Overzicht** - Korte beschrijving van het project
2. **Doelstellingen** - SMART geformuleerde doelen
3. **Deliverables** - Concrete op te leveren producten
4. **Scope Grenzen** - Wat valt NIET binnen de scope
5. **Aannames** - Aannames waarop de scope is gebaseerd
6. **Afhankelijkheden** - Externe afhankelijkheden
7. **Risico's** - Potentiële risico's en mitigatie
8. **Success Criteria** - Meetbare criteria voor succes

## Output Format
Lever een gestructureerd Markdown document op dat direct bruikbaar is voor de klant.`,
    variables: [
      { name: 'clientName', description: 'Naam van de klant', type: 'string', required: true },
      { name: 'projectType', description: 'Type project', type: 'string', required: true },
      { name: 'budget', description: 'Budget indicatie', type: 'string', required: false },
      { name: 'deadline', description: 'Gewenste deadline', type: 'string', required: false },
      { name: 'requirements', description: 'Klant requirements', type: 'string', required: true },
    ],
    examples: [],
    qualityScore: 9.2,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'website-content-structure',
    name: 'Website Content Structuur',
    description: 'Genereer de content structuur voor een website',
    category: 'content-generation',
    agentType: 'business-website',
    basePrompt: `# Website Content Structuur Generator

## Context
Je bent een ervaren UX copywriter en content strategist. Genereer een complete content structuur voor een nieuwe website.

## Klant Informatie
- **Bedrijfsnaam:** {{companyName}}
- **Branche:** {{industry}}
- **Doelgroep:** {{targetAudience}}
- **USP's:** {{usps}}

## Website Type
{{websiteType}} ({{pageCount}} pagina's)

## Opdracht
Creëer voor elke pagina:

### Per Pagina
1. **Pagina Titel** - SEO-vriendelijke titel
2. **Hero Sectie**
   - Headline (max 10 woorden, krachtig)
   - Subheadline (1-2 zinnen)
   - CTA tekst
3. **Secties** (3-5 per pagina)
   - Sectie titel
   - Content beschrijving
   - Eventuele features/bullets
4. **Meta Tags**
   - Meta title (max 60 karakters)
   - Meta description (max 155 karakters)

## Richtlijnen
- Schrijf in het Nederlands
- Gebruik de informele "je/jij" aanspreekvorm
- Houd het concreet en scanbaar
- Focus op benefits, niet features
- Eindig secties met een call-to-action

## Output Format
Gestructureerd Markdown document per pagina.`,
    variables: [
      { name: 'companyName', description: 'Bedrijfsnaam', type: 'string', required: true },
      { name: 'industry', description: 'Branche/industrie', type: 'string', required: true },
      { name: 'targetAudience', description: 'Doelgroep beschrijving', type: 'string', required: true },
      { name: 'usps', description: 'Unique selling points', type: 'string', required: true },
      { name: 'websiteType', description: 'Type website', type: 'string', required: true },
      { name: 'pageCount', description: 'Aantal paginas', type: 'number', required: true },
    ],
    examples: [],
    qualityScore: 9.0,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'seo-meta-optimization',
    name: 'SEO Meta Tags Optimalisatie',
    description: 'Optimaliseer meta tags voor SEO',
    category: 'optimization',
    agentType: 'seo',
    basePrompt: `# SEO Meta Tags Generator

## Context
Je bent een SEO specialist met expertise in on-page optimalisatie. Genereer geoptimaliseerde meta tags.

## Pagina Informatie
- **URL:** {{pageUrl}}
- **Pagina Type:** {{pageType}}
- **Primair Keyword:** {{primaryKeyword}}
- **Secundaire Keywords:** {{secondaryKeywords}}
- **Huidige Content Samenvatting:** {{contentSummary}}

## Opdracht
Genereer geoptimaliseerde meta tags:

### 1. Meta Title
- Max 60 karakters
- Primair keyword aan het begin
- Bedrijfsnaam aan het einde (optioneel)
- Aantrekkelijk voor klikken

### 2. Meta Description
- Max 155 karakters
- Bevat primair keyword
- Call-to-action element
- Uniek voor deze pagina

### 3. Open Graph Tags
- og:title
- og:description
- og:type

### 4. Heading Structuur Suggestie
- H1 (1x)
- H2 suggesties (3-5x)

### 5. Schema Markup Suggestie
- Relevant schema type
- Belangrijke properties

## Output
Lever alle tags in een copy-paste ready format.`,
    variables: [
      { name: 'pageUrl', description: 'URL van de pagina', type: 'string', required: true },
      { name: 'pageType', description: 'Type pagina', type: 'string', required: true },
      { name: 'primaryKeyword', description: 'Primair keyword', type: 'string', required: true },
      { name: 'secondaryKeywords', description: 'Secundaire keywords', type: 'string', required: false },
      { name: 'contentSummary', description: 'Samenvatting van de content', type: 'string', required: true },
    ],
    examples: [],
    qualityScore: 8.8,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'api-documentation',
    name: 'API Documentatie Generator',
    description: 'Genereer complete API documentatie',
    category: 'documentation',
    agentType: 'api-integratie',
    basePrompt: `# API Documentatie Generator

## Context
Je bent een technisch schrijver gespecialiseerd in API documentatie. Maak duidelijke, developer-friendly documentatie.

## API Informatie
- **API Naam:** {{apiName}}
- **Base URL:** {{baseUrl}}
- **Authenticatie:** {{authMethod}}
- **Versie:** {{version}}

## Endpoints
{{endpoints}}

## Opdracht
Genereer complete documentatie per endpoint:

### Per Endpoint
1. **Titel & Beschrijving**
2. **HTTP Method & URL**
3. **Request**
   - Headers (tabel)
   - Path parameters
   - Query parameters
   - Body (JSON schema)
4. **Response**
   - Success response (met voorbeeld)
   - Error responses
5. **Code Voorbeelden**
   - cURL
   - JavaScript (fetch)
   - Python (requests)
6. **Rate Limiting** (indien van toepassing)

## Stijlgids
- Gebruik consistente terminologie
- Voorbeelden zijn realistisch
- Alle JSON is geformatteerd
- Foutmeldingen zijn beschrijvend

## Output Format
Markdown met code blocks.`,
    variables: [
      { name: 'apiName', description: 'Naam van de API', type: 'string', required: true },
      { name: 'baseUrl', description: 'Base URL', type: 'string', required: true },
      { name: 'authMethod', description: 'Authenticatie methode', type: 'string', required: true },
      { name: 'version', description: 'API versie', type: 'string', required: false, default: 'v1' },
      { name: 'endpoints', description: 'Lijst van endpoints', type: 'string', required: true },
    ],
    examples: [],
    qualityScore: 9.1,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'troubleshooting-guide',
    name: 'Troubleshooting Gids',
    description: 'Genereer een troubleshooting gids voor een probleem',
    category: 'troubleshooting',
    agentType: 'onderhoud',
    basePrompt: `# Troubleshooting Gids Generator

## Context
Je bent een senior developer die een troubleshooting gids opstelt voor het support team.

## Probleem
- **Error/Issue:** {{errorDescription}}
- **Component:** {{component}}
- **Frequentie:** {{frequency}}
- **Impact:** {{impact}}

## Bekende Oorzaken
{{knownCauses}}

## Opdracht
Maak een stapsgewijze troubleshooting gids:

### 1. Probleem Identificatie
- Symptomen herkennen
- Error berichten interpreteren
- Reproduceren van het probleem

### 2. Diagnose Stappen
Genummerde stappen van simpel naar complex:
1. [Eerste check]
2. [Tweede check]
...

### 3. Oplossingen per Oorzaak
Voor elke mogelijke oorzaak:
- **Oorzaak:** [beschrijving]
- **Diagnose:** Hoe herkennen?
- **Oplossing:** Stapsgewijze fix
- **Verificatie:** Hoe testen?

### 4. Escalatie Criteria
Wanneer escaleren naar development?

### 5. Preventie
Hoe dit in de toekomst voorkomen?

## Output Format
Gestructureerd document voor support team.`,
    variables: [
      { name: 'errorDescription', description: 'Beschrijving van de error', type: 'string', required: true },
      { name: 'component', description: 'Betrokken component', type: 'string', required: true },
      { name: 'frequency', description: 'Hoe vaak komt het voor', type: 'string', required: false },
      { name: 'impact', description: 'Impact op gebruikers', type: 'string', required: true },
      { name: 'knownCauses', description: 'Bekende oorzaken', type: 'string', required: false },
    ],
    examples: [],
    qualityScore: 8.9,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-email-template',
    name: 'Klant Email Template',
    description: 'Genereer professionele klant emails',
    category: 'communication',
    agentType: 'intake',
    basePrompt: `# Klant Email Generator

## Context
Je bent een accountmanager bij Ro-Tech Development. Schrijf professionele, persoonlijke emails.

## Email Type
{{emailType}}

## Klant Informatie
- **Naam:** {{clientName}}
- **Bedrijf:** {{companyName}}
- **Project:** {{projectName}}
- **Context:** {{context}}

## Aanvullende Informatie
{{additionalInfo}}

## Opdracht
Schrijf een email met:

### Structuur
1. **Persoonlijke begroeting**
2. **Opening** - Relevante context
3. **Kern** - Hoofdboodschap
4. **Call-to-action** - Wat is de volgende stap?
5. **Afsluiting** - Professioneel maar warm

### Stijlgids
- Gebruik "je/jij" (informeel maar professioneel)
- Brabantse no-nonsense toon
- Concreet en to-the-point
- Maximaal 200 woorden
- Ondertekening: Bart van Rooij, Ro-Tech Development

## Output
Complete email, klaar om te versturen.`,
    variables: [
      { name: 'emailType', description: 'Type email', type: 'string', required: true },
      { name: 'clientName', description: 'Voornaam klant', type: 'string', required: true },
      { name: 'companyName', description: 'Bedrijfsnaam', type: 'string', required: false },
      { name: 'projectName', description: 'Projectnaam', type: 'string', required: false },
      { name: 'context', description: 'Context/aanleiding', type: 'string', required: true },
      { name: 'additionalInfo', description: 'Extra informatie', type: 'string', required: false },
    ],
    examples: [],
    qualityScore: 8.7,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ============================================
// PROMPT ENGINE CLASS
// ============================================

export class PromptEngine {
  private logger: AgentLogger;
  private templates: Map<string, PromptTemplate> = new Map();
  private resultHistory: PromptResult[] = [];

  constructor(logger: AgentLogger) {
    this.logger = logger;
    this.initializeBuiltinTemplates();
  }

  private initializeBuiltinTemplates(): void {
    for (const template of BUILTIN_TEMPLATES) {
      this.templates.set(template.id, template);
    }
    this.logger.info('Prompt engine initialized', {
      templatesLoaded: this.templates.size,
    });
  }

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  getTemplate(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category);
  }

  getTemplatesByAgent(agentType: AgentType): PromptTemplate[] {
    return this.getAllTemplates().filter(t => t.agentType === agentType);
  }

  createTemplate(template: Omit<PromptTemplate, 'id' | 'qualityScore' | 'usageCount' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const fullTemplate: PromptTemplate = {
      ...template,
      id: this.generateTemplateId(template.name),
      qualityScore: this.evaluatePrompt(template.basePrompt).score,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(fullTemplate.id, fullTemplate);
    this.logger.info('Template created', { templateId: fullTemplate.id, name: fullTemplate.name });

    return fullTemplate;
  }

  updateTemplate(templateId: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const existing = this.templates.get(templateId);
    if (!existing) {
      return null;
    }

    const updated: PromptTemplate = {
      ...existing,
      ...updates,
      id: templateId,
      updatedAt: new Date(),
    };

    // Recalculate quality score if base prompt changed
    if (updates.basePrompt) {
      updated.qualityScore = this.evaluatePrompt(updates.basePrompt).score;
    }

    this.templates.set(templateId, updated);
    return updated;
  }

  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  // ============================================
  // PROMPT GENERATION
  // ============================================

  generate(templateId: string, context: PromptContext): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const startTime = Date.now();

    // Process variables
    let prompt = template.basePrompt;
    const variables = context.additionalContext || {};

    for (const variable of template.variables) {
      const value = variables[variable.name];
      const placeholder = `{{${variable.name}}}`;

      if (value !== undefined) {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
      } else if (variable.required) {
        throw new Error(`Missing required variable: ${variable.name}`);
      } else if (variable.default !== undefined) {
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(variable.default));
      } else {
        // Remove unfilled optional placeholders
        prompt = prompt.replace(new RegExp(placeholder, 'g'), '[Niet opgegeven]');
      }
    }

    // Enhance with context
    prompt = this.enhanceWithContext(prompt, context);

    // Update usage count
    template.usageCount++;
    this.templates.set(templateId, template);

    const duration = Date.now() - startTime;
    this.logger.promptGenerated(templateId, template.category, template.qualityScore);
    this.logger.performance('prompt-generation', duration, { templateId });

    return prompt;
  }

  generateCustom(basePrompt: string, context: PromptContext): string {
    let prompt = basePrompt;

    // Process any variables in the custom prompt
    const variables = context.additionalContext || {};
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Enhance with context
    prompt = this.enhanceWithContext(prompt, context);

    return prompt;
  }

  private enhanceWithContext(prompt: string, context: PromptContext): string {
    const enhancements: string[] = [];

    // Add project context
    if (context.projectType) {
      enhancements.push(`[Project Type: ${context.projectType}]`);
    }

    // Add client context
    if (context.clientInfo) {
      enhancements.push(`[Client: ${context.clientInfo.companyName}]`);
    }

    // Add requirements
    if (context.requirements && context.requirements.length > 0) {
      enhancements.push(`\n## Aanvullende Requirements\n${context.requirements.map(r => `- ${r}`).join('\n')}`);
    }

    // Add constraints
    if (context.constraints && context.constraints.length > 0) {
      enhancements.push(`\n## Beperkingen\n${context.constraints.map(c => `- ${c}`).join('\n')}`);
    }

    // Add previous output reference
    if (context.previousOutput) {
      enhancements.push(`\n## Vorige Output (ter referentie)\n${context.previousOutput.substring(0, 500)}...`);
    }

    if (enhancements.length > 0) {
      prompt += '\n\n---\n' + enhancements.join('\n');
    }

    return prompt;
  }

  // ============================================
  // PROMPT QUALITY EVALUATION
  // ============================================

  evaluatePrompt(prompt: string): PromptQuality {
    const scores: Record<string, number> = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const criteria of QUALITY_CRITERIA) {
      const score = criteria.check(prompt);
      scores[criteria.name] = score;
      totalScore += score * criteria.weight;
      totalWeight += criteria.weight;
    }

    const normalizedScore = (totalScore / totalWeight) * 10;

    const suggestions: string[] = [];

    // Generate suggestions based on low scores
    if (scores['length'] < 0.5) {
      suggestions.push('Overweeg de prompt uit te breiden met meer context of instructies');
    }
    if (scores['specificity'] < 0.5) {
      suggestions.push('Voeg meer specifieke details en concrete voorbeelden toe');
    }
    if (scores['clarity'] < 0.7) {
      suggestions.push('Vermijd vage termen zoals "misschien", "ongeveer", "enz."');
    }
    if (scores['structure'] < 0.5) {
      suggestions.push('Gebruik headers, lijsten of stappen voor betere structuur');
    }
    if (scores['completeness'] < 0.5) {
      suggestions.push('Voeg context, doel en output format toe');
    }

    return {
      score: Math.round(normalizedScore * 10) / 10,
      clarity: Math.round(scores['clarity'] * 10) / 10,
      specificity: Math.round(scores['specificity'] * 10) / 10,
      completeness: Math.round(scores['completeness'] * 10) / 10,
      suggestions,
    };
  }

  // ============================================
  // PROMPT OPTIMIZATION
  // ============================================

  optimizePrompt(prompt: string): OptimizedPrompt {
    const originalQuality = this.evaluatePrompt(prompt);
    let optimized = prompt;
    const improvements: string[] = [];

    // 1. Add structure if missing
    if (!prompt.includes('#')) {
      optimized = `# Opdracht\n\n${optimized}`;
      improvements.push('Markdown header toegevoegd');
    }

    // 2. Remove vague terms
    const vagueReplacements: Record<string, string> = {
      'misschien': 'overwegen om',
      'ongeveer': 'circa',
      'enz.': '(volledig specificeren)',
      'etc.': '(volledig specificeren)',
    };

    for (const [vague, replacement] of Object.entries(vagueReplacements)) {
      if (optimized.toLowerCase().includes(vague)) {
        optimized = optimized.replace(new RegExp(vague, 'gi'), replacement);
        improvements.push(`"${vague}" vervangen door "${replacement}"`);
      }
    }

    // 3. Add output format if missing
    if (!optimized.toLowerCase().includes('output') && !optimized.toLowerCase().includes('format')) {
      optimized += '\n\n## Output Format\nLever de output in een gestructureerd formaat (Markdown, JSON, of tekst).';
      improvements.push('Output format sectie toegevoegd');
    }

    // 4. Add context section if missing
    if (!optimized.toLowerCase().includes('context') && !optimized.toLowerCase().includes('achtergrond')) {
      const contextSection = '\n\n## Context\n[Voeg hier relevante achtergrond informatie toe]';
      optimized = contextSection + '\n' + optimized;
      improvements.push('Context sectie toegevoegd');
    }

    const optimizedQuality = this.evaluatePrompt(optimized);
    const qualityImprovement = optimizedQuality.score - originalQuality.score;

    return {
      original: prompt,
      optimized,
      improvements,
      qualityImprovement: Math.round(qualityImprovement * 10) / 10,
    };
  }

  // ============================================
  // LEARNING & FEEDBACK
  // ============================================

  recordResult(promptId: string, result: Omit<PromptResult, 'promptId' | 'timestamp'>): void {
    const fullResult: PromptResult = {
      ...result,
      promptId,
      timestamp: new Date(),
    };

    this.resultHistory.push(fullResult);

    // Keep last 1000 results
    if (this.resultHistory.length > 1000) {
      this.resultHistory = this.resultHistory.slice(-1000);
    }

    // Update template quality score based on results
    const template = this.templates.get(promptId);
    if (template) {
      const recentResults = this.resultHistory
        .filter(r => r.promptId === promptId)
        .slice(-10);
      
      if (recentResults.length > 0) {
        const avgQuality = recentResults.reduce((sum, r) => sum + r.quality, 0) / recentResults.length;
        template.qualityScore = (template.qualityScore + avgQuality) / 2;
        this.templates.set(promptId, template);
      }
    }

    this.logger.info('Prompt result recorded', {
      promptId,
      success: result.success,
      quality: result.quality,
    });
  }

  improveFromFeedback(promptId: string, feedback: string): PromptTemplate | null {
    const template = this.templates.get(promptId);
    if (!template) {
      return null;
    }

    // Analyze feedback
    const improvementSuggestions = this.analyzeFeedback(feedback);

    // Apply improvements
    let improvedPrompt = template.basePrompt;

    for (const suggestion of improvementSuggestions) {
      if (suggestion.type === 'add') {
        improvedPrompt += '\n\n' + suggestion.content;
      } else if (suggestion.type === 'clarify') {
        // Add clarification note
        improvedPrompt += `\n\n> **Belangrijke verduidelijking:** ${suggestion.content}`;
      }
    }

    return this.updateTemplate(promptId, {
      basePrompt: improvedPrompt,
    });
  }

  private analyzeFeedback(feedback: string): Array<{ type: 'add' | 'clarify' | 'remove'; content: string }> {
    const suggestions: Array<{ type: 'add' | 'clarify' | 'remove'; content: string }> = [];

    // Simple keyword-based analysis
    const feedbackLower = feedback.toLowerCase();

    if (feedbackLower.includes('onduidelijk') || feedbackLower.includes('verwarrend')) {
      suggestions.push({
        type: 'clarify',
        content: 'De instructies zijn verduidelijkt op basis van feedback.',
      });
    }

    if (feedbackLower.includes('voorbeeld') || feedbackLower.includes('example')) {
      suggestions.push({
        type: 'add',
        content: '## Voorbeeld\n[Voeg concrete voorbeelden toe]',
      });
    }

    if (feedbackLower.includes('kort') || feedbackLower.includes('beknopt')) {
      suggestions.push({
        type: 'clarify',
        content: 'Houd de output beknopt en to-the-point.',
      });
    }

    return suggestions;
  }

  // ============================================
  // ANALYTICS
  // ============================================

  getTemplateStats(): Array<{
    templateId: string;
    name: string;
    usageCount: number;
    avgQuality: number;
    successRate: number;
  }> {
    return this.getAllTemplates().map(template => {
      const results = this.resultHistory.filter(r => r.promptId === template.id);
      const successResults = results.filter(r => r.success);

      return {
        templateId: template.id,
        name: template.name,
        usageCount: template.usageCount,
        avgQuality: results.length > 0
          ? results.reduce((sum, r) => sum + r.quality, 0) / results.length
          : template.qualityScore,
        successRate: results.length > 0
          ? (successResults.length / results.length) * 100
          : 100,
      };
    }).sort((a, b) => b.usageCount - a.usageCount);
  }

  getTopTemplates(limit: number = 5): PromptTemplate[] {
    return this.getAllTemplates()
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, limit);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateTemplateId(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${slug}-${Date.now().toString(36)}`;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createPromptEngine(logger: AgentLogger): PromptEngine {
  return new PromptEngine(logger);
}
