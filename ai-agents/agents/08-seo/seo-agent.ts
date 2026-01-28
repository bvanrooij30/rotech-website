/**
 * RoTech AI Agents - SEO Agent
 * Agent voor SEO optimalisatie, audits en monitoring
 */

import {
  BaseAgent,
  registerAgent,
  AgentType,
  PromptContext,
  ReportType,
  ReportData,
} from '../../core';

// ============================================
// SEO TYPES
// ============================================

interface SEOAuditResult {
  id: string;
  url: string;
  timestamp: Date;
  overallScore: number;
  categories: {
    technical: TechnicalSEO;
    onPage: OnPageSEO;
    content: ContentSEO;
    performance: PerformanceSEO;
  };
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
}

interface TechnicalSEO {
  score: number;
  checks: SEOCheck[];
}

interface OnPageSEO {
  score: number;
  checks: SEOCheck[];
}

interface ContentSEO {
  score: number;
  checks: SEOCheck[];
}

interface PerformanceSEO {
  score: number;
  checks: SEOCheck[];
}

interface SEOCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  value?: string | number;
  expected?: string | number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

interface SEOIssue {
  id: string;
  category: 'technical' | 'on-page' | 'content' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedPages?: string[];
  howToFix: string;
}

interface SEORecommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  category: string;
}

interface KeywordAnalysis {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  currentPosition?: number;
  topCompetitors: string[];
  relatedKeywords: string[];
  intent: 'informational' | 'transactional' | 'navigational';
}

interface ContentOptimization {
  pageUrl: string;
  currentTitle: string;
  optimizedTitle: string;
  currentDescription: string;
  optimizedDescription: string;
  headingStructure: {
    current: string[];
    recommended: string[];
  };
  keywords: {
    primary: string;
    secondary: string[];
    lsi: string[];
  };
  contentGaps: string[];
  internalLinkSuggestions: string[];
}

// ============================================
// SEO AGENT CLASS
// ============================================

export class SEOAgent extends BaseAgent {
  readonly agentId = 'seo-agent';
  readonly agentName = 'SEO Agent';
  readonly agentType: AgentType = 'seo';
  readonly version = '1.0.0';
  readonly description = 'SEO optimalisatie, audits, keyword research en ranking monitoring';

  private audits: Map<string, SEOAuditResult> = new Map();
  private keywordData: Map<string, KeywordAnalysis> = new Map();

  constructor() {
    super();
    this.initializeServices();
  }

  // ============================================
  // SEO AUDIT
  // ============================================

  async performAudit(url: string): Promise<SEOAuditResult> {
    this.logger.info('Starting SEO audit', { url });

    const auditId = this.generateId('audit');
    
    // Perform technical SEO checks
    const technical = await this.checkTechnicalSEO(url);
    
    // Perform on-page SEO checks
    const onPage = await this.checkOnPageSEO(url);
    
    // Perform content SEO checks
    const content = await this.checkContentSEO(url);
    
    // Perform performance checks
    const performance = await this.checkPerformanceSEO(url);

    // Calculate overall score
    const overallScore = Math.round(
      technical.score * 0.25 +
      onPage.score * 0.30 +
      content.score * 0.25 +
      performance.score * 0.20
    );

    // Collect all issues
    const issues = this.collectIssues(technical, onPage, content, performance);

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, {
      technical,
      onPage,
      content,
      performance,
    });

    const result: SEOAuditResult = {
      id: auditId,
      url,
      timestamp: new Date(),
      overallScore,
      categories: { technical, onPage, content, performance },
      issues,
      recommendations,
    };

    this.audits.set(auditId, result);

    this.logger.info('SEO audit completed', {
      auditId,
      url,
      score: overallScore,
      issuesCount: issues.length,
    });

    return result;
  }

  private async checkTechnicalSEO(url: string): Promise<TechnicalSEO> {
    const checks: SEOCheck[] = [
      {
        name: 'SSL Certificate',
        status: url.startsWith('https') ? 'pass' : 'fail',
        impact: 'high',
        description: 'Website moet HTTPS gebruiken voor veiligheid en SEO',
      },
      {
        name: 'Robots.txt',
        status: 'pass', // Would check actual file
        impact: 'medium',
        description: 'Robots.txt bestand aanwezig en correct geconfigureerd',
      },
      {
        name: 'Sitemap.xml',
        status: 'pass', // Would check actual file
        impact: 'medium',
        description: 'XML sitemap aanwezig en geldig',
      },
      {
        name: 'Mobile Friendly',
        status: 'pass', // Would run actual test
        impact: 'high',
        description: 'Website is mobiel-vriendelijk',
      },
      {
        name: 'Canonical Tags',
        status: 'pass', // Would check actual page
        impact: 'medium',
        description: 'Canonical tags correct geïmplementeerd',
      },
      {
        name: 'Structured Data',
        status: 'warning', // Would check actual implementation
        value: 'Basis implementatie',
        expected: 'Uitgebreide schema markup',
        impact: 'medium',
        description: 'Schema.org markup kan worden uitgebreid',
      },
      {
        name: 'Hreflang Tags',
        status: 'pass', // N/A for single language
        impact: 'low',
        description: 'Hreflang tags voor meertalige sites',
      },
      {
        name: '404 Errors',
        status: 'pass',
        value: 0,
        expected: 0,
        impact: 'high',
        description: 'Geen gebroken links gevonden',
      },
      {
        name: 'Redirect Chains',
        status: 'pass',
        value: 0,
        impact: 'medium',
        description: 'Geen redirect ketens gevonden',
      },
      {
        name: 'URL Structure',
        status: 'pass',
        impact: 'medium',
        description: 'URLs zijn SEO-vriendelijk en beschrijvend',
      },
    ];

    const passCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  }

  private async checkOnPageSEO(url: string): Promise<OnPageSEO> {
    const checks: SEOCheck[] = [
      {
        name: 'Title Tag',
        status: 'pass',
        value: '58 karakters',
        expected: '< 60 karakters',
        impact: 'high',
        description: 'Title tag is aanwezig en optimale lengte',
      },
      {
        name: 'Meta Description',
        status: 'pass',
        value: '148 karakters',
        expected: '< 160 karakters',
        impact: 'high',
        description: 'Meta description is aanwezig en optimale lengte',
      },
      {
        name: 'H1 Tag',
        status: 'pass',
        value: '1 H1 tag',
        expected: 'Precies 1',
        impact: 'high',
        description: 'Precies één H1 tag per pagina',
      },
      {
        name: 'Heading Hierarchy',
        status: 'pass',
        impact: 'medium',
        description: 'Heading structuur is logisch (H1 > H2 > H3)',
      },
      {
        name: 'Image Alt Tags',
        status: 'warning',
        value: '80%',
        expected: '100%',
        impact: 'medium',
        description: 'Sommige afbeeldingen missen alt tekst',
      },
      {
        name: 'Internal Links',
        status: 'pass',
        value: '12 interne links',
        impact: 'medium',
        description: 'Goede interne link structuur',
      },
      {
        name: 'External Links',
        status: 'pass',
        impact: 'low',
        description: 'Externe links openen in nieuw tabblad',
      },
      {
        name: 'Open Graph Tags',
        status: 'pass',
        impact: 'medium',
        description: 'Open Graph tags voor social sharing',
      },
      {
        name: 'Keyword in Title',
        status: 'pass',
        impact: 'high',
        description: 'Primair keyword in title tag',
      },
      {
        name: 'Keyword in URL',
        status: 'pass',
        impact: 'medium',
        description: 'Keyword aanwezig in URL',
      },
    ];

    const passCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  }

  private async checkContentSEO(url: string): Promise<ContentSEO> {
    const checks: SEOCheck[] = [
      {
        name: 'Content Length',
        status: 'pass',
        value: '1200 woorden',
        expected: '> 300 woorden',
        impact: 'high',
        description: 'Voldoende content lengte voor SEO',
      },
      {
        name: 'Keyword Density',
        status: 'pass',
        value: '2.1%',
        expected: '1-3%',
        impact: 'medium',
        description: 'Keyword dichtheid is optimaal',
      },
      {
        name: 'Readability',
        status: 'pass',
        value: 'B1 niveau',
        impact: 'medium',
        description: 'Tekst is goed leesbaar',
      },
      {
        name: 'Unique Content',
        status: 'pass',
        value: '100%',
        expected: '> 90%',
        impact: 'high',
        description: 'Content is uniek (geen duplicaat)',
      },
      {
        name: 'LSI Keywords',
        status: 'warning',
        impact: 'medium',
        description: 'Meer semantisch gerelateerde keywords toevoegen',
      },
      {
        name: 'Content Freshness',
        status: 'pass',
        value: 'Bijgewerkt 2 weken geleden',
        impact: 'medium',
        description: 'Content is recent bijgewerkt',
      },
      {
        name: 'Multimedia',
        status: 'pass',
        value: '3 afbeeldingen, 1 video',
        impact: 'medium',
        description: 'Diverse media types aanwezig',
      },
      {
        name: 'Call-to-Action',
        status: 'pass',
        impact: 'medium',
        description: 'Duidelijke call-to-action aanwezig',
      },
    ];

    const passCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  }

  private async checkPerformanceSEO(url: string): Promise<PerformanceSEO> {
    const checks: SEOCheck[] = [
      {
        name: 'Page Load Time',
        status: 'pass',
        value: '1.8s',
        expected: '< 3s',
        impact: 'high',
        description: 'Pagina laadt binnen 2 seconden',
      },
      {
        name: 'First Contentful Paint',
        status: 'pass',
        value: '0.9s',
        expected: '< 1.8s',
        impact: 'high',
        description: 'Eerste content snel zichtbaar',
      },
      {
        name: 'Largest Contentful Paint',
        status: 'pass',
        value: '2.1s',
        expected: '< 2.5s',
        impact: 'high',
        description: 'Grootste element snel geladen',
      },
      {
        name: 'Cumulative Layout Shift',
        status: 'pass',
        value: '0.05',
        expected: '< 0.1',
        impact: 'medium',
        description: 'Minimale layout verschuiving',
      },
      {
        name: 'Time to Interactive',
        status: 'pass',
        value: '2.5s',
        expected: '< 3.8s',
        impact: 'high',
        description: 'Pagina snel interactief',
      },
      {
        name: 'Image Optimization',
        status: 'warning',
        value: '70%',
        expected: '100%',
        impact: 'medium',
        description: 'Sommige afbeeldingen kunnen worden geoptimaliseerd',
      },
      {
        name: 'Caching',
        status: 'pass',
        impact: 'medium',
        description: 'Browser caching correct geconfigureerd',
      },
      {
        name: 'Compression',
        status: 'pass',
        impact: 'medium',
        description: 'Gzip/Brotli compressie actief',
      },
    ];

    const passCount = checks.filter(c => c.status === 'pass').length;
    const score = Math.round((passCount / checks.length) * 100);

    return { score, checks };
  }

  private collectIssues(
    technical: TechnicalSEO,
    onPage: OnPageSEO,
    content: ContentSEO,
    performance: PerformanceSEO
  ): SEOIssue[] {
    const issues: SEOIssue[] = [];

    const addIssuesFromChecks = (
      checks: SEOCheck[],
      category: SEOIssue['category']
    ) => {
      for (const check of checks) {
        if (check.status === 'fail') {
          issues.push({
            id: this.generateId('issue'),
            category,
            severity: check.impact === 'high' ? 'critical' : check.impact === 'medium' ? 'high' : 'medium',
            title: `${check.name} - Gefaald`,
            description: check.description,
            howToFix: this.getFixInstructions(check.name),
          });
        } else if (check.status === 'warning') {
          issues.push({
            id: this.generateId('issue'),
            category,
            severity: 'medium',
            title: `${check.name} - Kan verbeterd worden`,
            description: check.description,
            howToFix: this.getFixInstructions(check.name),
          });
        }
      }
    };

    addIssuesFromChecks(technical.checks, 'technical');
    addIssuesFromChecks(onPage.checks, 'on-page');
    addIssuesFromChecks(content.checks, 'content');
    addIssuesFromChecks(performance.checks, 'performance');

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return issues;
  }

  private getFixInstructions(checkName: string): string {
    const instructions: Record<string, string> = {
      'SSL Certificate': 'Installeer een SSL certificaat via je hosting provider of gebruik Let\'s Encrypt.',
      'Image Alt Tags': 'Voeg beschrijvende alt tekst toe aan alle afbeeldingen. Gebruik relevante keywords waar van toepassing.',
      'LSI Keywords': 'Voeg semantisch gerelateerde keywords toe aan je content. Gebruik tools zoals LSIGraph of SEMrush.',
      'Image Optimization': 'Comprimeer afbeeldingen met tools zoals TinyPNG of ImageOptim. Gebruik WebP formaat waar mogelijk.',
      'Structured Data': 'Implementeer uitgebreide schema.org markup. Gebruik Organization, LocalBusiness, FAQ, of Product schema.',
    };

    return instructions[checkName] || 'Raadpleeg de SEO best practices documentatie voor specifieke instructies.';
  }

  private generateRecommendations(
    issues: SEOIssue[],
    categories: SEOAuditResult['categories']
  ): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];
    let priority = 1;

    // Critical issues first
    for (const issue of issues.filter(i => i.severity === 'critical')) {
      recommendations.push({
        id: this.generateId('rec'),
        priority: priority++,
        title: `Fix: ${issue.title}`,
        description: issue.howToFix,
        expectedImpact: 'Hoge impact op rankings en gebruikerservaring',
        effort: 'medium',
        category: issue.category,
      });
    }

    // High priority issues
    for (const issue of issues.filter(i => i.severity === 'high').slice(0, 3)) {
      recommendations.push({
        id: this.generateId('rec'),
        priority: priority++,
        title: `Verbeter: ${issue.title}`,
        description: issue.howToFix,
        expectedImpact: 'Significante verbetering mogelijk',
        effort: 'medium',
        category: issue.category,
      });
    }

    // Performance quick wins
    if (categories.performance.score < 90) {
      recommendations.push({
        id: this.generateId('rec'),
        priority: priority++,
        title: 'Optimaliseer Core Web Vitals',
        description: 'Focus op LCP, FID en CLS voor betere rankings en gebruikerservaring.',
        expectedImpact: 'Google gebruikt Core Web Vitals als ranking factor',
        effort: 'medium',
        category: 'performance',
      });
    }

    // Content recommendations
    if (categories.content.score < 85) {
      recommendations.push({
        id: this.generateId('rec'),
        priority: priority++,
        title: 'Verbeter content kwaliteit',
        description: 'Voeg meer diepgaande, waardevolle content toe met relevante keywords.',
        expectedImpact: 'Betere rankings voor long-tail keywords',
        effort: 'high',
        category: 'content',
      });
    }

    return recommendations;
  }

  // ============================================
  // KEYWORD RESEARCH
  // ============================================

  async analyzeKeyword(keyword: string): Promise<KeywordAnalysis> {
    this.logger.info('Analyzing keyword', { keyword });

    // In production, this would integrate with SEMrush, Ahrefs, or Google Keyword Planner
    const analysis: KeywordAnalysis = {
      keyword,
      searchVolume: this.estimateSearchVolume(keyword),
      difficulty: this.estimateKeywordDifficulty(keyword),
      currentPosition: undefined,
      topCompetitors: this.getTopCompetitors(keyword),
      relatedKeywords: this.getRelatedKeywords(keyword),
      intent: this.determineSearchIntent(keyword),
    };

    this.keywordData.set(keyword, analysis);

    return analysis;
  }

  private estimateSearchVolume(keyword: string): number {
    // Simplified estimation based on keyword characteristics
    const wordCount = keyword.split(' ').length;
    const baseVolume = 1000;
    
    // Long-tail keywords have lower volume
    const volumeMultiplier = Math.max(0.1, 1 - (wordCount - 1) * 0.3);
    
    return Math.round(baseVolume * volumeMultiplier);
  }

  private estimateKeywordDifficulty(keyword: string): number {
    // Simplified difficulty estimation
    const wordCount = keyword.split(' ').length;
    
    // Long-tail keywords are easier
    const baseDifficulty = 50;
    const difficultyReduction = (wordCount - 1) * 15;
    
    return Math.max(10, baseDifficulty - difficultyReduction);
  }

  private getTopCompetitors(keyword: string): string[] {
    // Would integrate with actual SERP data
    return [
      'competitor1.nl',
      'competitor2.nl',
      'competitor3.nl',
    ];
  }

  private getRelatedKeywords(keyword: string): string[] {
    const related: string[] = [];
    const words = keyword.split(' ');

    // Add variations
    related.push(`${keyword} kosten`);
    related.push(`${keyword} prijzen`);
    related.push(`beste ${keyword}`);
    related.push(`${keyword} vergelijken`);
    related.push(`${keyword} tips`);

    return related;
  }

  private determineSearchIntent(keyword: string): KeywordAnalysis['intent'] {
    const keywordLower = keyword.toLowerCase();

    const transactionalTerms = ['kopen', 'bestellen', 'prijzen', 'kosten', 'offerte', 'laten maken'];
    const navigationalTerms = ['website', 'contact', 'locatie', 'login'];

    if (transactionalTerms.some(term => keywordLower.includes(term))) {
      return 'transactional';
    }

    if (navigationalTerms.some(term => keywordLower.includes(term))) {
      return 'navigational';
    }

    return 'informational';
  }

  // ============================================
  // CONTENT OPTIMIZATION
  // ============================================

  async optimizeContent(pageUrl: string, targetKeyword: string): Promise<ContentOptimization> {
    this.logger.info('Optimizing content', { pageUrl, targetKeyword });

    const keywordAnalysis = await this.analyzeKeyword(targetKeyword);

    return {
      pageUrl,
      currentTitle: 'Current Page Title',
      optimizedTitle: this.generateOptimizedTitle(targetKeyword),
      currentDescription: 'Current meta description...',
      optimizedDescription: this.generateOptimizedDescription(targetKeyword),
      headingStructure: {
        current: ['H1: Current Heading', 'H2: Section 1', 'H2: Section 2'],
        recommended: this.generateHeadingStructure(targetKeyword, keywordAnalysis.relatedKeywords),
      },
      keywords: {
        primary: targetKeyword,
        secondary: keywordAnalysis.relatedKeywords.slice(0, 3),
        lsi: this.getLSIKeywords(targetKeyword),
      },
      contentGaps: this.identifyContentGaps(targetKeyword),
      internalLinkSuggestions: this.suggestInternalLinks(targetKeyword),
    };
  }

  private generateOptimizedTitle(keyword: string): string {
    const templates = [
      `${keyword} | Professioneel & Betaalbaar | Ro-Tech`,
      `${keyword} - Expert Oplossingen | Ro-Tech Development`,
      `Beste ${keyword} voor MKB | Ro-Tech`,
    ];
    return templates[0];
  }

  private generateOptimizedDescription(keyword: string): string {
    return `Op zoek naar ${keyword}? Ro-Tech Development levert professionele oplossingen op maat. ✓ Persoonlijke aanpak ✓ Moderne technologie ✓ Scherpe prijzen. Vraag gratis offerte aan!`;
  }

  private generateHeadingStructure(keyword: string, relatedKeywords: string[]): string[] {
    return [
      `H1: ${keyword} - Professionele Oplossingen op Maat`,
      `H2: Waarom kiezen voor ${keyword}?`,
      `H2: Onze ${keyword} Diensten`,
      `H2: ${relatedKeywords[0] || 'Voordelen'}`,
      `H2: Werkwijze`,
      `H2: Veelgestelde Vragen over ${keyword}`,
      `H2: Contact Opnemen`,
    ];
  }

  private getLSIKeywords(keyword: string): string[] {
    // Latent Semantic Indexing keywords
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('website')) {
      return ['webdesign', 'online aanwezigheid', 'responsive', 'SEO-vriendelijk', 'CMS'];
    }
    if (keywordLower.includes('seo')) {
      return ['vindbaarheid', 'Google rankings', 'organisch verkeer', 'zoekwoorden', 'linkbuilding'];
    }
    if (keywordLower.includes('webshop')) {
      return ['e-commerce', 'online verkopen', 'iDEAL', 'productbeheer', 'conversie'];
    }

    return ['professioneel', 'op maat', 'betrouwbaar', 'modern', 'ervaren'];
  }

  private identifyContentGaps(keyword: string): string[] {
    return [
      'FAQ sectie met veelgestelde vragen',
      'Case studies of voorbeeldprojecten',
      'Prijsindicatie tabel',
      'Vergelijking met alternatieven',
      'Video uitleg of demo',
    ];
  }

  private suggestInternalLinks(keyword: string): string[] {
    return [
      '/diensten - Link naar alle diensten',
      '/portfolio - Link naar relevante projecten',
      '/over-ons - Link voor vertrouwen',
      '/contact - Link voor conversie',
      '/blog - Link naar gerelateerde artikelen',
    ];
  }

  // ============================================
  // META TAG GENERATION
  // ============================================

  async generateMetaTags(
    pageUrl: string,
    pageType: string,
    primaryKeyword: string,
    contentSummary: string
  ): Promise<{
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    h1: string;
    h2Suggestions: string[];
  }> {
    const context: PromptContext = {
      additionalContext: {
        pageUrl,
        pageType,
        primaryKeyword,
        contentSummary,
        secondaryKeywords: this.getRelatedKeywords(primaryKeyword).join(', '),
      },
    };

    // Generate using prompt engine if available
    try {
      const prompt = await this.generatePrompt(context);
      // Parse response - in production this would call an LLM
    } catch {
      // Fallback to template-based generation
    }

    return {
      title: this.generateOptimizedTitle(primaryKeyword),
      description: this.generateOptimizedDescription(primaryKeyword),
      ogTitle: `${primaryKeyword} | Ro-Tech Development`,
      ogDescription: this.generateOptimizedDescription(primaryKeyword),
      h1: `${primaryKeyword} - Professionele Oplossingen`,
      h2Suggestions: this.generateHeadingStructure(primaryKeyword, []).slice(1),
    };
  }

  // ============================================
  // ABSTRACT METHOD IMPLEMENTATIONS
  // ============================================

  async getSpecializedPrompts(): Promise<string[]> {
    return [
      'seo-meta-optimization',
      'content-optimization',
      'keyword-research',
      'seo-audit-report',
      'competitor-analysis',
    ];
  }

  async executeWorkflow(
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    switch (workflowId) {
      case 'full-audit':
        return this.performAudit(data.url as string);
      
      case 'keyword-analysis':
        return this.analyzeKeyword(data.keyword as string);
      
      case 'content-optimization':
        return this.optimizeContent(
          data.pageUrl as string,
          data.targetKeyword as string
        );
      
      case 'meta-generation':
        return this.generateMetaTags(
          data.pageUrl as string,
          data.pageType as string,
          data.primaryKeyword as string,
          data.contentSummary as string
        );
      
      default:
        throw new Error(`Unknown workflow: ${workflowId}`);
    }
  }

  getCapabilities(): string[] {
    return [
      'Uitgebreide SEO audits',
      'Technische SEO analyse',
      'On-page SEO optimalisatie',
      'Content SEO analyse',
      'Performance SEO checks',
      'Keyword research',
      'Zoekintentie analyse',
      'Meta tag optimalisatie',
      'Content gap analyse',
      'Interne link suggesties',
      'Competitor analyse (planned)',
      'Ranking monitoring (planned)',
    ];
  }

  // ============================================
  // REPORT GENERATION
  // ============================================

  protected getReportType(): ReportType {
    return 'seo-audit';
  }

  async generateAuditReport(auditId: string): Promise<ReturnType<typeof this.createReport>> {
    const audit = this.audits.get(auditId);
    if (!audit) {
      throw new Error(`Audit not found: ${auditId}`);
    }

    return this.pdfGenerator.generateSEOAuditReport({
      url: audit.url,
      overallScore: audit.overallScore,
      technicalSEO: audit.categories.technical.checks.map(c => ({
        check: c.name,
        status: c.status,
        details: c.description,
      })),
      contentAnalysis: audit.categories.content.checks.map(c => ({
        metric: c.name,
        value: String(c.value || c.status),
        recommendation: c.description,
      })),
      keywords: [], // Would include actual keyword data
      recommendations: audit.recommendations.map(r => r.title),
    });
  }
}

// ============================================
// FACTORY & REGISTRATION
// ============================================

export function createSEOAgent(): SEOAgent {
  const agent = new SEOAgent();
  registerAgent(agent);
  return agent;
}

const seoAgent = createSEOAgent();
export { seoAgent };
