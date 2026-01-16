export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "algemeen" | "prijzen" | "technisch" | "proces";
}

export const faqItems: FAQItem[] = [
  // Algemeen
  {
    id: "1",
    question: "Wat voor soort projecten neemt Ro-Tech aan?",
    answer: "Wij ontwikkelen websites, webshops, web applicaties en mobile apps. Van eenvoudige bedrijfswebsites tot complexe B2B platforms en maatwerk software. Elk project is uniek en krijgt onze volledige aandacht.",
    category: "algemeen",
  },
  {
    id: "2",
    question: "In welke regio zijn jullie actief?",
    answer: "Wij zijn gevestigd in de regio Eindhoven maar werken voor klanten door heel Nederland. Dankzij online communicatietools kunnen we effectief samenwerken, ongeacht uw locatie.",
    category: "algemeen",
  },
  {
    id: "3",
    question: "Hoe lang bestaat Ro-Tech Development?",
    answer: "Ro-Tech Development (BVR Services) is opgericht door Bart van Rooij, een developer met jarenlange ervaring in web development en software engineering. Onze focus ligt op kwaliteit en persoonlijke aandacht voor elke klant.",
    category: "algemeen",
  },

  // Prijzen
  {
    id: "4",
    question: "Wat kost een website laten maken?",
    answer: "De kosten voor een website variëren afhankelijk van de complexiteit en gewenste functionaliteit. Een eenvoudige bedrijfswebsite begint vanaf €1.500, terwijl een webshop start vanaf €3.500. Neem contact op voor een vrijblijvende offerte op maat.",
    category: "prijzen",
  },
  {
    id: "5",
    question: "Moet ik alles vooraf betalen?",
    answer: "Nee, wij werken met een betaling in termijnen: 30% bij start, 40% halverwege en 30% bij oplevering. Bij grotere projecten kunnen we een aangepast betalingsschema afspreken.",
    category: "prijzen",
  },
  {
    id: "6",
    question: "Zijn er maandelijkse kosten na oplevering?",
    answer: "Hosting en onderhoud zijn optioneel maar aanbevolen. Onze onderhoudspakketten beginnen vanaf €99/maand en omvatten updates, backups, beveiliging en support. Hosting is het eerste jaar vaak gratis inbegrepen.",
    category: "prijzen",
  },
  {
    id: "7",
    question: "Wat als mijn budget beperkt is?",
    answer: "Wij denken graag mee over een MVP (Minimum Viable Product) aanpak. Begin met de essentiële functies en breid later uit. Zo kunt u starten zonder grote investering en groeien op basis van resultaten.",
    category: "prijzen",
  },

  // Technisch
  {
    id: "8",
    question: "Welke technologieën gebruiken jullie?",
    answer: "Wij werken primair met Next.js, React en TypeScript voor moderne, snelle websites en applicaties. Voor databases gebruiken we PostgreSQL of MongoDB, en voor hosting Vercel of custom cloud oplossingen.",
    category: "technisch",
  },
  {
    id: "9",
    question: "Wordt mijn website mobiel-vriendelijk?",
    answer: "Absoluut! Alle websites die wij bouwen zijn 'mobile-first' en werken perfect op smartphones, tablets en desktops. Met meer dan 60% van het verkeer via mobiel is dit essentieel.",
    category: "technisch",
  },
  {
    id: "10",
    question: "Hoe zit het met SEO?",
    answer: "SEO optimalisatie is standaard inbegrepen bij al onze projecten. Dit omvat technische SEO, snelle laadtijden, correcte structuur en metadata. Voor uitgebreidere SEO diensten zoals content strategie en linkbuilding bieden wij aparte pakketten.",
    category: "technisch",
  },
  {
    id: "11",
    question: "Kan ik zelf content aanpassen?",
    answer: "Ja, wij leveren waar mogelijk een gebruiksvriendelijk CMS (content management systeem) mee. Hiermee kunt u zelf teksten, afbeeldingen en andere content aanpassen zonder technische kennis.",
    category: "technisch",
  },

  // Proces
  {
    id: "12",
    question: "Hoe verloopt het ontwikkelproces?",
    answer: "Ons proces bestaat uit 5 fases: 1) Kennismaking & offerte, 2) Design & planning, 3) Ontwikkeling met tussentijdse previews, 4) Testing & optimalisatie, 5) Lancering & overdracht. U wordt bij elke fase betrokken.",
    category: "proces",
  },
  {
    id: "13",
    question: "Hoe lang duurt het om een website te bouwen?",
    answer: "Een eenvoudige website duurt gemiddeld 2-4 weken, een webshop 4-8 weken en een web applicatie 8-16 weken. De exacte doorlooptijd hangt af van de complexiteit en uw feedback snelheid.",
    category: "proces",
  },
  {
    id: "14",
    question: "Wat moet ik aanleveren?",
    answer: "Wij hebben nodig: uw logo (bij voorkeur in vector formaat), teksten voor de belangrijkste pagina's, foto's of beeldmateriaal, en toegang tot eventuele bestaande systemen. Wij kunnen ook helpen met teksten en stockfoto's.",
    category: "proces",
  },
  {
    id: "15",
    question: "Bieden jullie support na oplevering?",
    answer: "Ja, na oplevering krijgt u standaard 30 dagen gratis support voor eventuele vragen of kleine aanpassingen. Daarna kunt u kiezen voor een onderhoudsabonnement voor doorlopende ondersteuning.",
    category: "proces",
  },
];

export function getFAQByCategory(category: FAQItem["category"]): FAQItem[] {
  return faqItems.filter((item) => item.category === category);
}

export function getFeaturedFAQ(count: number = 5): FAQItem[] {
  return faqItems.slice(0, count);
}

export const faqCategories = [
  { id: "algemeen", label: "Algemeen" },
  { id: "prijzen", label: "Prijzen & Kosten" },
  { id: "technisch", label: "Technisch" },
  { id: "proces", label: "Proces & Samenwerking" },
] as const;
