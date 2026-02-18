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
      "Hosting advies & setup",
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
    slug: "progressive-web-app",
    title: "Progressive Web App (PWA)",
    shortTitle: "PWA",
    description: "Web apps die aanvoelen als native apps - installeerbaar, offline beschikbaar, en snel.",
    longDescription: "Een Progressive Web App combineert het beste van websites en apps. Installeerbaar op elk apparaat, werkt offline, en geen App Store nodig. Perfect voor bedrijven die een app-ervaring willen zonder de kosten en complexiteit van native app ontwikkeling.",
    icon: Smartphone,
    features: [
      "Installeerbaar op telefoon & desktop",
      "Werkt offline",
      "Push notificaties (web)",
      "Snel & responsive",
      "Geen App Store nodig",
      "Automatische updates",
      "Lagere ontwikkelkosten",
      "Eén codebase voor alle apparaten",
    ],
    benefits: [
      "App-ervaring zonder app kosten",
      "Direct bereikbaar via URL",
      "Lagere drempel voor gebruikers",
      "Snellere time-to-market",
    ],
    startingPrice: "Op maat",
    deliveryTime: "2-4 weken",
    cta: "PWA Offerte Aanvragen",
    metaTitle: "Progressive Web App (PWA) | App-ervaring Zonder App Store",
    metaDescription: "Laat een Progressive Web App bouwen. ✓ Installeerbaar ✓ Werkt offline ✓ Geen App Store nodig. Vraag een gratis offerte aan!",
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
    startingPrice: "Vanaf €129/maand",
    deliveryTime: "Doorlopend",
    cta: "Onderhoud Offerte Aanvragen",
    metaTitle: "Website Onderhoud | Updates, Beveiliging & Support",
    metaDescription: "Zorgeloos website onderhoud vanaf €129/maand. ✓ Updates ✓ Beveiliging ✓ Backups ✓ Support. Laat uw website optimaal presteren!",
  },
  {
    slug: "automation",
    title: "Automation Services",
    shortTitle: "Automation",
    description: "Automatiseer bedrijfsprocessen en bespaar uren per week met slimme workflows en AI.",
    longDescription: "Stop met repetitieve taken. Laat slimme workflows uw handmatige processen overnemen - 24/7, foutloos, en zonder vakantiedagen. Van leadverwerking tot facturatie, van content distributie tot AI chatbots - alles kan geautomatiseerd worden.",
    icon: Workflow,
    features: [
      "Custom workflow ontwerp",
      "500+ app integraties",
      "AI-gedreven automatisering",
      "Proactieve monitoring",
      "Error handling & auto-recovery",
      "Self-hosted of cloud",
      "Subscription of eenmalig",
      "Training & documentatie",
    ],
    benefits: [
      "5-15 uur per week besparen",
      "Minder menselijke fouten",
      "24/7 automatische uitvoering",
      "Meer focus op kernzaken",
    ],
    startingPrice: "Vanaf €129/maand",
    deliveryTime: "1-4 weken",
    cta: "Gratis Automation Scan",
    metaTitle: "Automation Services | Bedrijfsprocessen Automatiseren",
    metaDescription: "Automatiseer uw bedrijfsprocessen en bespaar uren per week. ✓ Van €129/maand ✓ Monitoring inbegrepen ✓ Gratis scan. Vraag nu aan!",
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
