import { 
  Globe, 
  ShoppingCart, 
  Layers, 
  Smartphone, 
  Search, 
  Settings, 
  Workflow, 
  Link2,
  type LucideIcon 
} from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  features: string[];
  benefits: string[];
  startingPrice: string;
  deliveryTime: string;
  cta: string;
  metaTitle: string;
  metaDescription: string;
}

export const services: Service[] = [
  {
    slug: "website-laten-maken",
    title: "Website Laten Maken",
    shortTitle: "Websites",
    description: "Professionele, moderne websites die uw bedrijf perfect presenteren en bezoekers omzetten in klanten.",
    longDescription: "Een professionele website is het visitekaartje van uw bedrijf. Wij bouwen moderne, snelle en SEO-geoptimaliseerde websites die niet alleen mooi zijn, maar ook resultaat opleveren. Van eenvoudige bedrijfswebsites tot complexe platforms - wij leveren maatwerk dat past bij uw doelen.",
    icon: Globe,
    features: [
      "Responsive design (mobiel-vriendelijk)",
      "SEO geoptimaliseerd",
      "Snel laadtijd (< 2 seconden)",
      "Contactformulier",
      "Google Analytics integratie",
      "SSL certificaat (HTTPS)",
      "CMS voor zelf aanpassen",
      "1 jaar gratis hosting",
    ],
    benefits: [
      "Meer online zichtbaarheid",
      "Professionele uitstraling",
      "24/7 bereikbaar voor klanten",
      "Hogere conversie",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Snelle levering",
    cta: "Website Offerte Aanvragen",
    metaTitle: "Website Laten Maken | Professionele Websites op Maat",
    metaDescription: "Laat een professionele website maken door RoTech Development. ✓ Modern design ✓ SEO geoptimaliseerd ✓ Snel & responsive. Vraag een gratis offerte aan!",
  },
  {
    slug: "webshop-laten-maken",
    title: "Webshop Laten Maken",
    shortTitle: "Webshops",
    description: "Complete webshops met iDEAL, voorraad- en orderbeheer. Start direct met online verkopen.",
    longDescription: "Een professionele webshop is essentieel voor online succes. Wij bouwen complete e-commerce oplossingen met alle functionaliteit die u nodig heeft: van productbeheer tot betalingen en verzending. Onze webshops zijn geoptimaliseerd voor conversie en gebruiksgemak.",
    icon: ShoppingCart,
    features: [
      "iDEAL & creditcard betalingen",
      "Voorraadbeheer",
      "Orderbeheer systeem",
      "Automatische facturen",
      "Verzendlabel integratie",
      "Productfilters & zoeken",
      "Klantaccounts",
      "Kortingscodes",
    ],
    benefits: [
      "Direct online verkopen",
      "Automatische orderverwerking",
      "Lagere operationele kosten",
      "Schaalbaar platform",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Snelle levering",
    cta: "Webshop Offerte Aanvragen",
    metaTitle: "Webshop Laten Maken | Professionele E-commerce Oplossingen",
    metaDescription: "Laat een professionele webshop maken met iDEAL betaling. ✓ Voorraadbeheer ✓ Ordersysteem ✓ Schaalbaar. Vraag een gratis offerte aan!",
  },
  {
    slug: "web-applicatie-ontwikkeling",
    title: "Web Applicatie Ontwikkeling",
    shortTitle: "Web Apps",
    description: "Maatwerk web applicaties voor complexe bedrijfsprocessen. Van CRM tot portalen.",
    longDescription: "Wanneer standaard software niet voldoet, bouwen wij maatwerk web applicaties die perfect aansluiten bij uw bedrijfsprocessen. Van klantportalen en dashboards tot complete bedrijfsapplicaties - wij ontwikkelen schaalbare oplossingen met de nieuwste technologieën.",
    icon: Layers,
    features: [
      "Gebruikersauthenticatie & rollen",
      "Database ontwerp & beheer",
      "API integraties",
      "Realtime functionaliteit",
      "Dashboard & rapportages",
      "Mobiel-vriendelijk",
      "Cloud hosting",
      "Schaalbare architectuur",
    ],
    benefits: [
      "Processen automatiseren",
      "Tijd besparen",
      "Data-gedreven beslissingen",
      "Concurrentievoordeel",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Projectafhankelijk",
    cta: "Web App Offerte Aanvragen",
    metaTitle: "Web Applicatie Ontwikkeling | Maatwerk Software",
    metaDescription: "Maatwerk web applicaties laten ontwikkelen? RoTech bouwt schaalbare oplossingen voor uw bedrijf. ✓ Portalen ✓ Dashboards ✓ CRM. Vraag offerte aan!",
  },
  {
    slug: "mobile-app-ontwikkeling",
    title: "Mobile App Ontwikkeling",
    shortTitle: "Mobile Apps",
    description: "Native en cross-platform apps voor iOS en Android die uw klanten geweldig vinden.",
    longDescription: "Bereik uw klanten via een professionele mobiele app. Wij ontwikkelen zowel native als cross-platform apps die naadloos werken op iOS en Android. Van concept tot publicatie in de App Store en Google Play - wij begeleiden u door het hele proces.",
    icon: Smartphone,
    features: [
      "iOS & Android support",
      "Cross-platform ontwikkeling",
      "Push notificaties",
      "Offline functionaliteit",
      "App Store publicatie",
      "Gebruikersanalytics",
      "In-app betalingen",
      "Backend integratie",
    ],
    benefits: [
      "Direct contact met klanten",
      "Hogere klantloyaliteit",
      "Nieuwe inkomstenstromen",
      "Moderne uitstraling",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Projectafhankelijk",
    cta: "App Offerte Aanvragen",
    metaTitle: "Mobile App Ontwikkeling | iOS & Android Apps",
    metaDescription: "Laat een professionele mobile app ontwikkelen voor iOS en Android. ✓ Native kwaliteit ✓ Cross-platform ✓ App Store publicatie. Vraag offerte aan!",
  },
  {
    slug: "seo-optimalisatie",
    title: "SEO Optimalisatie",
    shortTitle: "SEO",
    description: "Hogere rankings in Google door technische en content optimalisatie.",
    longDescription: "Word beter gevonden in Google met professionele SEO optimalisatie. Wij analyseren uw website, verbeteren technische aspecten, optimaliseren content en bouwen aan uw online autoriteit. Het resultaat: meer organisch verkeer en hogere conversies.",
    icon: Search,
    features: [
      "Technische SEO audit",
      "Keyword onderzoek",
      "On-page optimalisatie",
      "Content strategie",
      "Linkbuilding",
      "Lokale SEO",
      "Performance optimalisatie",
      "Maandelijkse rapportages",
    ],
    benefits: [
      "Meer organisch verkeer",
      "Hogere Google rankings",
      "Betere ROI dan advertenties",
      "Langdurige resultaten",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Doorlopend",
    cta: "SEO Offerte Aanvragen",
    metaTitle: "SEO Optimalisatie | Hoger in Google Scoren",
    metaDescription: "Verbeter uw Google rankings met professionele SEO. ✓ Technische optimalisatie ✓ Content strategie ✓ Linkbuilding. Vraag een gratis SEO scan aan!",
  },
  {
    slug: "website-onderhoud",
    title: "Website Onderhoud",
    shortTitle: "Onderhoud",
    description: "Zorgeloos online met maandelijks onderhoud, updates en support.",
    longDescription: "Houd uw website veilig, snel en up-to-date met ons onderhoudsabonnement. Wij zorgen voor regelmatige updates, beveiligingspatches, backups en monitoring. Zo kunt u zich focussen op uw bedrijf terwijl wij zorgen voor uw online aanwezigheid.",
    icon: Settings,
    features: [
      "Maandelijkse updates",
      "Beveiligingsmonitoring",
      "Dagelijkse backups",
      "Uptime monitoring",
      "Performance optimalisatie",
      "Content wijzigingen",
      "Priority support",
      "Kwartaalrapportages",
    ],
    benefits: [
      "Altijd up-to-date",
      "Maximale beveiliging",
      "Snelle laadtijden",
      "Gemoedsrust",
    ],
    startingPrice: "Vanaf €99/maand",
    deliveryTime: "Doorlopend",
    cta: "Onderhoud Offerte Aanvragen",
    metaTitle: "Website Onderhoud | Updates, Beveiliging & Support",
    metaDescription: "Zorgeloos website onderhoud vanaf €99/maand. ✓ Updates ✓ Beveiliging ✓ Backups ✓ Support. Laat uw website optimaal presteren!",
  },
  {
    slug: "digital-process-automation",
    title: "Digital Process Automation",
    shortTitle: "Automatisering",
    description: "Automatiseer bedrijfsprocessen en bespaar tijd met slimme workflows en AI.",
    longDescription: "Bespaar uren per week door repetitieve taken te automatiseren. Wij bouwen krachtige workflows die uw systemen verbinden en processen stroomlijnen. Van leadverwerking tot facturatie, van email marketing tot klantenservice - alles kan geautomatiseerd worden met n8n, Make.com en AI.",
    icon: Workflow,
    features: [
      "Custom workflow ontwerp",
      "500+ app integraties",
      "AI-gedreven automatisering",
      "Triggers & condities",
      "Error handling & monitoring",
      "Self-hosted of cloud",
      "n8n, Make.com, Zapier",
      "Training & documentatie",
    ],
    benefits: [
      "Uren per week besparen",
      "Minder menselijke fouten",
      "Snellere processen",
      "Meer focus op kernzaken",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Snelle levering",
    cta: "Automatisering Offerte Aanvragen",
    metaTitle: "Digital Process Automation | Workflow Automatisering",
    metaDescription: "Automatiseer uw bedrijfsprocessen met slimme workflows. ✓ 500+ app integraties ✓ AI-gedreven ✓ Tijd besparen. Vraag een gratis adviesgesprek aan!",
  },
  {
    slug: "api-integraties",
    title: "API Integraties",
    shortTitle: "Integraties",
    description: "Verbind uw systemen naadloos met API koppelingen op maat.",
    longDescription: "Laat uw verschillende systemen met elkaar communiceren door slimme API integraties. Van boekhoudpakketten tot CRM systemen, van webshops tot ERP - wij bouwen de koppelingen die uw bedrijf nodig heeft om efficiënt te werken.",
    icon: Link2,
    features: [
      "REST & GraphQL APIs",
      "Webhook integraties",
      "Realtime sync",
      "Error handling & logging",
      "Rate limiting",
      "Documentatie",
      "OAuth & API keys",
      "Monitoring & alerts",
    ],
    benefits: [
      "Systemen verbinden",
      "Data centraliseren",
      "Handmatig werk elimineren",
      "Betere inzichten",
    ],
    startingPrice: "Op maat",
    deliveryTime: "Snelle levering",
    cta: "Integratie Offerte Aanvragen",
    metaTitle: "API Integraties | Systemen Koppelen",
    metaDescription: "Verbind uw systemen met professionele API integraties. ✓ Boekhoud koppelingen ✓ CRM integratie ✓ Custom APIs. Vraag offerte aan!",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export function getAllServiceSlugs(): string[] {
  return services.map((service) => service.slug);
}
