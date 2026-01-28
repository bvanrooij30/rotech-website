/**
 * RoTech AI Agents - PDF Generator
 * Professionele PDF rapportage generator
 */

import {
  PDFTemplate,
  PDFSection,
  BrandingOptions,
  ReportType,
  ReportData,
  Project,
} from './types';
import { AgentLogger } from './logger';

// ============================================
// DEFAULT BRANDING
// ============================================

const DEFAULT_BRANDING: BrandingOptions = {
  companyName: 'Ro-Tech Development',
  tagline: 'Moderne websites & web applicaties',
  website: 'ro-techdevelopment.dev',
  email: 'contact@ro-techdevelopment.dev',
  phone: '+31 6 57 23 55 74',
  address: 'Kruisstraat 64, 5502 JG Veldhoven',
  footer: '© 2026 Ro-Tech Development - Alle rechten voorbehouden',
};

// ============================================
// PDF TEMPLATES
// ============================================

const REPORT_TEMPLATES: Record<ReportType, PDFTemplate> = {
  'project-proposal': {
    id: 'project-proposal',
    name: 'Project Voorstel',
    category: 'proposal',
    sections: [
      { id: 'header', title: 'Projectvoorstel', type: 'text', order: 1 },
      { id: 'summary', title: 'Samenvatting', type: 'text', order: 2 },
      { id: 'scope', title: 'Scope & Deliverables', type: 'list', order: 3 },
      { id: 'timeline', title: 'Planning', type: 'table', order: 4 },
      { id: 'pricing', title: 'Investering', type: 'table', order: 5 },
      { id: 'terms', title: 'Voorwaarden', type: 'text', order: 6 },
    ],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'project-progress': {
    id: 'project-progress',
    name: 'Voortgangsrapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Voortgangsrapport', type: 'text', order: 1 },
      { id: 'summary', title: 'Status Overzicht', type: 'text', order: 2 },
      { id: 'completed', title: 'Voltooide Taken', type: 'list', order: 3 },
      { id: 'in-progress', title: 'Lopende Werkzaamheden', type: 'list', order: 4 },
      { id: 'upcoming', title: 'Gepland', type: 'list', order: 5 },
      { id: 'issues', title: 'Aandachtspunten', type: 'list', order: 6 },
      { id: 'timeline', title: 'Tijdlijn', type: 'chart', order: 7 },
    ],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'project-completion': {
    id: 'project-completion',
    name: 'Opleverdocument',
    category: 'documentation',
    sections: [
      { id: 'header', title: 'Opleverdocument', type: 'text', order: 1 },
      { id: 'overview', title: 'Project Overzicht', type: 'text', order: 2 },
      { id: 'deliverables', title: 'Opgeleverde Onderdelen', type: 'list', order: 3 },
      { id: 'access', title: 'Toegangsgegevens', type: 'table', order: 4 },
      { id: 'instructions', title: 'Gebruiksaanwijzingen', type: 'text', order: 5 },
      { id: 'support', title: 'Support Informatie', type: 'text', order: 6 },
      { id: 'next-steps', title: 'Vervolgstappen', type: 'list', order: 7 },
    ],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'seo-audit': {
    id: 'seo-audit',
    name: 'SEO Audit Rapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'SEO Audit Rapport', type: 'text', order: 1 },
      { id: 'score', title: 'Overall Score', type: 'chart', order: 2 },
      { id: 'technical', title: 'Technische SEO', type: 'table', order: 3 },
      { id: 'content', title: 'Content Analyse', type: 'table', order: 4 },
      { id: 'keywords', title: 'Keyword Analyse', type: 'table', order: 5 },
      { id: 'backlinks', title: 'Backlink Profiel', type: 'table', order: 6 },
      { id: 'recommendations', title: 'Aanbevelingen', type: 'list', order: 7 },
      { id: 'action-plan', title: 'Actieplan', type: 'table', order: 8 },
    ],
    styling: {
      primaryColor: '#16a34a',
      secondaryColor: '#15803d',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'security-audit': {
    id: 'security-audit',
    name: 'Security Audit Rapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Security Audit Rapport', type: 'text', order: 1 },
      { id: 'summary', title: 'Executive Summary', type: 'text', order: 2 },
      { id: 'score', title: 'Security Score', type: 'chart', order: 3 },
      { id: 'vulnerabilities', title: 'Gevonden Kwetsbaarheden', type: 'table', order: 4 },
      { id: 'ssl', title: 'SSL/TLS Status', type: 'table', order: 5 },
      { id: 'headers', title: 'Security Headers', type: 'table', order: 6 },
      { id: 'recommendations', title: 'Aanbevelingen', type: 'list', order: 7 },
    ],
    styling: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'performance-report': {
    id: 'performance-report',
    name: 'Performance Rapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Performance Rapport', type: 'text', order: 1 },
      { id: 'summary', title: 'Samenvatting', type: 'text', order: 2 },
      { id: 'metrics', title: 'Core Web Vitals', type: 'chart', order: 3 },
      { id: 'lighthouse', title: 'Lighthouse Scores', type: 'table', order: 4 },
      { id: 'improvements', title: 'Verbeterpunten', type: 'list', order: 5 },
      { id: 'history', title: 'Historische Trend', type: 'chart', order: 6 },
    ],
    styling: {
      primaryColor: '#7c3aed',
      secondaryColor: '#6d28d9',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'financial-report': {
    id: 'financial-report',
    name: 'Financieel Rapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Financieel Overzicht', type: 'text', order: 1 },
      { id: 'summary', title: 'Samenvatting', type: 'text', order: 2 },
      { id: 'budget', title: 'Budget Overzicht', type: 'table', order: 3 },
      { id: 'breakdown', title: 'Kostenspecificatie', type: 'table', order: 4 },
      { id: 'timeline', title: 'Betalingsoverzicht', type: 'table', order: 5 },
    ],
    styling: {
      primaryColor: '#0891b2',
      secondaryColor: '#0e7490',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'maintenance-report': {
    id: 'maintenance-report',
    name: 'Onderhoudsrapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Onderhoudsrapport', type: 'text', order: 1 },
      { id: 'period', title: 'Rapportageperiode', type: 'text', order: 2 },
      { id: 'uptime', title: 'Uptime Statistieken', type: 'chart', order: 3 },
      { id: 'updates', title: 'Uitgevoerde Updates', type: 'list', order: 4 },
      { id: 'security', title: 'Security Status', type: 'table', order: 5 },
      { id: 'backups', title: 'Backup Status', type: 'table', order: 6 },
      { id: 'performance', title: 'Performance', type: 'chart', order: 7 },
      { id: 'recommendations', title: 'Aanbevelingen', type: 'list', order: 8 },
    ],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'incident-report': {
    id: 'incident-report',
    name: 'Incident Rapport',
    category: 'report',
    sections: [
      { id: 'header', title: 'Incident Rapport', type: 'text', order: 1 },
      { id: 'summary', title: 'Incident Samenvatting', type: 'text', order: 2 },
      { id: 'timeline', title: 'Tijdlijn', type: 'table', order: 3 },
      { id: 'impact', title: 'Impact Analyse', type: 'text', order: 4 },
      { id: 'root-cause', title: 'Root Cause Analyse', type: 'text', order: 5 },
      { id: 'resolution', title: 'Oplossing', type: 'text', order: 6 },
      { id: 'prevention', title: 'Preventie Maatregelen', type: 'list', order: 7 },
    ],
    styling: {
      primaryColor: '#ea580c',
      secondaryColor: '#c2410c',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
  'custom': {
    id: 'custom',
    name: 'Custom Rapport',
    category: 'report',
    sections: [],
    styling: {
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 12,
      margins: { top: 40, right: 40, bottom: 40, left: 40 },
    },
    branding: DEFAULT_BRANDING,
  },
};

// ============================================
// PDF CONTENT BUILDER
// ============================================

interface PDFContent {
  header: {
    title: string;
    subtitle?: string;
    date: string;
    logo?: string;
  };
  sections: Array<{
    title: string;
    content: string;
    type: 'text' | 'table' | 'list' | 'chart';
  }>;
  footer: {
    company: string;
    contact: string;
    page: string;
  };
  metadata: {
    author: string;
    createdAt: Date;
    version: string;
  };
}

class PDFContentBuilder {
  private content: Partial<PDFContent> = {};

  setHeader(title: string, subtitle?: string, date?: string): this {
    this.content.header = {
      title,
      subtitle,
      date: date || new Date().toLocaleDateString('nl-NL'),
    };
    return this;
  }

  addSection(title: string, content: string, type: 'text' | 'table' | 'list' | 'chart' = 'text'): this {
    if (!this.content.sections) {
      this.content.sections = [];
    }
    this.content.sections.push({ title, content, type });
    return this;
  }

  addTextSection(title: string, paragraphs: string[]): this {
    return this.addSection(title, paragraphs.join('\n\n'), 'text');
  }

  addListSection(title: string, items: string[]): this {
    const content = items.map((item, i) => `${i + 1}. ${item}`).join('\n');
    return this.addSection(title, content, 'list');
  }

  addTableSection(title: string, headers: string[], rows: string[][]): this {
    const headerRow = `| ${headers.join(' | ')} |`;
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map(row => `| ${row.join(' | ')} |`).join('\n');
    const content = `${headerRow}\n${separator}\n${dataRows}`;
    return this.addSection(title, content, 'table');
  }

  setFooter(company: string, contact: string): this {
    this.content.footer = {
      company,
      contact,
      page: 'Pagina {page} van {total}',
    };
    return this;
  }

  setMetadata(author: string, version: string = '1.0'): this {
    this.content.metadata = {
      author,
      createdAt: new Date(),
      version,
    };
    return this;
  }

  build(): PDFContent {
    return this.content as PDFContent;
  }
}

// ============================================
// PDF GENERATOR CLASS
// ============================================

export class PDFGenerator {
  private logger: AgentLogger;
  private branding: BrandingOptions;

  constructor(logger: AgentLogger, branding?: Partial<BrandingOptions>) {
    this.logger = logger;
    this.branding = { ...DEFAULT_BRANDING, ...branding };
  }

  // ============================================
  // TEMPLATE MANAGEMENT
  // ============================================

  getTemplate(type: ReportType): PDFTemplate {
    return REPORT_TEMPLATES[type];
  }

  getAllTemplates(): PDFTemplate[] {
    return Object.values(REPORT_TEMPLATES);
  }

  // ============================================
  // GENERATION
  // ============================================

  async generate(type: ReportType, data: ReportData): Promise<PDFDocument> {
    const template = this.getTemplate(type);
    const startTime = Date.now();

    this.logger.info('Generating PDF report', {
      type,
      title: data.title,
      sectionsCount: data.sections.length,
    });

    try {
      const content = this.buildContent(template, data);
      const markdown = this.renderToMarkdown(content, template);
      const html = this.renderToHTML(content, template);

      const document: PDFDocument = {
        id: this.generateId(),
        type,
        title: data.title,
        content: html,
        markdown,
        metadata: {
          author: data.author,
          createdAt: data.date,
          generatedAt: new Date(),
          version: '1.0',
          pageCount: this.estimatePageCount(html),
        },
        size: Buffer.byteLength(html, 'utf8'),
      };

      const duration = Date.now() - startTime;
      this.logger.reportGenerated(document.id, type, document.size);
      this.logger.performance('pdf-generation', duration, { type, size: document.size });

      return document;
    } catch (error) {
      this.logger.error('PDF generation failed', error as Error, { type, title: data.title });
      throw error;
    }
  }

  // ============================================
  // SPECIFIC REPORT GENERATORS
  // ============================================

  async generateProjectProposal(project: {
    name: string;
    description: string;
    client: string;
    scope: string[];
    timeline: Array<{ phase: string; duration: string; deliverables: string }>;
    pricing: Array<{ item: string; price: string }>;
    totalPrice: string;
  }): Promise<PDFDocument> {
    const data: ReportData = {
      title: `Projectvoorstel: ${project.name}`,
      subtitle: `Voor: ${project.client}`,
      date: new Date(),
      author: this.branding.companyName,
      sections: [
        {
          title: 'Projectbeschrijving',
          content: project.description,
          type: 'text',
        },
        {
          title: 'Scope & Deliverables',
          content: project.scope,
          type: 'list',
        },
        {
          title: 'Planning',
          content: {
            headers: ['Fase', 'Duur', 'Deliverables'],
            rows: project.timeline.map(t => [t.phase, t.duration, t.deliverables]),
          },
          type: 'table',
        },
        {
          title: 'Investering',
          content: {
            headers: ['Onderdeel', 'Prijs'],
            rows: [...project.pricing.map(p => [p.item, p.price]), ['Totaal', project.totalPrice]],
          },
          type: 'table',
        },
      ],
    };

    return this.generate('project-proposal', data);
  }

  async generateProgressReport(project: Project): Promise<PDFDocument> {
    const completedTasks = project.phases
      .flatMap(p => p.tasks)
      .filter(t => t.status === 'completed')
      .map(t => t.title);

    const inProgressTasks = project.phases
      .flatMap(p => p.tasks)
      .filter(t => t.status === 'in-progress')
      .map(t => t.title);

    const pendingTasks = project.phases
      .flatMap(p => p.tasks)
      .filter(t => t.status === 'pending')
      .map(t => t.title);

    const data: ReportData = {
      title: `Voortgangsrapport: ${project.name}`,
      date: new Date(),
      author: this.branding.companyName,
      sections: [
        {
          title: 'Status Overzicht',
          content: `Project status: ${project.status}\nHuidige fase: ${project.phases.find(p => p.status === 'in-progress')?.name || 'N/A'}`,
          type: 'text',
        },
        {
          title: 'Voltooide Taken',
          content: completedTasks.length > 0 ? completedTasks : ['Nog geen taken voltooid'],
          type: 'list',
        },
        {
          title: 'Lopende Werkzaamheden',
          content: inProgressTasks.length > 0 ? inProgressTasks : ['Geen lopende taken'],
          type: 'list',
        },
        {
          title: 'Gepland',
          content: pendingTasks.length > 0 ? pendingTasks : ['Geen geplande taken'],
          type: 'list',
        },
      ],
    };

    return this.generate('project-progress', data);
  }

  async generateSEOAuditReport(audit: {
    url: string;
    overallScore: number;
    technicalSEO: Array<{ check: string; status: 'pass' | 'fail' | 'warning'; details: string }>;
    contentAnalysis: Array<{ metric: string; value: string; recommendation: string }>;
    keywords: Array<{ keyword: string; volume: string; difficulty: string; position: string }>;
    recommendations: string[];
  }): Promise<PDFDocument> {
    const data: ReportData = {
      title: `SEO Audit Rapport`,
      subtitle: audit.url,
      date: new Date(),
      author: this.branding.companyName,
      sections: [
        {
          title: 'Overall Score',
          content: `${audit.overallScore}/100`,
          type: 'text',
        },
        {
          title: 'Technische SEO',
          content: {
            headers: ['Check', 'Status', 'Details'],
            rows: audit.technicalSEO.map(t => [t.check, t.status, t.details]),
          },
          type: 'table',
        },
        {
          title: 'Content Analyse',
          content: {
            headers: ['Metric', 'Waarde', 'Aanbeveling'],
            rows: audit.contentAnalysis.map(c => [c.metric, c.value, c.recommendation]),
          },
          type: 'table',
        },
        {
          title: 'Keyword Analyse',
          content: {
            headers: ['Keyword', 'Volume', 'Difficulty', 'Positie'],
            rows: audit.keywords.map(k => [k.keyword, k.volume, k.difficulty, k.position]),
          },
          type: 'table',
        },
        {
          title: 'Aanbevelingen',
          content: audit.recommendations,
          type: 'list',
        },
      ],
    };

    return this.generate('seo-audit', data);
  }

  async generateMaintenanceReport(maintenance: {
    period: { start: Date; end: Date };
    uptime: number;
    updates: string[];
    securityStatus: 'good' | 'warning' | 'critical';
    backupStatus: { lastBackup: Date; size: string; status: 'success' | 'failed' | 'pending' };
    performance: { avgLoadTime: number; lighthouseScore: number };
    recommendations: string[];
  }): Promise<PDFDocument> {
    const data: ReportData = {
      title: 'Maandelijks Onderhoudsrapport',
      subtitle: `${maintenance.period.start.toLocaleDateString('nl-NL')} - ${maintenance.period.end.toLocaleDateString('nl-NL')}`,
      date: new Date(),
      author: this.branding.companyName,
      sections: [
        {
          title: 'Uptime',
          content: `${maintenance.uptime}% uptime deze periode`,
          type: 'text',
        },
        {
          title: 'Uitgevoerde Updates',
          content: maintenance.updates,
          type: 'list',
        },
        {
          title: 'Security Status',
          content: `Status: ${maintenance.securityStatus}`,
          type: 'text',
        },
        {
          title: 'Backup Status',
          content: {
            headers: ['Laatste Backup', 'Grootte', 'Status'],
            rows: [[
              maintenance.backupStatus.lastBackup.toLocaleDateString('nl-NL'),
              maintenance.backupStatus.size,
              maintenance.backupStatus.status,
            ]],
          },
          type: 'table',
        },
        {
          title: 'Performance',
          content: `Gemiddelde laadtijd: ${maintenance.performance.avgLoadTime}ms\nLighthouse score: ${maintenance.performance.lighthouseScore}/100`,
          type: 'text',
        },
        {
          title: 'Aanbevelingen',
          content: maintenance.recommendations,
          type: 'list',
        },
      ],
    };

    return this.generate('maintenance-report', data);
  }

  // ============================================
  // CONTENT BUILDING
  // ============================================

  private buildContent(template: PDFTemplate, data: ReportData): PDFContent {
    const builder = new PDFContentBuilder();

    builder
      .setHeader(data.title, data.subtitle, data.date.toLocaleDateString('nl-NL'))
      .setFooter(this.branding.companyName, this.branding.email || '')
      .setMetadata(data.author);

    // Add sections from data
    for (const section of data.sections) {
      if (section.type === 'list' && Array.isArray(section.content)) {
        builder.addListSection(section.title, section.content);
      } else if (section.type === 'table' && typeof section.content === 'object') {
        const tableData = section.content as { headers: string[]; rows: string[][] };
        builder.addTableSection(section.title, tableData.headers, tableData.rows);
      } else {
        builder.addSection(section.title, String(section.content), section.type);
      }
    }

    return builder.build();
  }

  // ============================================
  // RENDERING
  // ============================================

  private renderToMarkdown(content: PDFContent, template: PDFTemplate): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${content.header.title}`);
    if (content.header.subtitle) {
      lines.push(`## ${content.header.subtitle}`);
    }
    lines.push(`\n**Datum:** ${content.header.date}`);
    lines.push(`\n---\n`);

    // Sections
    for (const section of content.sections) {
      lines.push(`## ${section.title}\n`);
      lines.push(section.content);
      lines.push('\n');
    }

    // Footer
    lines.push('---');
    lines.push(`\n*${this.branding.companyName}*`);
    lines.push(`*${this.branding.website}*`);
    lines.push(`*${this.branding.footer}*`);

    return lines.join('\n');
  }

  private renderToHTML(content: PDFContent, template: PDFTemplate): string {
    const { styling, branding } = template;

    return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.header.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${styling.fontFamily};
      font-size: ${styling.fontSize}pt;
      line-height: 1.6;
      color: #1f2937;
      padding: ${styling.margins.top}px ${styling.margins.right}px ${styling.margins.bottom}px ${styling.margins.left}px;
    }
    
    .header {
      border-bottom: 3px solid ${styling.primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: ${styling.primaryColor};
      font-size: 24pt;
      font-weight: 700;
    }
    
    .header h2 {
      color: ${styling.secondaryColor};
      font-size: 14pt;
      font-weight: 500;
      margin-top: 5px;
    }
    
    .header .date {
      color: #6b7280;
      font-size: 10pt;
      margin-top: 10px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section h2 {
      color: ${styling.primaryColor};
      font-size: 14pt;
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .section-content {
      color: #374151;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    
    th, td {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: ${styling.primaryColor};
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    ul, ol {
      padding-left: 20px;
    }
    
    li {
      margin: 5px 0;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 9pt;
    }
    
    .footer .company {
      font-weight: 600;
      color: ${styling.primaryColor};
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${content.header.title}</h1>
    ${content.header.subtitle ? `<h2>${content.header.subtitle}</h2>` : ''}
    <div class="date">Datum: ${content.header.date}</div>
  </div>
  
  ${content.sections.map(section => `
    <div class="section">
      <h2>${section.title}</h2>
      <div class="section-content">
        ${this.renderSectionContent(section.content, section.type)}
      </div>
    </div>
  `).join('')}
  
  <div class="footer">
    <div class="company">${branding.companyName}</div>
    <div>${branding.website} | ${branding.email}</div>
    <div>${branding.phone}</div>
    <div style="margin-top: 10px">${branding.footer}</div>
  </div>
</body>
</html>
    `.trim();
  }

  private renderSectionContent(content: string, type: string): string {
    if (type === 'list') {
      const items = content.split('\n').filter(Boolean);
      return `<ul>${items.map(item => `<li>${item.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ul>`;
    }

    if (type === 'table') {
      // Parse markdown table
      const lines = content.split('\n').filter(Boolean);
      if (lines.length < 2) return `<p>${content}</p>`;

      const headers = lines[0].split('|').filter(Boolean).map(h => h.trim());
      const rows = lines.slice(2).map(line => 
        line.split('|').filter(Boolean).map(cell => cell.trim())
      );

      return `
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      `;
    }

    // Default: text with paragraphs
    return content.split('\n\n').map(p => `<p>${p}</p>`).join('');
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimatePageCount(html: string): number {
    // Rough estimate: ~3000 characters per page
    return Math.max(1, Math.ceil(html.length / 3000));
  }

  // ============================================
  // BRANDING
  // ============================================

  setBranding(branding: Partial<BrandingOptions>): void {
    this.branding = { ...this.branding, ...branding };
  }

  getBranding(): BrandingOptions {
    return { ...this.branding };
  }
}

// ============================================
// PDF DOCUMENT TYPE
// ============================================

export interface PDFDocument {
  id: string;
  type: ReportType;
  title: string;
  content: string; // HTML content
  markdown: string; // Markdown version
  metadata: {
    author: string;
    createdAt: Date;
    generatedAt: Date;
    version: string;
    pageCount: number;
  };
  size: number; // in bytes
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createPDFGenerator(
  logger: AgentLogger,
  branding?: Partial<BrandingOptions>
): PDFGenerator {
  return new PDFGenerator(logger, branding);
}
