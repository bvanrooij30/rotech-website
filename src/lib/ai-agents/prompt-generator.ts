/**
 * AI Agent Prompt Generator
 * 
 * Dit systeem genereert automatisch uitgebreide Cursor-ready prompts
 * op basis van klantdata en intake informatie.
 * 
 * Flow:
 * 1. Lead komt binnen via website/email
 * 2. Intake Agent verwerkt en scoort
 * 3. Prompt Generator maakt complete Cursor prompt
 * 4. Bart opent in Cursor en bouwt het product
 */

import prisma from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface ClientData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  kvk?: string;
  btw?: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  currentWebsite?: string;
}

export interface ProjectData {
  type: 'starter' | 'business' | 'webshop' | 'maatwerk' | 'automatisering' | 'pwa' | 'api-integratie' | 'seo' | 'onderhoud' | 'chatbot';
  goals: string[];
  pages: string[];
  features: string[];
  contentProvided: {
    logo: boolean;
    texts: boolean;
    photos: boolean;
    brandColors: boolean;
  };
  inspirationSites: Array<{ url: string; whatLiked: string }>;
  budget: { min: number; max: number };
  timeline: string;
  specificWishes?: string;
  domain?: string;
  hasDomain: boolean;
  hasHosting: boolean;
}

export interface GeneratedPrompt {
  id: string;
  createdAt: Date;
  leadId?: string;
  projectType: string;
  title: string;
  prompt: string;
  sections: {
    setup: string;
    components: string;
    functionality: string;
    seo: string;
    deployment: string;
    checklist: string;
  };
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
}

// ============================================
// PROMPT TEMPLATES
// ============================================

const PROJECT_TEMPLATES: Record<string, {
  name: string;
  basePrice: number;
  estimatedHours: { min: number; max: number };
  defaultFeatures: string[];
}> = {
  starter: {
    name: 'Starter Website',
    basePrice: 1295,
    estimatedHours: { min: 8, max: 16 },
    defaultFeatures: [
      'Responsive design (mobile-first)',
      'SSL certificaat (HTTPS)',
      'Contactformulier',
      'WhatsApp button',
      'SEO basis',
      'Google Analytics ready',
    ],
  },
  business: {
    name: 'Business Website',
    basePrice: 2995,
    estimatedHours: { min: 20, max: 40 },
    defaultFeatures: [
      'Responsive design (mobile-first)',
      'SSL certificaat (HTTPS)',
      'CMS (zelf content beheren)',
      'Blog/nieuws module',
      'Contactformulier met validatie',
      'WhatsApp button',
      'Uitgebreide SEO',
      'Google Analytics',
      'Meerdere pagina templates',
    ],
  },
  webshop: {
    name: 'Webshop',
    basePrice: 4995,
    estimatedHours: { min: 40, max: 80 },
    defaultFeatures: [
      'Responsive design (mobile-first)',
      'iDEAL betaling',
      'Productbeheer',
      'Orderbeheer',
      'Voorraadbeheer',
      'Klantenaccounts',
      'Verzendopties',
      'BTW berekening',
      'Uitgebreide SEO',
    ],
  },
  maatwerk: {
    name: 'Maatwerk Web Applicatie',
    basePrice: 9995,
    estimatedHours: { min: 80, max: 200 },
    defaultFeatures: [
      'Custom design',
      'User authentication',
      'Role-based access',
      'Dashboard',
      'API integraties',
      'Database design',
      'Admin panel',
    ],
  },
  automatisering: {
    name: 'Digital Process Automation',
    basePrice: 500,
    estimatedHours: { min: 8, max: 24 },
    defaultFeatures: [
      'Workflow design',
      'n8n/Make.com setup',
      'API koppelingen',
      'Error handling',
      'Monitoring dashboard',
    ],
  },
  pwa: {
    name: 'Progressive Web App',
    basePrice: 1500,
    estimatedHours: { min: 16, max: 32 },
    defaultFeatures: [
      'Offline functionaliteit',
      'Push notifications',
      'App-like experience',
      'Installeerbaar op device',
      'Service worker',
    ],
  },
  'api-integratie': {
    name: 'API Integratie',
    basePrice: 750,
    estimatedHours: { min: 8, max: 24 },
    defaultFeatures: [
      'API design',
      'Authentication',
      'Rate limiting',
      'Error handling',
      'Documentatie',
    ],
  },
  seo: {
    name: 'SEO Optimalisatie',
    basePrice: 750,
    estimatedHours: { min: 8, max: 16 },
    defaultFeatures: [
      'SEO audit',
      'Keyword onderzoek',
      'On-page optimalisatie',
      'Technical SEO',
      'Content strategie',
    ],
  },
  onderhoud: {
    name: 'Website Onderhoud',
    basePrice: 99,
    estimatedHours: { min: 1, max: 8 },
    defaultFeatures: [
      'Updates & security patches',
      'Backups',
      'Uptime monitoring',
      'Content wijzigingen',
      'Support',
    ],
  },
  chatbot: {
    name: 'AI Chatbot',
    basePrice: 1500,
    estimatedHours: { min: 16, max: 40 },
    defaultFeatures: [
      'AI-powered responses',
      'Custom training data',
      'Multi-platform deploy',
      'Analytics dashboard',
      'Conversation history',
    ],
  },
};

// ============================================
// PROMPT GENERATOR CLASS
// ============================================

export class PromptGenerator {
  /**
   * Generate a complete Cursor-ready prompt from client/project data
   */
  async generatePrompt(
    client: ClientData,
    project: ProjectData
  ): Promise<GeneratedPrompt> {
    const template = PROJECT_TEMPLATES[project.type];
    if (!template) {
      throw new Error(`Unknown project type: ${project.type}`);
    }

    const id = `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    // Calculate complexity
    const complexity = this.calculateComplexity(project);
    
    // Calculate estimated hours
    const estimatedHours = this.calculateEstimatedHours(project, template);

    // Generate sections
    const sections = {
      setup: this.generateSetupSection(client, project, template),
      components: this.generateComponentsSection(client, project),
      functionality: this.generateFunctionalitySection(project),
      seo: this.generateSEOSection(client, project),
      deployment: this.generateDeploymentSection(client, project),
      checklist: this.generateChecklist(project),
    };

    // Combine into full prompt
    const prompt = this.combineIntoPrompt(client, project, template, sections);

    const generatedPrompt: GeneratedPrompt = {
      id,
      createdAt: now,
      projectType: project.type,
      title: `${template.name} voor ${client.companyName}`,
      prompt,
      sections,
      estimatedHours,
      complexity,
    };

    // Save to database
    await this.savePromptToDatabase(generatedPrompt, client);

    return generatedPrompt;
  }

  private calculateComplexity(project: ProjectData): 'low' | 'medium' | 'high' {
    const featureCount = project.features.length;
    const pageCount = project.pages.length;
    
    if (project.type === 'maatwerk' || featureCount > 10 || pageCount > 10) {
      return 'high';
    }
    if (featureCount > 5 || pageCount > 5 || project.type === 'webshop') {
      return 'medium';
    }
    return 'low';
  }

  private calculateEstimatedHours(
    project: ProjectData,
    template: typeof PROJECT_TEMPLATES[string]
  ): number {
    const baseHours = (template.estimatedHours.min + template.estimatedHours.max) / 2;
    
    // Add for extra features
    const extraFeatures = project.features.length - template.defaultFeatures.length;
    const featureHours = Math.max(0, extraFeatures * 2);
    
    // Add for extra pages
    const pageHours = Math.max(0, (project.pages.length - 3) * 1.5);
    
    // Add for inspiration complexity
    const inspirationHours = project.inspirationSites.length * 0.5;
    
    return Math.round(baseHours + featureHours + pageHours + inspirationHours);
  }

  private generateSetupSection(
    client: ClientData,
    project: ProjectData,
    template: typeof PROJECT_TEMPLATES[string]
  ): string {
    return `
## STAP 1: PROJECT SETUP

\`\`\`
Maak een nieuwe Next.js 16 ${template.name} voor ${client.companyName}.

BEDRIJFSGEGEVENS:
- Naam: ${client.companyName}
- Contactpersoon: ${client.contactName}
- Type: ${client.businessType}
- Branche: ${client.industry}
- Doelgroep: ${client.targetAudience}
- Telefoon: ${client.phone || 'Niet opgegeven'}
- Email: ${client.email}
- Adres: ${client.address || 'Niet opgegeven'}

DOMEIN:
- Gewenst domein: ${project.domain || 'Nog te bepalen'}
- Heeft al domein: ${project.hasDomain ? 'Ja' : 'Nee'}
- Heeft al hosting: ${project.hasHosting ? 'Ja' : 'Nee'}

HUISSTIJL:
- Logo: ${project.contentProvided.logo ? 'Aangeleverd' : 'Nog aan te leveren'}
- Kleuren: ${project.contentProvided.brandColors ? 'Aangeleverd' : 'Bepaal passend bij branche'}
- Teksten: ${project.contentProvided.texts ? 'Aangeleverd' : 'AI genereren op basis van bedrijfsinfo'}
- Foto\'s: ${project.contentProvided.photos ? 'Aangeleverd' : 'Stock foto\'s of AI genereren'}

TECHNISCHE SETUP:
1. Initialiseer Next.js 16 met TypeScript, Tailwind CSS v4, App Router
2. Installeer: framer-motion, lucide-react, react-hook-form, zod, resend
3. Configureer fonts: Inter voor body, Space Grotesk voor headings
4. Maak de complete projectstructuur aan

INSPIRATIE SITES:
${project.inspirationSites.map((site, i) => `${i + 1}. ${site.url} - Wat de klant mooi vindt: ${site.whatLiked}`).join('\n')}
\`\`\`
`.trim();
  }

  private generateComponentsSection(client: ClientData, project: ProjectData): string {
    const pages = project.pages.length > 0 
      ? project.pages.join('\n- ') 
      : 'Homepage (one-page met secties)';

    return `
## STAP 2: PAGINA'S & COMPONENTEN

\`\`\`
GEVRAAGDE PAGINA'S:
- ${pages}

DOELEN VAN DE WEBSITE:
${project.goals.map(g => `- ${g}`).join('\n')}

BOUW DE VOLGENDE SECTIES:

1. HEADER
   - Logo links: ${client.companyName}
   - Navigatie rechts (scroll-to-section of pagina links)
   - Sticky on scroll
   - Mobile hamburger menu

2. HERO SECTIE
   - Headline gebaseerd op: ${project.goals[0] || 'Bedrijfspresentatie'}
   - Subheadline met value proposition voor ${client.targetAudience}
   - CTA button naar contact
   - Passende achtergrond voor ${client.industry}

3. OVER/ABOUT SECTIE
   - Introductie ${client.companyName}
   - ${client.businessType} in de ${client.industry}

4. DIENSTEN/FEATURES SECTIE
   - Cards met iconen
   - Gebaseerd op wat ${client.companyName} aanbiedt

5. CONTACT SECTIE
   - Contactformulier (naam, email, telefoon, bericht)
   - Contactgegevens: ${client.email}, ${client.phone || 'telefoon toevoegen'}
   - WhatsApp button

6. FOOTER
   - Logo
   - Contactgegevens
   - Copyright © ${new Date().getFullYear()} ${client.companyName}
   - Privacy policy link
   - "Website door RoTech Development" credit
\`\`\`
`.trim();
  }

  private generateFunctionalitySection(project: ProjectData): string {
    const features = [...PROJECT_TEMPLATES[project.type].defaultFeatures, ...project.features];
    const uniqueFeatures = [...new Set(features)];

    return `
## STAP 3: FUNCTIONALITEIT

\`\`\`
VEREISTE FEATURES:
${uniqueFeatures.map(f => `- ${f}`).join('\n')}

SPECIFIEKE WENSEN KLANT:
${project.specificWishes || 'Geen aanvullende wensen opgegeven'}

IMPLEMENTEER:

1. CONTACTFORMULIER
   - Validatie met Zod
   - Submit naar API route
   - Email verzending via Resend
   - Success/error states
   - Rate limiting (5 submissions per 15 min)

2. WHATSAPP BUTTON
   - Floating button rechtsonder
   - Link naar WhatsApp met voorgedefinieerde tekst

3. ANIMATIES
   - Fade-in on scroll voor secties
   - Smooth scroll naar secties
   - Subtiele hover effects

4. PERFORMANCE
   - Lazy loading images
   - Optimized fonts
   - < 2 seconden laadtijd
\`\`\`
`.trim();
  }

  private generateSEOSection(client: ClientData, project: ProjectData): string {
    return `
## STAP 4: SEO CONFIGURATIE

\`\`\`
SEO SETUP:

1. META TAGS
   - Title: "${client.companyName} | ${client.businessType} ${client.industry}"
   - Description: Korte beschrijving voor ${client.targetAudience}
   - Keywords: relevante zoekwoorden voor ${client.industry}

2. OPEN GRAPH
   - og:title, og:description, og:image
   - Twitter cards

3. STRUCTURED DATA
   - LocalBusiness schema
   - Naam: ${client.companyName}
   - Adres: ${client.address || 'In te vullen'}
   - Telefoon: ${client.phone || 'In te vullen'}

4. TECHNISCH
   - Sitemap generatie (src/app/sitemap.ts)
   - Robots.txt
   - Canonical URLs
   - Alt tags op alle images
\`\`\`
`.trim();
  }

  private generateDeploymentSection(client: ClientData, project: ProjectData): string {
    return `
## STAP 5: DEPLOYMENT

\`\`\`
ENVIRONMENT VARIABLES (.env.local):

NEXT_PUBLIC_SITE_URL=https://${project.domain || 'domein-nog-te-bepalen.nl'}
CONTACT_EMAIL=${client.email}
RESEND_API_KEY=[Later invullen]
FROM_EMAIL=noreply@${project.domain || 'domein.nl'}
NEXT_PUBLIC_WHATSAPP_NUMBER=${client.phone?.replace(/\s/g, '') || '+31612345678'}

DEPLOYMENT STAPPEN:
1. GitHub repository aanmaken
2. Vercel project opzetten
3. Environment variables instellen
4. ${project.hasDomain ? 'Bestaand domein koppelen' : 'Domein registreren en koppelen'}
5. SSL verificatie (automatisch via Vercel)
6. Resend email configureren
7. Go-live test
\`\`\`
`.trim();
  }

  private generateChecklist(project: ProjectData): string {
    const template = PROJECT_TEMPLATES[project.type];
    
    return `
## ✅ OPLEVERING CHECKLIST

### Technisch
- [ ] Website werkt lokaal zonder errors
- [ ] \`npm run build\` succesvol
- [ ] Responsive op mobile, tablet, desktop
- [ ] Contactformulier werkt
- [ ] WhatsApp button werkt
- [ ] Alle links werken
- [ ] Laadtijd < 2 seconden

### SEO
- [ ] Unieke title per pagina
- [ ] Meta descriptions aanwezig
- [ ] Open Graph tags werken
- [ ] Structured Data correct
- [ ] Sitemap gegenereerd
- [ ] Robots.txt aanwezig

### Content
- [ ] Alle klant teksten verwerkt
- [ ] Logo correct geplaatst
- [ ] Afbeeldingen geoptimaliseerd
- [ ] Contactgegevens correct
- [ ] Privacy policy pagina aanwezig

### Deployment
- [ ] GitHub repository aangemaakt
- [ ] Vercel project opgezet
- [ ] Environment variables ingesteld
- [ ] Domein gekoppeld
- [ ] SSL actief
- [ ] Email werkend

### Overdracht
- [ ] Overdracht document compleet
- [ ] Handleiding geschreven
- [ ] Klant geïnformeerd over support

---
Geschatte uren: ${template.estimatedHours.min}-${template.estimatedHours.max} uur
Prijs vanaf: €${template.basePrice}
`.trim();
  }

  private combineIntoPrompt(
    client: ClientData,
    project: ProjectData,
    template: typeof PROJECT_TEMPLATES[string],
    sections: GeneratedPrompt['sections']
  ): string {
    const header = `
# 🚀 CURSOR PROMPT: ${template.name.toUpperCase()}

## Project Informatie
- **Klant:** ${client.companyName}
- **Type:** ${template.name}
- **Prijs:** €${project.budget.min} - €${project.budget.max}
- **Deadline:** ${project.timeline}
- **Gegenereerd:** ${new Date().toLocaleDateString('nl-NL')}

---
`;

    return `${header}
${sections.setup}

---

${sections.components}

---

${sections.functionality}

---

${sections.seo}

---

${sections.deployment}

---

${sections.checklist}

---

*Automatisch gegenereerd door RoTech AI Agent System*
*Master Prompt Versie 2.0 | ${new Date().toISOString().split('T')[0]}*
`;
  }

  private async savePromptToDatabase(
    prompt: GeneratedPrompt,
    client: ClientData
  ): Promise<void> {
    try {
      await prisma.agentLog.create({
        data: {
          agentId: 'prompt-generator',
          agentType: 'system',
          level: 'info',
          message: `Generated ${prompt.projectType} prompt for ${client.companyName}`,
          data: JSON.stringify({
            promptId: prompt.id,
            projectType: prompt.projectType,
            estimatedHours: prompt.estimatedHours,
            complexity: prompt.complexity,
          }),
        },
      });
    } catch (error) {
      console.error('Failed to log prompt generation:', error);
    }
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const promptGenerator = new PromptGenerator();

// ============================================
// HELPER FUNCTION FOR QUICK GENERATION
// ============================================

export async function generateCursorPrompt(
  client: ClientData,
  project: ProjectData
): Promise<GeneratedPrompt> {
  return promptGenerator.generatePrompt(client, project);
}
