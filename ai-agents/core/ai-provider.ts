/**
 * RoTech AI Agents - AI Provider
 * Centrale AI connectie voor alle agents
 * 
 * Dit is de ECHTE AI connectie die agents intelligent maakt
 */

import { generateText, generateObject, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { createLogger, AgentLogger } from './logger';
import { AgentType } from './types';

// ============================================
// AI PROVIDER CONFIGURATION
// ============================================

interface AIProviderConfig {
  defaultModel: string;
  fastModel: string;
  maxTokens: number;
  temperature: number;
}

const DEFAULT_CONFIG: AIProviderConfig = {
  defaultModel: 'gpt-4o-mini',
  fastModel: 'gpt-4o-mini',
  maxTokens: 4096,
  temperature: 0.7,
};

// ============================================
// AI PROVIDER CLASS
// ============================================

export class AIProvider {
  private config: AIProviderConfig;
  private logger: AgentLogger;
  private callCount: number = 0;
  private totalTokens: number = 0;

  constructor(agentId: string, agentType: AgentType, config?: Partial<AIProviderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = createLogger(agentId, agentType, { prefix: 'AIProvider' });
  }

  // ============================================
  // TEXT GENERATION
  // ============================================

  /**
   * Generate text response from AI
   * Dit is de kern functie die agents intelligent maakt
   */
  async generateText(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  }): Promise<string> {
    const startTime = Date.now();
    this.callCount++;

    try {
      this.logger.debug('Generating AI text', { promptLength: prompt.length });

      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const { text, usage } = await generateText({
        model: openai(options?.model || this.config.defaultModel),
        messages,
        maxTokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
      });

      const duration = Date.now() - startTime;
      this.totalTokens += usage?.totalTokens || 0;

      this.logger.performance('ai-generate-text', duration, {
        tokens: usage?.totalTokens,
        model: options?.model || this.config.defaultModel,
      });

      return text;
    } catch (error) {
      this.logger.error('AI generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate structured JSON response
   * Gebruik dit voor gestructureerde output
   */
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    options?: {
      model?: string;
      systemPrompt?: string;
    }
  ): Promise<T> {
    const startTime = Date.now();
    this.callCount++;

    try {
      this.logger.debug('Generating structured AI response');

      const { object, usage } = await generateObject({
        model: openai(options?.model || this.config.defaultModel),
        schema,
        prompt,
        system: options?.systemPrompt,
      });

      const duration = Date.now() - startTime;
      this.totalTokens += usage?.totalTokens || 0;

      this.logger.performance('ai-generate-structured', duration);

      return object;
    } catch (error) {
      this.logger.error('Structured AI generation failed', error as Error);
      throw error;
    }
  }

  /**
   * Stream text for real-time responses
   */
  async *streamText(prompt: string, options?: {
    model?: string;
    systemPrompt?: string;
  }): AsyncIterable<string> {
    this.callCount++;

    try {
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const { textStream } = await streamText({
        model: openai(options?.model || this.config.defaultModel),
        messages,
      });

      for await (const chunk of textStream) {
        yield chunk;
      }
    } catch (error) {
      this.logger.error('AI stream failed', error as Error);
      throw error;
    }
  }

  // ============================================
  // SPECIALIZED GENERATION METHODS
  // ============================================

  /**
   * Generate a professional email
   */
  async generateEmail(params: {
    type: 'follow-up' | 'proposal' | 'welcome' | 'reminder' | 'thank-you';
    recipientName: string;
    companyName?: string;
    context: string;
    tone?: 'formal' | 'friendly' | 'professional';
  }): Promise<{ subject: string; body: string }> {
    const systemPrompt = `Je bent een expert email schrijver voor Ro-Tech Development, een web development bureau.
Je schrijft professionele maar persoonlijke emails in het Nederlands.
Tone: ${params.tone || 'professional'}
Schrijfstijl: Direct, helder, geen wollige taal. Brabantse no-nonsense.
Onderteken altijd met:
Bart van Rooij
Ro-Tech Development`;

    const prompt = `Schrijf een ${params.type} email.

Ontvanger: ${params.recipientName}${params.companyName ? ` van ${params.companyName}` : ''}

Context:
${params.context}

Geef je antwoord in dit formaat:
ONDERWERP: [onderwerp]
---
[email body]`;

    const response = await this.generateText(prompt, { systemPrompt });
    
    const [subjectLine, ...bodyLines] = response.split('---');
    const subject = subjectLine.replace('ONDERWERP:', '').trim();
    const body = bodyLines.join('---').trim();

    return { subject, body };
  }

  /**
   * Analyze a lead and provide scoring
   */
  async analyzeLead(leadData: {
    companyName: string;
    interest: string;
    budget?: string;
    timeline?: string;
    message?: string;
    source: string;
  }): Promise<{
    score: number;
    recommendation: 'hot' | 'warm' | 'cold' | 'disqualified';
    reasoning: string;
    suggestedPackage: string;
    estimatedValue: { min: number; max: number };
    nextSteps: string[];
  }> {
    const schema = z.object({
      score: z.number().min(0).max(100),
      recommendation: z.enum(['hot', 'warm', 'cold', 'disqualified']),
      reasoning: z.string(),
      suggestedPackage: z.string(),
      estimatedValue: z.object({
        min: z.number(),
        max: z.number(),
      }),
      nextSteps: z.array(z.string()),
    });

    const prompt = `Analyseer deze lead voor Ro-Tech Development (web development bureau).

Lead gegevens:
- Bedrijf: ${leadData.companyName}
- Interesse: ${leadData.interest}
- Budget: ${leadData.budget || 'Niet gespecificeerd'}
- Timeline: ${leadData.timeline || 'Niet gespecificeerd'}
- Bron: ${leadData.source}
- Bericht: ${leadData.message || 'Geen bericht'}

Ro-Tech pakketten en prijzen:
- Starter Website: €1.295+ (one-page voor ZZP/freelancers)
- Business Website: €2.995+ (multi-page met CMS)
- Webshop: €4.995+ (e-commerce met iDEAL)
- Maatwerk: €9.995+ (custom applicaties)
- SEO: €750+ eenmalig, €249+/maand onderhoud
- Onderhoud: €129-495/maand

Geef een score (0-100), aanbeveling, en volgende stappen.`;

    return this.generateStructured(prompt, schema, {
      systemPrompt: 'Je bent een expert sales analyst. Analyseer leads objectief en geef concrete aanbevelingen.',
    });
  }

  /**
   * Generate project proposal content
   */
  async generateProposal(params: {
    clientName: string;
    companyName: string;
    projectType: string;
    requirements: string[];
    budget: { min: number; max: number };
  }): Promise<{
    introduction: string;
    approach: string[];
    deliverables: string[];
    timeline: string;
    investment: string;
  }> {
    const schema = z.object({
      introduction: z.string(),
      approach: z.array(z.string()),
      deliverables: z.array(z.string()),
      timeline: z.string(),
      investment: z.string(),
    });

    const prompt = `Genereer een professionele offerte voor:

Klant: ${params.clientName} van ${params.companyName}
Project type: ${params.projectType}
Requirements:
${params.requirements.map(r => `- ${r}`).join('\n')}

Budget range: €${params.budget.min} - €${params.budget.max}

Maak een overtuigende offerte met persoonlijke aanpak.`;

    return this.generateStructured(prompt, schema, {
      systemPrompt: `Je bent Bart van Rooij, eigenaar van Ro-Tech Development. 
Je schrijft offertes die persoonlijk, professioneel en overtuigend zijn.
Focus op de waarde voor de klant, niet alleen op technische details.`,
    });
  }

  /**
   * Generate SEO recommendations
   */
  async generateSEORecommendations(params: {
    websiteUrl: string;
    currentIssues: string[];
    targetKeywords: string[];
  }): Promise<{
    priority: Array<{ issue: string; fix: string; impact: 'high' | 'medium' | 'low' }>;
    keywordStrategy: string;
    technicalFixes: string[];
    contentSuggestions: string[];
  }> {
    const schema = z.object({
      priority: z.array(z.object({
        issue: z.string(),
        fix: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
      })),
      keywordStrategy: z.string(),
      technicalFixes: z.array(z.string()),
      contentSuggestions: z.array(z.string()),
    });

    const prompt = `Analyseer deze website voor SEO verbeteringen:

Website: ${params.websiteUrl}

Huidige issues:
${params.currentIssues.map(i => `- ${i}`).join('\n')}

Target keywords:
${params.targetKeywords.map(k => `- ${k}`).join('\n')}

Geef concrete, actionable aanbevelingen.`;

    return this.generateStructured(prompt, schema, {
      systemPrompt: 'Je bent een SEO expert. Geef praktische, implementeerbare aanbevelingen.',
    });
  }

  /**
   * Generate marketing content
   */
  async generateMarketingContent(params: {
    type: 'blog' | 'social' | 'email' | 'ad';
    topic: string;
    targetAudience: string;
    platform?: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
    length?: 'short' | 'medium' | 'long';
  }): Promise<{
    title: string;
    content: string;
    hashtags?: string[];
    callToAction: string;
  }> {
    const schema = z.object({
      title: z.string(),
      content: z.string(),
      hashtags: z.array(z.string()).optional(),
      callToAction: z.string(),
    });

    const prompt = `Genereer ${params.type} content over "${params.topic}".

Doelgroep: ${params.targetAudience}
Platform: ${params.platform || 'algemeen'}
Lengte: ${params.length || 'medium'}

Schrijf overtuigende content die past bij Ro-Tech Development's merkidentiteit:
- Professioneel maar toegankelijk
- Brabantse no-nonsense
- Focus op waarde voor MKB/ZZP`;

    return this.generateStructured(prompt, schema, {
      systemPrompt: 'Je bent een content marketing expert voor een web development bureau.',
    });
  }

  // ============================================
  // METRICS
  // ============================================

  getMetrics(): { callCount: number; totalTokens: number } {
    return {
      callCount: this.callCount,
      totalTokens: this.totalTokens,
    };
  }

  resetMetrics(): void {
    this.callCount = 0;
    this.totalTokens = 0;
  }
}

// ============================================
// FACTORY
// ============================================

export function createAIProvider(
  agentId: string,
  agentType: AgentType,
  config?: Partial<AIProviderConfig>
): AIProvider {
  return new AIProvider(agentId, agentType, config);
}

// Global AI provider for quick access
let globalProvider: AIProvider | null = null;

export function getGlobalAIProvider(): AIProvider {
  if (!globalProvider) {
    globalProvider = new AIProvider('global', 'intake');
  }
  return globalProvider;
}
