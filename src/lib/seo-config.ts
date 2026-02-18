/**
 * SEO & AI Visibility Configuratie
 * 
 * Dit bestand bevat alle SEO instellingen voor de website.
 * Update dit bestand met Cursor om SEO en AI vindbaarheid te optimaliseren.
 * 
 * GEBRUIK:
 * - Vraag Cursor: "Analyseer de SEO config en geef verbeteringen"
 * - Vraag Cursor: "Update de keywords voor dienst X"
 * - Vraag Cursor: "Voeg nieuwe FAQ items toe voor betere AI vindbaarheid"
 */

// =============================================================================
// BEDRIJFSGEGEVENS (gebruikt in structured data)
// =============================================================================

export const businessInfo = {
  name: "RoTech Development",
  legalName: "BVR Services",
  owner: "Bart van Rooij",
  description: "Webdesign bureau in Veldhoven, regio Eindhoven. Wij maken professionele websites, webshops en web applicaties voor MKB en ZZP'ers in Noord-Brabant en heel Nederland.",
  shortDescription: "Website laten maken Veldhoven | Webdesign bureau regio Eindhoven",
  
  // Contact
  email: "contact@ro-techdevelopment.dev",
  phone: "+31 6 57 23 55 74",
  
  // Locatie
  address: {
    street: "Kruisstraat 64",
    postalCode: "5502 JG",
    city: "Veldhoven",
    region: "Noord-Brabant",
    country: "Nederland",
    countryCode: "NL",
  },
  
  // Service area
  serviceArea: {
    primary: ["Veldhoven", "Eindhoven", "Waalre", "Valkenswaard", "Best", "Son en Breugel", "Oirschot"],
    region: ["Noord-Brabant", "Brabant"],
    national: ["Nederland", "België"],
  },
  
  // Juridisch
  kvk: "86858173",
  btw: "NL004321198B83",
  
  // Social & Links
  website: "https://ro-techdevelopment.dev",
  socials: {
    // Voeg toe wanneer beschikbaar
    // linkedin: "https://linkedin.com/company/ro-tech-development",
    // instagram: "https://instagram.com/rotechdevelopment",
  },
  
  // Openingstijden
  openingHours: "Ma-Vr 09:00-18:00",
};

// =============================================================================
// PRIMAIRE KEYWORDS (focus keywords per pagina)
// =============================================================================

export const primaryKeywords = {
  homepage: [
    "website laten maken veldhoven",
    "webdesign veldhoven",
    "website laten maken eindhoven",
    "webshop laten maken brabant", 
    "web development eindhoven",
  ],
  
  diensten: {
    "website-laten-maken": [
      "website laten maken veldhoven",
      "website laten maken eindhoven",
      "professionele website brabant",
      "website op maat",
      "zakelijke website",
    ],
    "webshop-laten-maken": [
      "webshop laten maken veldhoven",
      "webshop laten maken eindhoven",
      "online winkel brabant",
      "e-commerce website",
    ],
    "web-applicatie-ontwikkeling": [
      "web applicatie",
      "maatwerk software",
      "webapp ontwikkeling",
      "custom software",
    ],
    "progressive-web-app": [
      "progressive web app",
      "pwa ontwikkeling",
      "app zonder app store",
    ],
    "seo-optimalisatie": [
      "seo optimalisatie",
      "hoger in google",
      "zoekmachine optimalisatie",
      "vindbaarheid verbeteren",
    ],
    "website-onderhoud": [
      "website onderhoud",
      "website beheer",
      "website updates",
      "technisch onderhoud",
    ],
    "digital-process-automation": [
      "proces automatisering",
      "workflow automatisering",
      "bedrijfsautomatisering",
      "n8n automatisering",
    ],
    "api-integraties": [
      "api integraties",
      "systeem koppelingen",
      "software integratie",
    ],
  },
  
  // Lokale SEO keywords
  lokaal: [
    "veldhoven",
    "eindhoven",
    "noord-brabant",
    "brabant",
    "regio eindhoven",
  ],
};

// =============================================================================
// AI VINDBAARHEID - Vragen die AI systemen stellen
// =============================================================================

/**
 * Deze vragen worden vaak gesteld aan AI assistenten.
 * Zorg dat je website content bevat die deze vragen beantwoordt.
 * 
 * TIP: Vraag Cursor om deze vragen te beantwoorden in je content.
 */
export const aiQuestions = {
  algemeen: [
    "Wie kan een website voor mij maken?",
    "Wat kost een website laten maken?",
    "Hoelang duurt het om een website te bouwen?",
    "Waar kan ik een professionele website laten maken?",
    "Wat is de beste webdeveloper in mijn regio?",
  ],
  
  webshop: [
    "Wat kost een webshop laten maken?",
    "Welk platform is het beste voor een webshop?",
    "Kan ik een webshop laten bouwen met iDEAL?",
    "Hoeveel kost een e-commerce website?",
  ],
  
  lokaal: [
    "Website laten maken Veldhoven",
    "Webdeveloper Eindhoven",
    "Website ontwikkeling Noord-Brabant",
    "Webshop laten maken Brabant",
  ],
  
  technisch: [
    "Wat is een Progressive Web App?",
    "Wat is het verschil tussen een website en een webapp?",
    "Wat is SEO optimalisatie?",
    "Wat is proces automatisering?",
  ],
};

// =============================================================================
// FAQ ITEMS (voor structured data en AI vindbaarheid)
// =============================================================================

/**
 * FAQ items verschijnen in Google als rich snippets en worden vaak geciteerd door AI.
 * Houd deze up-to-date met veelgestelde vragen van klanten.
 */
export const faqItems = {
  pricing: [
    {
      question: "Wat kost een website laten maken?",
      answer: "De prijs van een website hangt af van uw wensen. Bij RoTech Development bepaalt u zelf welke functies u nodig heeft. Een basis website start vanaf een paar honderd euro, terwijl uitgebreide websites met CMS, blog en SEO meer kosten. U ziet altijd vooraf de exacte prijs.",
    },
    {
      question: "Zijn er verborgen kosten?",
      answer: "Nee, bij RoTech Development bent u altijd vooraf op de hoogte van alle kosten. Hosting (vanaf €10/maand) en domeinregistratie (€15-25/jaar) zijn apart, maar worden duidelijk gecommuniceerd.",
    },
    {
      question: "Kan ik in termijnen betalen?",
      answer: "Ja, voor grotere projecten bieden we betalingsregelingen aan. Meestal 50% bij start en 50% bij oplevering, of in meerdere termijnen bij langere projecten.",
    },
  ],
  
  process: [
    {
      question: "Hoelang duurt het om een website te maken?",
      answer: "Een eenvoudige website is binnen 1-2 weken klaar. Een professionele bedrijfswebsite duurt 2-4 weken. Webshops en complexe web applicaties duren 3-12 weken, afhankelijk van de scope.",
    },
    {
      question: "Hoe werkt het proces?",
      answer: "Na uw offerte-aanvraag bespreken we uw wensen. U ontvangt een offerte op maat. Na akkoord starten we met design, gevolgd door ontwikkeling. U ziet tussentijds de voortgang en kunt feedback geven.",
    },
    {
      question: "Kan ik mijn website zelf aanpassen?",
      answer: "Ja, bij het Business pakket en hoger krijgt u een CMS (Content Management System) waarmee u zelf teksten en afbeeldingen kunt aanpassen zonder technische kennis.",
    },
  ],
  
  technical: [
    {
      question: "Is mijn website geschikt voor mobiel?",
      answer: "Absoluut. Alle websites van RoTech Development zijn volledig responsive en werken perfect op smartphones, tablets en desktop computers.",
    },
    {
      question: "Is mijn website beveiligd?",
      answer: "Ja, elke website krijgt een SSL certificaat (HTTPS) voor veilige verbindingen. We volgen security best practices en houden uw website up-to-date.",
    },
    {
      question: "Waar wordt mijn website gehost?",
      answer: "We adviseren hosting via Vercel of een andere betrouwbare provider. U bent eigenaar van uw code en kunt altijd overstappen als u dat wilt.",
    },
  ],
  
  support: [
    {
      question: "Wat als er iets kapot gaat?",
      answer: "Na oplevering krijgt u gratis support (1-6 maanden afhankelijk van pakket). Daarna kunt u kiezen voor een onderhoudsabonnement vanaf €129/maand voor doorlopende support.",
    },
    {
      question: "Bieden jullie website onderhoud aan?",
      answer: "Ja, we hebben drie onderhoudspakketten: Basis (€129/maand), Business (€249/maand) en Premium (€495/maand). Dit omvat updates, backups, monitoring en support.",
    },
  ],
};

// =============================================================================
// LLMS.TXT CONTENT (voor AI assistenten)
// =============================================================================

/**
 * Dit wordt gebruikt om public/llms.txt te genereren.
 * AI assistenten lezen dit bestand om je bedrijf te begrijpen.
 * 
 * TIP: Vraag Cursor om dit te updaten na wijzigingen aan je diensten.
 */
export const llmsContent = {
  summary: `RoTech Development is een web development agency in Veldhoven, Nederland. 
We bouwen professionele websites, webshops en web applicaties voor MKB en ZZP'ers.
Eigenaar: Bart van Rooij (BVR Services).`,

  services: [
    "Website ontwikkeling - Moderne, snelle websites op maat",
    "Webshop ontwikkeling - E-commerce met iDEAL en voorraad beheer", 
    "Web applicatie ontwikkeling - Maatwerk software en portalen",
    "Progressive Web Apps - App-ervaring zonder App Store",
    "SEO optimalisatie - Hoger scoren in Google",
    "Website onderhoud - Updates, beveiliging en support",
    "Proces automatisering - Workflows met n8n en Make",
    "API integraties - Systemen aan elkaar koppelen",
  ],

  usp: [
    "Persoonlijke aanpak - Direct contact met de ontwikkelaar",
    "Transparante prijzen - U bepaalt zelf uw functies en prijs",
    "Moderne technologie - Next.js, TypeScript, Tailwind CSS",
    "Snelle levering - Websites binnen 1-4 weken",
    "Volledige eigendom - U bent eigenaar van de code",
  ],

  contact: `
Email: contact@ro-techdevelopment.dev
Telefoon: +31 6 57 23 55 74
Adres: Kruisstraat 64, 5502 JG Veldhoven
Website: https://ro-techdevelopment.dev
`,
};

// =============================================================================
// SEO CHECKLIST (voor handmatige optimalisatie)
// =============================================================================

/**
 * Gebruik deze checklist met Cursor om SEO te optimaliseren.
 * Vraag: "Loop de SEO checklist door voor pagina X"
 */
export const seoChecklist = {
  perPage: [
    "Meta title bevat primaire keyword (max 60 karakters)",
    "Meta description is overtuigend en bevat keyword (max 155 karakters)",
    "H1 is uniek en bevat primaire keyword",
    "H2-H6 hiërarchie is logisch",
    "Afbeeldingen hebben alt-tekst met keywords",
    "Interne links naar relevante pagina's",
    "URL is kort en bevat keyword",
    "Content is minimaal 300 woorden",
    "FAQ sectie met structured data",
  ],
  
  technical: [
    "Pagina laadt onder 3 seconden",
    "Geen broken links",
    "Sitemap.xml is up-to-date",
    "Robots.txt blokkeert geen belangrijke pagina's",
    "Canonical URLs zijn correct",
    "Structured data is gevalideerd",
  ],
  
  aiVisibility: [
    "llms.txt is up-to-date",
    "FAQ content beantwoordt veelgestelde vragen",
    "Content is in vraag-antwoord formaat waar mogelijk",
    "Bedrijfsnaam wordt consistent gebruikt",
    "Contact informatie is duidelijk vindbaar",
  ],
};

// =============================================================================
// HELPER FUNCTIES
// =============================================================================

/**
 * Genereer meta title met correcte lengte
 */
export function generateMetaTitle(title: string, suffix = "RoTech Development"): string {
  const full = `${title} | ${suffix}`;
  if (full.length > 60) {
    return title.slice(0, 57) + "...";
  }
  return full;
}

/**
 * Genereer meta description met correcte lengte
 */
export function generateMetaDescription(description: string): string {
  if (description.length > 155) {
    return description.slice(0, 152) + "...";
  }
  return description;
}

/**
 * Combineer lokale keywords met dienst keywords
 */
export function getLocalKeywords(dienstSlug: string): string[] {
  const dienstKeywords = primaryKeywords.diensten[dienstSlug as keyof typeof primaryKeywords.diensten] || [];
  return dienstKeywords.flatMap(kw => 
    primaryKeywords.lokaal.map(lokaal => `${kw} ${lokaal}`)
  );
}
