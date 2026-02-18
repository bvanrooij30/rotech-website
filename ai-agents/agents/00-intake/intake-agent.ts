/**
 * RoTech AI Agents - Intake Agent
 * Agent voor klant intake, lead kwalificatie en requirement gathering
 */

import {
  BaseAgent,
  registerAgent,
  AgentType,
  ProjectSpecs,
  PromptContext,
  ReportType,
  ReportData,
  ClientInfo,
} from '../../core';

// ============================================
// INTAKE TYPES
// ============================================

interface LeadData {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  source: string;
  interest: string;
  budget?: string;
  timeline?: string;
  message?: string;
  createdAt: Date;
}

interface LeadScore {
  total: number; // 0-100
  budgetScore: number;
  timelineScore: number;
  fitScore: number;
  engagementScore: number;
  recommendation: 'hot' | 'warm' | 'cold' | 'disqualified';
  reasoning: string;
}

interface IntakeResult {
  leadId: string;
  score: LeadScore;
  recommendedPackage: string;
  estimatedBudget: { min: number; max: number };
  requirements: string[];
  nextSteps: string[];
  followUpTemplate: string;
}

interface RequirementExtraction {
  projectType: string;
  mustHave: string[];
  niceToHave: string[];
  constraints: string[];
  timeline: {
    urgency: 'asap' | 'within-month' | 'within-quarter' | 'flexible';
    preferredStart?: Date;
    deadline?: Date;
  };
  budget: {
    range: string;
    flexibility: 'strict' | 'moderate' | 'flexible';
  };
  existingAssets: string[];
  competitors: string[];
  successCriteria: string[];
}

// ============================================
// INTAKE AGENT CLASS
// ============================================

export class IntakeAgent extends BaseAgent {
  readonly agentId = 'intake-agent';
  readonly agentName = 'Intake Agent';
  readonly agentType: AgentType = 'intake';
  readonly version = '1.0.0';
  readonly description = 'Automatische lead kwalificatie, requirement gathering en intake afhandeling';

  private leads: Map<string, LeadData> = new Map();
  private intakeResults: Map<string, IntakeResult> = new Map();

  constructor() {
    super();
    this.initializeServices();
  }

  // ============================================
  // LEAD SCORING
  // ============================================

  async scoreLead(lead: LeadData): Promise<LeadScore> {
    this.logger.info('Scoring lead', { leadId: lead.id, company: lead.companyName });

    const budgetScore = this.calculateBudgetScore(lead.budget);
    const timelineScore = this.calculateTimelineScore(lead.timeline);
    const fitScore = this.calculateFitScore(lead);
    const engagementScore = this.calculateEngagementScore(lead);

    const total = Math.round(
      budgetScore * 0.3 +
      timelineScore * 0.2 +
      fitScore * 0.35 +
      engagementScore * 0.15
    );

    const recommendation = this.getRecommendation(total, lead);
    const reasoning = this.generateScoringReasoning(lead, {
      budgetScore,
      timelineScore,
      fitScore,
      engagementScore,
      total,
    });

    const score: LeadScore = {
      total,
      budgetScore,
      timelineScore,
      fitScore,
      engagementScore,
      recommendation,
      reasoning,
    };

    this.logger.info('Lead scored', {
      leadId: lead.id,
      score: total,
      recommendation,
    });

    return score;
  }

  private calculateBudgetScore(budget?: string): number {
    if (!budget) return 30; // Unknown budget

    const budgetLower = budget.toLowerCase();
    
    if (budgetLower.includes('10000') || budgetLower.includes('10.000') || budgetLower.includes('10k')) {
      return 100;
    }
    if (budgetLower.includes('5000') || budgetLower.includes('5.000') || budgetLower.includes('5k')) {
      return 85;
    }
    if (budgetLower.includes('3000') || budgetLower.includes('3.000') || budgetLower.includes('3k')) {
      return 70;
    }
    if (budgetLower.includes('2000') || budgetLower.includes('2.000') || budgetLower.includes('2k')) {
      return 55;
    }
    if (budgetLower.includes('1000') || budgetLower.includes('1.000') || budgetLower.includes('1k')) {
      return 40;
    }
    if (budgetLower.includes('500') || budgetLower.includes('weinig') || budgetLower.includes('beperkt')) {
      return 20;
    }

    return 50; // Default for unclear budgets
  }

  private calculateTimelineScore(timeline?: string): number {
    if (!timeline) return 50;

    const timelineLower = timeline.toLowerCase();

    if (timelineLower.includes('asap') || timelineLower.includes('direct') || timelineLower.includes('zo snel')) {
      return 100;
    }
    if (timelineLower.includes('maand') || timelineLower.includes('4 weken')) {
      return 85;
    }
    if (timelineLower.includes('kwartaal') || timelineLower.includes('3 maanden')) {
      return 70;
    }
    if (timelineLower.includes('halfjaar') || timelineLower.includes('6 maanden')) {
      return 50;
    }
    if (timelineLower.includes('jaar') || timelineLower.includes('volgend jaar')) {
      return 30;
    }
    if (timelineLower.includes('geen haast') || timelineLower.includes('rustig')) {
      return 40;
    }

    return 60;
  }

  private calculateFitScore(lead: LeadData): number {
    let score = 50;

    // Check interest alignment
    const interestLower = lead.interest.toLowerCase();
    const highValueServices = ['webshop', 'maatwerk', 'applicatie', 'automatisering', 'e-commerce'];
    const mediumValueServices = ['website', 'business', 'seo', 'pwa'];
    const lowerValueServices = ['onderhoud', 'starter', 'one-page'];

    for (const service of highValueServices) {
      if (interestLower.includes(service)) {
        score += 25;
        break;
      }
    }

    for (const service of mediumValueServices) {
      if (interestLower.includes(service)) {
        score += 15;
        break;
      }
    }

    for (const service of lowerValueServices) {
      if (interestLower.includes(service)) {
        score += 5;
        break;
      }
    }

    // Check if they have a website (more established)
    if (lead.website) {
      score += 10;
    }

    // Check message quality
    if (lead.message && lead.message.length > 100) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private calculateEngagementScore(lead: LeadData): number {
    let score = 50;

    // Phone provided (more serious)
    if (lead.phone) {
      score += 20;
    }

    // Detailed message
    if (lead.message) {
      if (lead.message.length > 200) score += 20;
      else if (lead.message.length > 50) score += 10;
    }

    // Known source quality
    const highQualitySources = ['referral', 'linkedin', 'google'];
    if (highQualitySources.some(s => lead.source.toLowerCase().includes(s))) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private getRecommendation(
    score: number,
    lead: LeadData
  ): LeadScore['recommendation'] {
    // Check for disqualifying factors
    const messageLower = (lead.message || '').toLowerCase();
    if (
      messageLower.includes('gratis') ||
      messageLower.includes('student') ||
      messageLower.includes('geen budget')
    ) {
      return 'disqualified';
    }

    if (score >= 75) return 'hot';
    if (score >= 50) return 'warm';
    if (score >= 25) return 'cold';
    return 'disqualified';
  }

  private generateScoringReasoning(
    lead: LeadData,
    scores: {
      budgetScore: number;
      timelineScore: number;
      fitScore: number;
      engagementScore: number;
      total: number;
    }
  ): string {
    const reasons: string[] = [];

    if (scores.budgetScore >= 70) {
      reasons.push('Budget indicatie past bij onze diensten');
    } else if (scores.budgetScore < 40) {
      reasons.push('Budget mogelijk te beperkt');
    }

    if (scores.timelineScore >= 70) {
      reasons.push('Urgente timeline - snelle opvolging gewenst');
    }

    if (scores.fitScore >= 70) {
      reasons.push('Goede match met onze expertise');
    }

    if (scores.engagementScore >= 70) {
      reasons.push('Hoge engagement - serieuze interesse');
    }

    if (lead.website) {
      reasons.push('Bestaand bedrijf met online aanwezigheid');
    }

    return reasons.join('. ') || 'Standaard score op basis van beschikbare informatie.';
  }

  // ============================================
  // REQUIREMENT EXTRACTION
  // ============================================

  async extractRequirements(
    lead: LeadData,
    conversationNotes?: string
  ): Promise<RequirementExtraction> {
    this.logger.info('Extracting requirements', { leadId: lead.id });

    const allText = `${lead.interest} ${lead.message || ''} ${conversationNotes || ''}`;
    const textLower = allText.toLowerCase();

    // Determine project type
    const projectType = this.determineProjectType(textLower);

    // Extract must-haves
    const mustHave = this.extractMustHaves(textLower, projectType);

    // Extract nice-to-haves
    const niceToHave = this.extractNiceToHaves(textLower, projectType);

    // Extract constraints
    const constraints = this.extractConstraints(textLower);

    // Determine timeline
    const timeline = this.extractTimeline(textLower, lead.timeline);

    // Determine budget
    const budget = this.extractBudget(textLower, lead.budget);

    // Extract existing assets
    const existingAssets = this.extractExistingAssets(textLower, lead);

    // Extract competitors
    const competitors = this.extractCompetitors(textLower);

    // Define success criteria
    const successCriteria = this.defineSuccessCriteria(projectType, textLower);

    const requirements: RequirementExtraction = {
      projectType,
      mustHave,
      niceToHave,
      constraints,
      timeline,
      budget,
      existingAssets,
      competitors,
      successCriteria,
    };

    this.logger.info('Requirements extracted', {
      leadId: lead.id,
      projectType,
      mustHaveCount: mustHave.length,
      niceToHaveCount: niceToHave.length,
    });

    return requirements;
  }

  private determineProjectType(text: string): string {
    if (text.includes('webshop') || text.includes('e-commerce') || text.includes('verkopen')) {
      return 'webshop';
    }
    if (text.includes('maatwerk') || text.includes('applicatie') || text.includes('portal') || text.includes('dashboard')) {
      return 'maatwerk-webapp';
    }
    if (text.includes('automatiser') || text.includes('n8n') || text.includes('workflow')) {
      return 'automatisering';
    }
    if (text.includes('seo') || text.includes('google') || text.includes('vindbaar')) {
      return 'seo';
    }
    if (text.includes('pwa') || text.includes('app') || text.includes('installeerbaar')) {
      return 'pwa';
    }
    if (text.includes('api') || text.includes('koppeling') || text.includes('integratie')) {
      return 'api-integratie';
    }
    if (text.includes('chatbot') || text.includes('chat') || text.includes('klantenservice')) {
      return 'chatbot';
    }
    if (text.includes('onderhoud') || text.includes('beheer')) {
      return 'onderhoud';
    }
    if (text.includes('business') || text.includes('bedrijf') || text.includes('professioneel')) {
      return 'business-website';
    }
    
    return 'starter-website';
  }

  private extractMustHaves(text: string, projectType: string): string[] {
    const mustHave: string[] = [];

    // Universal must-haves
    mustHave.push('Responsive design (mobile-first)');
    mustHave.push('SSL certificaat (HTTPS)');

    // Type-specific must-haves
    if (projectType === 'webshop') {
      mustHave.push('iDEAL betaling');
      mustHave.push('Productbeheer');
      mustHave.push('Orderbeheer');
      if (text.includes('voorraad')) mustHave.push('Voorraadbeheer');
    }

    if (projectType === 'business-website') {
      mustHave.push('Contactformulier');
      if (text.includes('cms') || text.includes('zelf aanpassen')) {
        mustHave.push('CMS - zelf content beheren');
      }
      if (text.includes('blog') || text.includes('nieuws')) {
        mustHave.push('Blog/nieuws module');
      }
    }

    if (projectType === 'seo') {
      mustHave.push('SEO audit rapport');
      mustHave.push('Keyword onderzoek');
      mustHave.push('On-page optimalisatie');
    }

    // Text-based must-haves
    if (text.includes('snel') || text.includes('laadtijd')) {
      mustHave.push('Snelle laadtijd (< 2 seconden)');
    }

    if (text.includes('meertalig') || text.includes('engels')) {
      mustHave.push('Meertaligheid');
    }

    return [...new Set(mustHave)];
  }

  private extractNiceToHaves(text: string, projectType: string): string[] {
    const niceToHave: string[] = [];

    if (text.includes('animatie')) niceToHave.push('Geavanceerde animaties');
    if (text.includes('analytics') || text.includes('statistiek')) {
      niceToHave.push('Google Analytics integratie');
    }
    if (text.includes('nieuwsbrief') || text.includes('mailchimp')) {
      niceToHave.push('Nieuwsbrief integratie');
    }
    if (text.includes('social')) niceToHave.push('Social media integratie');
    if (text.includes('video')) niceToHave.push('Video integratie');
    if (text.includes('kalender') || text.includes('afspraak')) {
      niceToHave.push('Boekingssysteem');
    }

    return niceToHave;
  }

  private extractConstraints(text: string): string[] {
    const constraints: string[] = [];

    if (text.includes('huisstijl')) {
      constraints.push('Moet aansluiten bij bestaande huisstijl');
    }
    if (text.includes('wordpress')) {
      constraints.push('Klant overweegt WordPress (moet besproken worden)');
    }
    if (text.includes('bestaande') && text.includes('website')) {
      constraints.push('Migratie van bestaande website nodig');
    }
    if (text.includes('deadline')) {
      constraints.push('Strikte deadline');
    }

    return constraints;
  }

  private extractTimeline(text: string, timeline?: string): RequirementExtraction['timeline'] {
    let urgency: RequirementExtraction['timeline']['urgency'] = 'flexible';

    const combined = `${text} ${timeline || ''}`.toLowerCase();

    if (combined.includes('asap') || combined.includes('direct') || combined.includes('spoed')) {
      urgency = 'asap';
    } else if (combined.includes('maand') || combined.includes('4 weken') || combined.includes('snel')) {
      urgency = 'within-month';
    } else if (combined.includes('kwartaal') || combined.includes('3 maanden')) {
      urgency = 'within-quarter';
    }

    return { urgency };
  }

  private extractBudget(text: string, budget?: string): RequirementExtraction['budget'] {
    let range = 'Niet gespecificeerd';
    let flexibility: RequirementExtraction['budget']['flexibility'] = 'moderate';

    if (budget) {
      range = budget;
    }

    const combined = `${text} ${budget || ''}`.toLowerCase();

    if (combined.includes('maximaal') || combined.includes('max') || combined.includes('niet meer dan')) {
      flexibility = 'strict';
    } else if (combined.includes('flexibel') || combined.includes('bespreekbaar')) {
      flexibility = 'flexible';
    }

    return { range, flexibility };
  }

  private extractExistingAssets(text: string, lead: LeadData): string[] {
    const assets: string[] = [];

    if (lead.website) {
      assets.push(`Bestaande website: ${lead.website}`);
    }
    if (text.includes('logo')) assets.push('Logo beschikbaar');
    if (text.includes('huisstijl')) assets.push('Huisstijl beschikbaar');
    if (text.includes('foto')) assets.push('Fotomateriaal beschikbaar');
    if (text.includes('tekst') || text.includes('content')) {
      assets.push('Content/teksten beschikbaar');
    }

    return assets;
  }

  private extractCompetitors(text: string): string[] {
    // This would be more sophisticated in production
    return [];
  }

  private defineSuccessCriteria(projectType: string, text: string): string[] {
    const criteria: string[] = [];

    // Universal criteria
    criteria.push('Website is live en functioneel');
    criteria.push('Klant is tevreden met design');
    criteria.push('Alle gevraagde functionaliteit werkt');

    // Type-specific
    if (projectType === 'webshop') {
      criteria.push('Eerste bestelling succesvol afgerond');
      criteria.push('Betalingen worden correct verwerkt');
    }

    if (projectType === 'seo') {
      criteria.push('Verbetering in Google rankings binnen 3 maanden');
      criteria.push('Toename in organisch verkeer');
    }

    if (text.includes('conversie')) {
      criteria.push('Verbetering in conversieratio');
    }

    return criteria;
  }

  // ============================================
  // PACKAGE MATCHING
  // ============================================

  async matchPackage(
    requirements: RequirementExtraction,
    score: LeadScore
  ): Promise<{
    recommended: string;
    alternatives: string[];
    estimatedBudget: { min: number; max: number };
    reasoning: string;
  }> {
    let recommended: string;
    let alternatives: string[] = [];
    let estimatedBudget: { min: number; max: number };
    let reasoning: string;

    switch (requirements.projectType) {
      case 'webshop':
        recommended = 'Webshop';
        alternatives = ['Webshop + Maatwerk'];
        estimatedBudget = { min: 4995, max: 6000 };
        reasoning = 'E-commerce project met iDEAL en productbeheer.';
        break;

      case 'maatwerk-webapp':
        recommended = 'Maatwerk';
        alternatives = ['Business + Maatwerk modules'];
        estimatedBudget = { min: 9995, max: 25000 };
        reasoning = 'Complexe applicatie vereist maatwerk ontwikkeling.';
        break;

      case 'automatisering':
        recommended = 'Digital Process Automation';
        alternatives = [];
        estimatedBudget = { min: 500, max: 3000 };
        reasoning = 'Workflow automatisering met n8n of Make.';
        break;

      case 'seo':
        recommended = 'SEO Optimalisatie';
        alternatives = ['SEO + Onderhoud pakket'];
        estimatedBudget = { min: 750, max: 2500 };
        reasoning = 'SEO focus voor betere vindbaarheid.';
        break;

      case 'business-website':
        recommended = 'Business Website';
        alternatives = ['Starter (budget)', 'Business + E-commerce add-on'];
        estimatedBudget = { min: 2995, max: 4500 };
        reasoning = 'Professionele bedrijfswebsite met CMS.';
        break;

      case 'pwa':
        recommended = 'PWA Add-on';
        alternatives = ['PWA Standalone'];
        estimatedBudget = { min: 1500, max: 4500 };
        reasoning = 'Progressive Web App voor app-like ervaring.';
        break;

      case 'api-integratie':
        recommended = 'API Integratie';
        alternatives = [];
        estimatedBudget = { min: 750, max: 3000 };
        reasoning = 'Systeem koppeling op maat.';
        break;

      case 'chatbot':
        recommended = 'AI Chatbot';
        alternatives = [];
        estimatedBudget = { min: 1500, max: 4000 };
        reasoning = 'AI-gedreven klantenservice chatbot.';
        break;

      case 'onderhoud':
        recommended = 'Website Onderhoud Business';
        alternatives = ['Onderhoud Basis', 'Onderhoud Premium'];
        estimatedBudget = { min: 129, max: 495 }; // monthly
        reasoning = 'Maandelijks onderhoud en beheer. Prijzen per maand.';
        break;

      default:
        recommended = 'Starter Website';
        alternatives = ['Business Website'];
        estimatedBudget = { min: 1295, max: 2000 };
        reasoning = 'One-page website voor basis online aanwezigheid.';
    }

    // Adjust based on requirements
    if (requirements.mustHave.length > 5) {
      estimatedBudget.max *= 1.2;
      reasoning += ' Extra features verhogen de investering.';
    }

    if (requirements.timeline.urgency === 'asap') {
      estimatedBudget.min *= 1.15;
      estimatedBudget.max *= 1.25;
      reasoning += ' Spoedtarief van toepassing bij urgente timeline.';
    }

    return {
      recommended,
      alternatives,
      estimatedBudget: {
        min: Math.round(estimatedBudget.min),
        max: Math.round(estimatedBudget.max),
      },
      reasoning,
    };
  }

  // ============================================
  // FULL INTAKE PROCESS
  // ============================================

  async processIntake(lead: LeadData, conversationNotes?: string): Promise<IntakeResult> {
    this.logger.info('Processing full intake', { leadId: lead.id });

    // Store lead
    this.leads.set(lead.id, lead);

    // Score lead
    const score = await this.scoreLead(lead);

    // Extract requirements
    const requirements = await this.extractRequirements(lead, conversationNotes);

    // Match package
    const packageMatch = await this.matchPackage(requirements, score);

    // Generate follow-up template
    const followUpTemplate = await this.generateFollowUpEmail(lead, score, packageMatch);

    // Define next steps
    const nextSteps = this.determineNextSteps(score, requirements);

    const result: IntakeResult = {
      leadId: lead.id,
      score,
      recommendedPackage: packageMatch.recommended,
      estimatedBudget: packageMatch.estimatedBudget,
      requirements: requirements.mustHave,
      nextSteps,
      followUpTemplate,
    };

    this.intakeResults.set(lead.id, result);

    this.logger.info('Intake completed', {
      leadId: lead.id,
      recommendation: score.recommendation,
      package: packageMatch.recommended,
    });

    return result;
  }

  private determineNextSteps(score: LeadScore, requirements: RequirementExtraction): string[] {
    const steps: string[] = [];

    switch (score.recommendation) {
      case 'hot':
        steps.push('Direct telefonisch contact opnemen');
        steps.push('Kennismakingsgesprek inplannen (binnen 2 dagen)');
        steps.push('Offerte voorbereiden');
        break;

      case 'warm':
        steps.push('Persoonlijke follow-up email sturen');
        steps.push('Aanvullende vragen stellen over requirements');
        steps.push('Kennismakingsgesprek voorstellen');
        break;

      case 'cold':
        steps.push('Automatische follow-up email sturen');
        steps.push('Toevoegen aan nurture campagne');
        steps.push('Na 2 weken opnieuw contact opnemen');
        break;

      case 'disqualified':
        steps.push('Vriendelijke afwijzing sturen');
        steps.push('Alternatieve oplossingen suggereren');
        break;
    }

    if (requirements.timeline.urgency === 'asap') {
      steps.unshift('URGENT: Vandaag nog contact opnemen');
    }

    return steps;
  }

  private async generateFollowUpEmail(
    lead: LeadData,
    score: LeadScore,
    packageMatch: Awaited<ReturnType<typeof this.matchPackage>>
  ): Promise<string> {
    const context: PromptContext = {
      additionalContext: {
        emailType: 'follow-up-intake',
        clientName: lead.contactName.split(' ')[0],
        companyName: lead.companyName,
        projectName: lead.interest,
        context: `Lead score: ${score.recommendation}. Aanbevolen pakket: ${packageMatch.recommended}. Budget indicatie: €${packageMatch.estimatedBudget.min} - €${packageMatch.estimatedBudget.max}`,
        additionalInfo: `Lead interesse: ${lead.interest}. Timing: ${lead.timeline || 'Niet gespecificeerd'}`,
      },
    };

    try {
      return await this.generatePrompt(context);
    } catch {
      // Fallback template
      return this.getDefaultFollowUpTemplate(lead, score, packageMatch);
    }
  }

  private getDefaultFollowUpTemplate(
    lead: LeadData,
    score: LeadScore,
    packageMatch: Awaited<ReturnType<typeof this.matchPackage>>
  ): string {
    const firstName = lead.contactName.split(' ')[0];

    return `Hoi ${firstName},

Bedankt voor je interesse in ${lead.interest}! Leuk om te horen dat je ${lead.companyName} verder wilt helpen groeien online.

Op basis van wat je hebt aangegeven, lijkt ons ${packageMatch.recommended} pakket goed bij je te passen. De investering hiervoor ligt tussen €${packageMatch.estimatedBudget.min} en €${packageMatch.estimatedBudget.max}, afhankelijk van de exacte wensen.

Zullen we even bellen om je wensen door te nemen? Dan kan ik je een veel preciezere inschatting geven en al je vragen beantwoorden.

Je kunt me bereiken op 06 57 23 55 74, of stuur gerust een bericht terug met tijden die jou uitkomen.

Groet,
Bart van Rooij
Ro-Tech Development

P.S. Bekijk gerust alvast wat voorbeelden op ro-techdevelopment.dev`;
  }

  // ============================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================

  async getSpecializedPrompts(): Promise<string[]> {
    return [
      'client-email-template',
      'intake-questions',
      'package-recommendation',
      'follow-up-sequence',
    ];
  }

  async executeWorkflow(
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    switch (workflowId) {
      case 'full-intake':
        return this.processIntake(data.lead as LeadData, data.notes as string);
      
      case 'score-lead':
        return this.scoreLead(data.lead as LeadData);
      
      case 'extract-requirements':
        return this.extractRequirements(data.lead as LeadData, data.notes as string);
      
      case 'match-package':
        return this.matchPackage(
          data.requirements as RequirementExtraction,
          data.score as LeadScore
        );
      
      default:
        throw new Error(`Unknown workflow: ${workflowId}`);
    }
  }

  getCapabilities(): string[] {
    return [
      'Lead scoring en kwalificatie',
      'Automatische requirement extraction',
      'Pakket matching en aanbevelingen',
      'Prijsindicatie generatie',
      'Follow-up email generatie',
      'Intake rapport creatie',
      'CRM synchronisatie (planned)',
    ];
  }

  // ============================================
  // REPORT GENERATION
  // ============================================

  protected getReportType(): ReportType {
    return 'project-proposal';
  }

  async generateIntakeReport(leadId: string): Promise<ReturnType<typeof this.createReport>> {
    const lead = this.leads.get(leadId);
    const result = this.intakeResults.get(leadId);

    if (!lead || !result) {
      throw new Error(`Intake not found for lead: ${leadId}`);
    }

    const data: ReportData = {
      title: `Intake Rapport: ${lead.companyName}`,
      subtitle: lead.interest,
      date: new Date(),
      author: this.agentName,
      sections: [
        {
          title: 'Lead Informatie',
          content: {
            headers: ['Veld', 'Waarde'],
            rows: [
              ['Bedrijf', lead.companyName],
              ['Contact', lead.contactName],
              ['Email', lead.email],
              ['Telefoon', lead.phone || '-'],
              ['Website', lead.website || '-'],
              ['Bron', lead.source],
            ],
          },
          type: 'table',
        },
        {
          title: 'Lead Score',
          content: `Totaal: ${result.score.total}/100\nAanbeveling: ${result.score.recommendation}\n\n${result.score.reasoning}`,
          type: 'text',
        },
        {
          title: 'Aanbevolen Pakket',
          content: `${result.recommendedPackage}\n\nBudget indicatie: €${result.estimatedBudget.min} - €${result.estimatedBudget.max}`,
          type: 'text',
        },
        {
          title: 'Requirements',
          content: result.requirements,
          type: 'list',
        },
        {
          title: 'Volgende Stappen',
          content: result.nextSteps,
          type: 'list',
        },
      ],
    };

    return this.createReport(data);
  }
}

// ============================================
// FACTORY & REGISTRATION
// ============================================

export function createIntakeAgent(): IntakeAgent {
  const agent = new IntakeAgent();
  registerAgent(agent);
  return agent;
}

// Auto-register on import
const intakeAgent = createIntakeAgent();
export { intakeAgent };
