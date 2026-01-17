import type { Package, MaintenancePlan } from "@/lib/mollie";

// Website/App Packages
export const packages: Package[] = [
  {
    id: "starter",
    name: "Starter Website",
    description: "One-page website ideaal voor ZZP'ers, freelancers en starters",
    basePrice: 997,
    features: [
      "1-3 pagina's",
      "Volledig responsive design",
      "Basis SEO optimalisatie",
      "Contactformulier met e-mail notificatie",
      "Snelle laadtijd (<2 sec)",
      "SSL certificaat (HTTPS)",
    ],
    deliveryTime: "1-2 weken",
    freeSupport: 1,
  },
  {
    id: "business",
    name: "Business Website",
    description: "Professionele bedrijfswebsite die klanten overtuigt en goed vindbaar is",
    basePrice: 2497,
    features: [
      "5-10 pagina's",
      "Premium maatwerk design",
      "CMS - zelf content aanpassen",
      "Geavanceerde SEO (lokaal vindbaar)",
      "Blog/nieuws module",
      "Google Analytics & Search Console",
      "Social media integratie",
    ],
    deliveryTime: "2-4 weken",
    freeSupport: 3,
  },
  {
    id: "webshop",
    name: "Webshop",
    description: "Complete e-commerce oplossing met iDEAL en voorraadbeheer",
    basePrice: 3997,
    features: [
      "Tot 100 producten",
      "iDEAL, creditcard & PayPal",
      "Voorraad- en orderbeheer",
      "Automatische e-mails",
      "Productfilters en zoekfunctie",
      "Koppeling met boekhouding mogelijk",
      "Performance geoptimaliseerd",
    ],
    deliveryTime: "3-5 weken",
    freeSupport: 6,
  },
  {
    id: "maatwerk",
    name: "Maatwerk Web Applicatie",
    description: "Complexe web applicaties, portalen en integraties volledig op maat",
    basePrice: 7500,
    features: [
      "Volledig op specificatie",
      "Custom web applicatie",
      "API integraties (CRM, ERP, etc.)",
      "Gebruikersbeheer met rollen",
      "Database architectuur op maat",
      "Schaalbaar voor groei",
      "Uitgebreide documentatie",
      "Persoonlijke projectmanager",
    ],
    deliveryTime: "6-12 weken",
    freeSupport: 6,
  },
  {
    id: "pwa",
    name: "Progressive Web App",
    description: "Web app die aanvoelt als native app - installeerbaar en offline beschikbaar",
    basePrice: 1500,
    features: [
      "Installeerbaar op telefoon & desktop",
      "Werkt offline",
      "Push notificaties",
      "Snel & responsive",
      "Geen App Store nodig",
      "Automatische updates",
    ],
    deliveryTime: "2-4 weken",
    freeSupport: 3,
  },
  {
    id: "automation",
    name: "Digital Process Automation",
    description: "Automatiseer bedrijfsprocessen met slimme workflows en AI",
    basePrice: 1500,
    features: [
      "Custom workflow ontwerp",
      "500+ app integraties",
      "AI-gedreven automatisering",
      "Triggers & condities",
      "Error handling & monitoring",
      "Training & documentatie",
    ],
    deliveryTime: "1-4 weken",
    freeSupport: 1,
  },
  {
    id: "api",
    name: "API Integraties",
    description: "Verbind uw systemen naadloos met API koppelingen op maat",
    basePrice: 750,
    features: [
      "REST & GraphQL APIs",
      "Webhook integraties",
      "Realtime sync",
      "Error handling & logging",
      "Documentatie",
    ],
    deliveryTime: "1-4 weken",
    freeSupport: 1,
  },
  {
    id: "seo",
    name: "SEO Optimalisatie",
    description: "Hogere rankings in Google door technische en content optimalisatie",
    basePrice: 750,
    features: [
      "Technische SEO audit",
      "Keyword onderzoek",
      "On-page optimalisatie",
      "Content strategie",
      "Maandelijkse rapportages",
    ],
    deliveryTime: "2-4 weken",
    freeSupport: 1,
  },
  {
    id: "chatbot",
    name: "AI Chatbot",
    description: "24/7 klantenservice met een slimme AI chatbot",
    basePrice: 1500,
    features: [
      "AI-gedreven antwoorden",
      "Getraind op uw bedrijfsinfo",
      "Lead capture",
      "Handoff naar mens mogelijk",
      "Analytics dashboard",
    ],
    deliveryTime: "1-3 weken",
    freeSupport: 3,
  },
];

// Maintenance Plans
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

// Common customizations/add-ons
export const customizations = [
  { id: "extra-pages", name: "Extra pagina's", pricePerUnit: 150, unit: "pagina" },
  { id: "multilingual", name: "Meertaligheid (NL/EN)", price: 500 },
  { id: "extra-language", name: "Extra taal", pricePerUnit: 300, unit: "taal" },
  { id: "newsletter", name: "Nieuwsbrief integratie", price: 250 },
  { id: "booking", name: "Boekingssysteem", price: 750 },
  { id: "accounting", name: "Boekhouding koppeling", price: 500 },
  { id: "crm", name: "CRM integratie", price: 750 },
  { id: "analytics-advanced", name: "Geavanceerde analytics", price: 350 },
  { id: "custom-forms", name: "Complexe formulieren", pricePerUnit: 200, unit: "formulier" },
  { id: "video-bg", name: "Video achtergronden", price: 200 },
  { id: "animations", name: "Geavanceerde animaties", price: 400 },
  { id: "user-accounts", name: "Gebruikersaccounts", price: 1000 },
  { id: "payment-integration", name: "Betalingsintegratie", price: 500 },
];

// Helper functions
export function getPackageById(id: string): Package | undefined {
  return packages.find(p => p.id === id);
}

export function getMaintenancePlanById(id: string): MaintenancePlan | undefined {
  return maintenancePlans.find(p => p.id === id);
}

// Calculate yearly price with 10% discount
export function getYearlyPrice(monthlyPrice: number): number {
  const yearlyTotal = monthlyPrice * 12;
  const discount = yearlyTotal * 0.10;
  return Math.round((yearlyTotal - discount) * 100) / 100;
}
