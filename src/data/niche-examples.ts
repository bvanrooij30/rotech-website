export interface NicheExample {
  id: string;
  niche: string;
  industry: string;
  title: string;
  description: string;
  previewImage: string;
  features: string[];
  results: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  category: "website" | "webshop" | "webapp";
  priceRange: string;
  deliveryTime: string;
}

export const nicheExamples: NicheExample[] = [
  {
    id: "restaurant",
    niche: "Horeca",
    industry: "Restaurant",
    title: "Restaurant Website met Online Reserveren",
    description: "Stijlvolle website die de sfeer van uw restaurant uitstraalt, met online reserveren, menu's en fotogalerij.",
    previewImage: "/images/niches/restaurant-preview.jpg",
    features: [
      "Online reserveringssysteem",
      "Interactief menu met foto's",
      "Fotogalerij van gerechten",
      "Google Maps integratie",
      "Social media integratie",
      "Mobile-first design",
    ],
    results: [
      "70% reserveringen nu online",
      "Minder telefoondruk",
      "Betere tafelplanning",
    ],
    colorScheme: {
      primary: "#8B4513",
      secondary: "#D2691E",
      accent: "#F59E0B",
    },
    category: "website",
    priceRange: "€1.500 - €3.500",
    deliveryTime: "2-4 weken",
  },
  {
    id: "tandarts",
    niche: "Zorg",
    industry: "Tandartspraktijk",
    title: "Tandartspraktijk Website met Online Afspraken",
    description: "Professionele, vertrouwenwekkende website met online afspraken maken en patiënteninformatie.",
    previewImage: "/images/niches/tandarts-preview.jpg",
    features: [
      "Online afspraken systeem",
      "Behandelingen overzicht",
      "Team pagina",
      "FAQ sectie",
      "Lokale SEO optimalisatie",
      "Privacy-compliant",
    ],
    results: [
      "60% afspraken online",
      "Top 3 Google ranking",
      "40% meer nieuwe patiënten",
    ],
    colorScheme: {
      primary: "#0EA5E9",
      secondary: "#38BDF8",
      accent: "#10B981",
    },
    category: "website",
    priceRange: "€2.000 - €4.000",
    deliveryTime: "3-5 weken",
  },
  {
    id: "fysiotherapeut",
    niche: "Zorg",
    industry: "Fysiotherapie",
    title: "Fysiotherapie Praktijk Website",
    description: "Moderne website met behandelmethoden, online intake en praktijkinformatie.",
    previewImage: "/images/niches/fysio-preview.jpg",
    features: [
      "Behandelmethoden overzicht",
      "Online intake formulier",
      "Team & expertise",
      "Locatie & route",
      "Blog voor SEO",
      "Afspraken maken",
    ],
    results: [
      "Meer online boekingen",
      "Betere vindbaarheid",
      "Professionele uitstraling",
    ],
    colorScheme: {
      primary: "#059669",
      secondary: "#10B981",
      accent: "#34D399",
    },
    category: "website",
    priceRange: "€1.800 - €3.500",
    deliveryTime: "2-4 weken",
  },
  {
    id: "fashion-webshop",
    niche: "Retail",
    industry: "Mode & Kleding",
    title: "Fashion Webshop met Lookbook",
    description: "Visueel aantrekkelijke webshop met lookbook feature, filters en naadloze checkout.",
    previewImage: "/images/niches/fashion-preview.jpg",
    features: [
      "Lookbook & outfit styling",
      "Geavanceerde filters",
      "Wishlist functionaliteit",
      "iDEAL & creditcard",
      "Klantaccounts",
      "Product reviews",
    ],
    results: [
      "200% omzetgroei",
      "35% hogere orderwaarde",
      "85% mobiel verkeer",
    ],
    colorScheme: {
      primary: "#EC4899",
      secondary: "#F472B6",
      accent: "#FBBF24",
    },
    category: "webshop",
    priceRange: "€4.500 - €9.995",
    deliveryTime: "4-8 weken",
  },
  {
    id: "advocaat",
    niche: "Professional Services",
    industry: "Advocatenkantoor",
    title: "Advocatenkantoor Website",
    description: "Professionele website met expertise-gebieden, teamprofielen en vertrouwenwekkende uitstraling.",
    previewImage: "/images/niches/advocaat-preview.jpg",
    features: [
      "Expertise-gebieden",
      "Team & profielen",
      "Klantreviews",
      "Blog voor thought leadership",
      "Contactformulier",
      "Privacy & vertrouwen",
    ],
    results: [
      "60% meer verkeer",
      "15 contactaanvragen/maand",
      "Betere first impression",
    ],
    colorScheme: {
      primary: "#1E40AF",
      secondary: "#3B82F6",
      accent: "#F59E0B",
    },
    category: "website",
    priceRange: "€2.500 - €5.000",
    deliveryTime: "3-6 weken",
  },
  {
    id: "fitness",
    niche: "Fitness & Wellness",
    industry: "Sportschool",
    title: "Sportschool Website met Lidmaatschap",
    description: "Energieke website met lidmaatschapsopties, proeflessen boeken en trainerprofielen.",
    previewImage: "/images/niches/fitness-preview.jpg",
    features: [
      "Lidmaatschap pakketten",
      "Online proeflessen boeken",
      "Trainer profielen",
      "Lesrooster",
      "Galerij & sfeer",
      "Contact & locatie",
    ],
    results: [
      "Meer online aanmeldingen",
      "Minder administratie",
      "Betere conversie",
    ],
    colorScheme: {
      primary: "#DC2626",
      secondary: "#EF4444",
      accent: "#F59E0B",
    },
    category: "website",
    priceRange: "€1.800 - €3.500",
    deliveryTime: "2-4 weken",
  },
  {
    id: "makelaar",
    niche: "Real Estate",
    industry: "Makelaardij",
    title: "Makelaar Website met Objecten",
    description: "Professionele website met objecten database, zoekfunctie en waardebepaling tool.",
    previewImage: "/images/niches/makelaar-preview.jpg",
    features: [
      "Objecten database",
      "Geavanceerde zoekfilters",
      "Waardebepaling tool",
      "Team & expertise",
      "Blog & nieuws",
      "Contact & bezichtigingen",
    ],
    results: [
      "Meer kwalitatieve leads",
      "Betere object presentatie",
      "Professionele uitstraling",
    ],
    colorScheme: {
      primary: "#0F172A",
      secondary: "#1E293B",
      accent: "#F59E0B",
    },
    category: "website",
    priceRange: "€2.500 - €5.500",
    deliveryTime: "4-6 weken",
  },
  {
    id: "accountant",
    niche: "Professional Services",
    industry: "Accountancy",
    title: "Accountantskantoor Website",
    description: "Vertrouwenwekkende website met diensten, expertise en klantportaal.",
    previewImage: "/images/niches/accountant-preview.jpg",
    features: [
      "Diensten overzicht",
      "Expertise & specialisaties",
      "Team pagina",
      "Klantportaal (optioneel)",
      "Blog & updates",
      "Contact & intake",
    ],
    results: [
      "Meer kwalitatieve leads",
      "Betere positionering",
      "Professionele uitstraling",
    ],
    colorScheme: {
      primary: "#1E40AF",
      secondary: "#3B82F6",
      accent: "#10B981",
    },
    category: "website",
    priceRange: "€2.000 - €4.500",
    deliveryTime: "3-5 weken",
  },
];

export function getNicheExamplesByCategory(category: NicheExample["category"]): NicheExample[] {
  return nicheExamples.filter((example) => example.category === category);
}

export function getNicheExampleById(id: string): NicheExample | undefined {
  return nicheExamples.find((example) => example.id === id);
}

export function getAllNiches(): string[] {
  return Array.from(new Set(nicheExamples.map((example) => example.niche)));
}
