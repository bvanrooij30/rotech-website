import type { MaintenancePlan } from "@/lib/stripe";

// ============================================
// SELECTEERBARE FEATURES MET PRIJZEN
// Prijzen zijn intern en worden NIET getoond aan klanten
// ============================================

export interface SelectableFeature {
  id: string;
  name: string;
  description: string;
  price: number; // Prijs in euros - NIET tonen aan klant
  category: FeatureCategory;
  isRequired?: boolean; // Verplicht voor dit pakket?
  isIncluded?: boolean; // Standaard inbegrepen (prijs = 0)?
  unit?: string; // bijv. "per pagina", "per taal"
  minQuantity?: number;
  maxQuantity?: number;
  defaultQuantity?: number;
}

export type FeatureCategory = 
  | "design"
  | "development"
  | "seo"
  | "ecommerce"
  | "integration"
  | "content"
  | "advanced"
  | "support";

// Alle beschikbare features met marktconforme prijzen
export const allFeatures: SelectableFeature[] = [
  // === DESIGN & DEVELOPMENT ===
  {
    id: "pages",
    name: "Pagina's",
    description: "Aantal pagina's voor uw website",
    price: 175,
    category: "design",
    unit: "pagina",
    minQuantity: 1,
    maxQuantity: 25,
    defaultQuantity: 1,
  },
  {
    id: "responsive-design",
    name: "Responsive Design",
    description: "Perfect weergave op mobiel, tablet en desktop",
    price: 0, // Altijd inbegrepen
    category: "design",
    isIncluded: true,
    isRequired: true,
  },
  {
    id: "custom-design",
    name: "Maatwerk Design",
    description: "Uniek ontwerp afgestemd op uw huisstijl",
    price: 395,
    category: "design",
  },
  {
    id: "premium-design",
    name: "Premium Design",
    description: "Exclusief premium design met geavanceerde visuele elementen",
    price: 695,
    category: "design",
  },
  {
    id: "animations",
    name: "Geavanceerde Animaties",
    description: "Subtiele animaties en micro-interacties",
    price: 395,
    category: "design",
  },
  {
    id: "ssl-certificate",
    name: "SSL Certificaat (HTTPS)",
    description: "Veilige verbinding voor uw bezoekers",
    price: 0, // Altijd inbegrepen
    category: "development",
    isIncluded: true,
    isRequired: true,
  },
  {
    id: "speed-optimization",
    name: "Snelheidsoptimalisatie",
    description: "Laadtijd onder 2 seconden gegarandeerd",
    price: 145,
    category: "development",
  },
  {
    id: "cms",
    name: "CMS (Content Management)",
    description: "Zelf teksten en afbeeldingen aanpassen",
    price: 395,
    category: "development",
  },
  {
    id: "blog-module",
    name: "Blog/Nieuws Module",
    description: "Publiceer artikelen en nieuws op uw website",
    price: 295,
    category: "content",
  },
  {
    id: "contact-form",
    name: "Contactformulier",
    description: "Contactformulier met e-mail notificatie",
    price: 95,
    category: "development",
  },
  {
    id: "custom-forms",
    name: "Complexe Formulieren",
    description: "Uitgebreide formulieren met validatie",
    price: 195,
    category: "development",
    unit: "formulier",
    minQuantity: 1,
    maxQuantity: 10,
    defaultQuantity: 1,
  },
  
  // === SEO ===
  {
    id: "basic-seo",
    name: "Basis SEO",
    description: "Meta tags, sitemap, robots.txt, basis optimalisatie",
    price: 195,
    category: "seo",
  },
  {
    id: "advanced-seo",
    name: "Geavanceerde SEO",
    description: "Lokale SEO, schema markup, keyword optimalisatie",
    price: 495,
    category: "seo",
  },
  {
    id: "google-analytics",
    name: "Google Analytics & Search Console",
    description: "Volg uw bezoekers en zoekprestaties",
    price: 95,
    category: "seo",
  },
  
  // === E-COMMERCE ===
  {
    id: "webshop-basic",
    name: "Webshop Basis",
    description: "E-commerce functionaliteit tot 25 producten",
    price: 895,
    category: "ecommerce",
  },
  {
    id: "webshop-extended",
    name: "Webshop Uitgebreid",
    description: "Uitbreiding tot 100 producten",
    price: 595,
    category: "ecommerce",
  },
  {
    id: "webshop-unlimited",
    name: "Webshop Onbeperkt",
    description: "Onbeperkt aantal producten",
    price: 995,
    category: "ecommerce",
  },
  {
    id: "payment-ideal",
    name: "iDEAL & Bancontact",
    description: "Betalen via iDEAL en Bancontact",
    price: 195,
    category: "ecommerce",
  },
  {
    id: "payment-creditcard",
    name: "Creditcard Betaling",
    description: "Visa, Mastercard, American Express",
    price: 125,
    category: "ecommerce",
  },
  {
    id: "payment-paypal",
    name: "PayPal Integratie",
    description: "Betalen via PayPal",
    price: 95,
    category: "ecommerce",
  },
  {
    id: "inventory-management",
    name: "Voorraad- & Orderbeheer",
    description: "Beheer voorraad en bestellingen",
    price: 345,
    category: "ecommerce",
  },
  {
    id: "order-emails",
    name: "Automatische Bestelbevestigingen",
    description: "E-mails bij bestelling, verzending, etc.",
    price: 175,
    category: "ecommerce",
  },
  {
    id: "product-filters",
    name: "Productfilters & Zoekfunctie",
    description: "Filter op categorie, prijs, kenmerken",
    price: 245,
    category: "ecommerce",
  },
  
  // === INTEGRATIES ===
  {
    id: "social-media",
    name: "Social Media Integratie",
    description: "Links en feeds van social media",
    price: 125,
    category: "integration",
  },
  {
    id: "newsletter",
    name: "Nieuwsbrief Integratie",
    description: "Mailchimp, ActiveCampaign, etc.",
    price: 195,
    category: "integration",
  },
  {
    id: "accounting",
    name: "Boekhouding Koppeling",
    description: "Koppeling met Exact, Moneybird, e-Boekhouden",
    price: 495,
    category: "integration",
  },
  {
    id: "crm",
    name: "CRM Integratie",
    description: "Koppeling met HubSpot, Salesforce, Pipedrive",
    price: 595,
    category: "integration",
  },
  {
    id: "api-integration",
    name: "API Integratie",
    description: "Koppeling met externe systemen",
    price: 495,
    category: "integration",
    unit: "koppeling",
    minQuantity: 1,
    maxQuantity: 10,
    defaultQuantity: 1,
  },
  {
    id: "booking-system",
    name: "Boekingssysteem",
    description: "Online afspraken maken en beheren",
    price: 695,
    category: "integration",
  },
  
  // === GEAVANCEERD ===
  {
    id: "multilingual",
    name: "Meertaligheid",
    description: "Extra taal voor uw website",
    price: 345,
    category: "advanced",
    unit: "taal",
    minQuantity: 1,
    maxQuantity: 5,
    defaultQuantity: 1,
  },
  {
    id: "user-portal",
    name: "Klantportaal met Login",
    description: "Beveiligde omgeving voor klanten",
    price: 995,
    category: "advanced",
  },
  {
    id: "user-roles",
    name: "Gebruikersbeheer met Rollen",
    description: "Verschillende toegangsniveaus",
    price: 795,
    category: "advanced",
  },
  {
    id: "database-custom",
    name: "Database Architectuur op Maat",
    description: "Custom database structuur",
    price: 995,
    category: "advanced",
  },
  {
    id: "documentation",
    name: "Uitgebreide Documentatie",
    description: "Technische documentatie en handleidingen",
    price: 445,
    category: "advanced",
  },
  
  // === SUPPORT ===
  {
    id: "support-1month",
    name: "1 Maand Gratis Support",
    description: "Ondersteuning na oplevering",
    price: 0,
    category: "support",
    isIncluded: true,
  },
  {
    id: "support-3months",
    name: "3 Maanden Gratis Support",
    description: "Uitgebreide ondersteuning na oplevering",
    price: 295,
    category: "support",
  },
  {
    id: "support-6months",
    name: "6 Maanden Gratis Support",
    description: "Premium ondersteuning na oplevering",
    price: 545,
    category: "support",
  },
  {
    id: "project-manager",
    name: "Persoonlijke Projectmanager",
    description: "Dedicated contactpersoon voor uw project",
    price: 495,
    category: "support",
  },
];

// ============================================
// PAKKET DEFINITIES
// ============================================

export interface PackageDefinition {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  idealFor: string;
  deliveryTime: string;
  // Features die standaard zijn aangevinkt/aanbevolen
  recommendedFeatures: string[];
  // Features die verplicht zijn voor dit pakket
  requiredFeatures: string[];
  // Features die beschikbaar zijn voor dit pakket
  availableFeatures: string[];
  // Populair label
  popular?: boolean;
}

export const packageDefinitions: PackageDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "One-page Website",
    description: "Ideaal voor ZZP'ers, freelancers en starters die professioneel online willen",
    idealFor: "ZZP'ers, coaches, fotografen, consultants",
    deliveryTime: "1-2 weken",
    requiredFeatures: ["responsive-design", "ssl-certificate", "support-1month"],
    recommendedFeatures: ["pages", "contact-form", "basic-seo", "speed-optimization"],
    availableFeatures: [
      "pages", "responsive-design", "custom-design", "ssl-certificate",
      "speed-optimization", "contact-form", "basic-seo", "google-analytics",
      "social-media", "support-1month", "support-3months"
    ],
  },
  {
    id: "business",
    name: "Business",
    subtitle: "Professionele Website",
    description: "Complete bedrijfswebsite die klanten overtuigt en goed vindbaar is",
    idealFor: "MKB, dienstverleners, lokale bedrijven",
    deliveryTime: "2-4 weken",
    popular: true,
    requiredFeatures: ["responsive-design", "ssl-certificate"],
    recommendedFeatures: [
      "pages", "custom-design", "cms", "blog-module", "advanced-seo",
      "google-analytics", "social-media", "contact-form", "speed-optimization",
      "support-3months"
    ],
    availableFeatures: [
      "pages", "responsive-design", "custom-design", "premium-design",
      "animations", "ssl-certificate", "speed-optimization", "cms", "blog-module",
      "contact-form", "custom-forms", "basic-seo", "advanced-seo", "google-analytics",
      "social-media", "newsletter", "multilingual", "support-1month",
      "support-3months", "support-6months"
    ],
  },
  {
    id: "webshop",
    name: "Webshop",
    subtitle: "E-commerce Platform",
    description: "Verkoop online met een professionele webshop die converteert",
    idealFor: "Retailers, merken, productverkoop",
    deliveryTime: "3-5 weken",
    requiredFeatures: ["responsive-design", "ssl-certificate", "webshop-basic"],
    recommendedFeatures: [
      "pages", "custom-design", "cms", "advanced-seo", "payment-ideal",
      "payment-creditcard", "inventory-management", "order-emails",
      "product-filters", "speed-optimization", "support-6months"
    ],
    availableFeatures: [
      "pages", "responsive-design", "custom-design", "premium-design",
      "animations", "ssl-certificate", "speed-optimization", "cms", "blog-module",
      "contact-form", "basic-seo", "advanced-seo", "google-analytics",
      "webshop-basic", "webshop-extended", "webshop-unlimited",
      "payment-ideal", "payment-creditcard", "payment-paypal",
      "inventory-management", "order-emails", "product-filters",
      "social-media", "newsletter", "accounting", "multilingual",
      "support-1month", "support-3months", "support-6months"
    ],
  },
  {
    id: "maatwerk",
    name: "Maatwerk",
    subtitle: "Op Maat Gebouwd",
    description: "Complexe web applicaties, portalen en integraties volledig op maat",
    idealFor: "Scale-ups, SaaS, complexe bedrijfsprocessen",
    deliveryTime: "6-12 weken",
    requiredFeatures: ["responsive-design", "ssl-certificate"],
    recommendedFeatures: [
      "pages", "premium-design", "cms", "advanced-seo", "user-portal",
      "user-roles", "database-custom", "api-integration", "documentation",
      "project-manager", "support-6months"
    ],
    availableFeatures: [
      "pages", "responsive-design", "custom-design", "premium-design",
      "animations", "ssl-certificate", "speed-optimization", "cms", "blog-module",
      "contact-form", "custom-forms", "basic-seo", "advanced-seo", "google-analytics",
      "webshop-basic", "webshop-extended", "webshop-unlimited",
      "payment-ideal", "payment-creditcard", "payment-paypal",
      "inventory-management", "order-emails", "product-filters",
      "social-media", "newsletter", "accounting", "crm", "api-integration",
      "booking-system", "multilingual", "user-portal", "user-roles",
      "database-custom", "documentation", "project-manager",
      "support-1month", "support-3months", "support-6months"
    ],
  },
];

// ============================================
// ANNULERINGSKOSTEN
// ============================================

export interface CancellationTier {
  phase: string;
  description: string;
  percentage: number;
  minimumFee: number;
}

export const cancellationTiers: CancellationTier[] = [
  {
    phase: "before_start",
    description: "Voor start van het project",
    percentage: 10,
    minimumFee: 150,
  },
  {
    phase: "after_design",
    description: "Na goedkeuring van het design",
    percentage: 35,
    minimumFee: 350,
  },
  {
    phase: "during_development",
    description: "Tijdens de ontwikkeling",
    percentage: 50,
    minimumFee: 500,
  },
  {
    phase: "after_concept",
    description: "Na oplevering concept/beta",
    percentage: 75,
    minimumFee: 750,
  },
];

export function calculateCancellationFee(
  totalAmount: number, 
  phase: string
): number {
  const tier = cancellationTiers.find(t => t.phase === phase);
  if (!tier) return 0;
  
  const calculatedFee = totalAmount * (tier.percentage / 100);
  return Math.max(calculatedFee, tier.minimumFee);
}

// ============================================
// MAINTENANCE PLANS
// ============================================

export const maintenancePlans: MaintenancePlan[] = [
  {
    id: "basis",
    name: "Basis",
    price: 99,
    interval: "monthly",
    features: [
      "Maandelijkse updates",
      "Dagelijkse backups",
      "Uptime monitoring",
      "Email support",
    ],
    hoursIncluded: 0,
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    interval: "monthly",
    features: [
      "Alles van Basis",
      "2 uur content wijzigingen",
      "Priority support",
      "Maandelijkse rapportage",
    ],
    hoursIncluded: 2,
  },
  {
    id: "premium",
    name: "Premium",
    price: 399,
    interval: "monthly",
    features: [
      "Alles van Business",
      "5 uur content wijzigingen",
      "SEO optimalisatie",
      "Performance monitoring",
      "Telefoon support",
    ],
    hoursIncluded: 5,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFeatureById(id: string): SelectableFeature | undefined {
  return allFeatures.find(f => f.id === id);
}

export function getPackageById(id: string): PackageDefinition | undefined {
  return packageDefinitions.find(p => p.id === id);
}

export function getMaintenancePlanById(id: string): MaintenancePlan | undefined {
  return maintenancePlans.find(p => p.id === id);
}

export function getFeaturesForPackage(packageId: string): SelectableFeature[] {
  const pkg = getPackageById(packageId);
  if (!pkg) return [];
  
  return pkg.availableFeatures
    .map(id => getFeatureById(id))
    .filter((f): f is SelectableFeature => f !== undefined);
}

export function getFeaturesByCategory(
  features: SelectableFeature[]
): Record<FeatureCategory, SelectableFeature[]> {
  const grouped: Record<FeatureCategory, SelectableFeature[]> = {
    design: [],
    development: [],
    seo: [],
    ecommerce: [],
    integration: [],
    content: [],
    advanced: [],
    support: [],
  };
  
  for (const feature of features) {
    grouped[feature.category].push(feature);
  }
  
  return grouped;
}

export interface SelectedFeature {
  featureId: string;
  quantity: number;
}

export function calculateQuoteTotal(
  selectedFeatures: SelectedFeature[]
): number {
  let total = 0;
  
  for (const selected of selectedFeatures) {
    const feature = getFeatureById(selected.featureId);
    if (feature) {
      total += feature.price * selected.quantity;
    }
  }
  
  return total;
}

// Category display names
export const categoryNames: Record<FeatureCategory, string> = {
  design: "Design & Layout",
  development: "Ontwikkeling",
  seo: "SEO & Vindbaarheid",
  ecommerce: "E-commerce & Betalingen",
  integration: "Integraties",
  content: "Content & Blog",
  advanced: "Geavanceerde Functies",
  support: "Support & Onderhoud",
};

// Calculate yearly price with 10% discount
export function getYearlyPrice(monthlyPrice: number): number {
  const yearlyTotal = monthlyPrice * 12;
  const discount = yearlyTotal * 0.10;
  return Math.round((yearlyTotal - discount) * 100) / 100;
}
