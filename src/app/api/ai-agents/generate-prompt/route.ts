import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";

interface ClientInfo {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  currentWebsite?: string;
}

interface ProjectInfo {
  type: string;
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

const projectTypeMap: Record<string, { name: string; template: string }> = {
  starter: { name: "Starter Website", template: "01-STARTER-WEBSITE.md" },
  business: { name: "Business Website", template: "02-BUSINESS-WEBSITE.md" },
  webshop: { name: "Webshop", template: "03-WEBSHOP.md" },
  maatwerk: { name: "Maatwerk Web Applicatie", template: "04-MAATWERK-WEB-APPLICATIE.md" },
  automatisering: { name: "Automatisering (n8n)", template: "05-AUTOMATISERING-N8N.md" },
  pwa: { name: "Progressive Web App", template: "06-PWA-PROGRESSIVE-WEB-APP.md" },
  "api-integratie": { name: "API Integraties", template: "07-API-INTEGRATIES.md" },
  seo: { name: "SEO Optimalisatie", template: "08-SEO-OPTIMALISATIE.md" },
  onderhoud: { name: "Website Onderhoud", template: "09-WEBSITE-ONDERHOUD.md" },
  chatbot: { name: "AI Chatbot", template: "10-AI-CHATBOT.md" },
};

function generatePrompt(client: ClientInfo, project: ProjectInfo): string {
  const projectType = projectTypeMap[project.type] || { name: "Website", template: "" };
  const today = new Date().toISOString().split("T")[0];

  // Content status
  const contentStatus = [];
  if (project.contentProvided.logo) contentStatus.push("Logo: ✓ Aanwezig");
  else contentStatus.push("Logo: ✗ Moet gemaakt worden");
  if (project.contentProvided.texts) contentStatus.push("Teksten: ✓ Aangeleverd");
  else contentStatus.push("Teksten: ✗ AI moet genereren");
  if (project.contentProvided.photos) contentStatus.push("Foto's: ✓ Beschikbaar");
  else contentStatus.push("Foto's: ✗ Stock/AI images nodig");
  if (project.contentProvided.brandColors) contentStatus.push("Huisstijl: ✓ Gedefinieerd");
  else contentStatus.push("Huisstijl: ✗ Ontwerp nodig");

  // Inspiration sites
  const inspirationList = project.inspirationSites.length > 0
    ? project.inspirationSites.map(s => `- ${s.url} (${s.whatLiked})`).join("\n")
    : "- Geen specifieke inspiratie aangegeven";

  // Pages list
  const pagesList = project.pages.length > 0
    ? project.pages.map(p => `- ${p}`).join("\n")
    : "- Homepage\n- Over Ons\n- Diensten\n- Contact";

  const prompt = `# 🚀 ${projectType.name.toUpperCase()} PROJECT - CURSOR PROMPT

---

## 📋 PROJECT INFORMATIE

**Datum:** ${today}
**Type:** ${projectType.name}
**Template:** ${projectType.template}
**Budget:** €${project.budget.min.toLocaleString("nl-NL")} - €${project.budget.max.toLocaleString("nl-NL")}
**Timeline:** ${project.timeline}

---

## 👤 KLANTGEGEVENS

| Veld | Waarde |
|------|--------|
| **Bedrijf** | ${client.companyName} |
| **Contact** | ${client.contactName} |
| **Email** | ${client.email} |
| **Telefoon** | ${client.phone || "Niet opgegeven"} |
| **Type Bedrijf** | ${client.businessType} |
| **Branche** | ${client.industry} |
| **Doelgroep** | ${client.targetAudience} |
| **Huidige Website** | ${client.currentWebsite || "Geen"} |

---

## 🎯 PROJECTDOELEN

${project.goals.map(g => `- ${g}`).join("\n")}

---

## 📄 GEWENSTE PAGINA'S

${pagesList}

---

## ⚡ FEATURES

${project.features.map(f => `- [x] ${f}`).join("\n")}

---

## 📦 CONTENT STATUS

${contentStatus.join("\n")}

---

## 💡 INSPIRATIE

${inspirationList}

---

## 📝 SPECIFIEKE WENSEN

${project.specificWishes || "Geen specifieke wensen opgegeven."}

---

## 🔧 TECHNISCHE REQUIREMENTS

### Stack
- **Framework:** Next.js 15+ (App Router)
- **Taal:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel

### Domain & Hosting
- **Eigen domein:** ${project.hasDomain ? `Ja (${project.domain || "nog te specificeren"})` : "Nee, moet geregistreerd"}
- **Eigen hosting:** ${project.hasHosting ? "Ja" : "Nee, Vercel gebruiken"}

---

## 🏗️ OPDRACHT VOOR CURSOR

Bouw een complete ${projectType.name.toLowerCase()} voor **${client.companyName}** met de volgende specificaties:

### 1. Design & UX
- Moderne, professionele uitstraling passend bij de ${client.industry} branche
- Volledig responsive (mobile-first)
- Snelle laadtijden (Core Web Vitals optimalisatie)
- Toegankelijk (WCAG 2.1 richtlijnen)

### 2. Features te implementeren
${project.features.map(f => `- ${f}`).join("\n")}

### 3. SEO & Performance
- Semantic HTML5
- Meta tags en Open Graph
- Gestructureerde data (JSON-LD)
- Sitemap.xml en robots.txt
- Nederlandse content

### 4. Content
${project.contentProvided.texts 
  ? "- Gebruik de aangeleverde teksten van de klant" 
  : "- Genereer professionele Nederlandse content passend bij het bedrijf"}
${project.contentProvided.photos 
  ? "- Gebruik de aangeleverde foto's" 
  : "- Gebruik placeholder images (Unsplash) passend bij de branche"}
${project.contentProvided.brandColors 
  ? "- Gebruik de bestaande huisstijl kleuren" 
  : "- Ontwikkel een passend kleurenpalet voor de branche"}

### 5. Contactgegevens voor de website
- **Bedrijf:** ${client.companyName}
- **Email:** ${client.email}
- **Telefoon:** ${client.phone || "Moet nog worden opgegeven"}

---

## ⚠️ BELANGRIJK

1. **Taal:** Alle content in het Nederlands
2. **Beelden:** Geen copyrighted images, alleen Unsplash of AI-gegenereerd
3. **Privacy:** GDPR-compliant (cookie consent, privacy policy link)
4. **Performance:** Lighthouse score > 90 op alle metrics
5. **Testing:** Controleer op alle breakpoints (mobile, tablet, desktop)

---

## 📞 BIJ VRAGEN

Neem contact op met de klant:
- **${client.contactName}**
- **${client.email}**
- **${client.phone || "Telefoon niet beschikbaar"}**

---

*Gegenereerd door Ro-Tech Development AI Agent System*
*Template: ${projectType.template}*
`;

  return prompt;
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { client, project } = body as { client: ClientInfo; project: ProjectInfo };

    // Validate required fields
    if (!client.companyName || !client.contactName || !client.email) {
      return NextResponse.json(
        { success: false, error: "Klantgegevens zijn incompleet" },
        { status: 400 }
      );
    }

    if (!project.type) {
      return NextResponse.json(
        { success: false, error: "Project type is verplicht" },
        { status: 400 }
      );
    }

    const prompt = generatePrompt(client, project);

    return NextResponse.json({
      success: true,
      prompt: {
        prompt,
        projectType: project.type,
        client: client.companyName,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Fout bij genereren prompt" },
      { status: 500 }
    );
  }
}
