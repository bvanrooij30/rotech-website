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
    question: "Wat voor soort projecten neemt RoTech aan?",
    answer: "Wij ontwikkelen websites, webshops, web applicaties en mobile apps. Van eenvoudige bedrijfswebsites tot complexe B2B platforms en maatwerk software. Elk project is uniek en krijgt onze volledige aandacht.",
    category: "algemeen",
  },
  {
    id: "3",
    question: "In welke regio zijn jullie actief?",
    answer: "Wij zijn gevestigd in Veldhoven (bij Eindhoven) en werken voor klanten in heel Nederland én België. Onze primaire regio is Noord-Brabant: Veldhoven, Eindhoven, Waalre, Valkenswaard, Best, Son en Breugel. Dankzij online samenwerking kunnen we ook landelijk projecten uitvoeren.",
    category: "algemeen",
  },
  {
    id: "4",
    question: "Kan ik een website laten maken in Veldhoven?",
    answer: "Ja, RoTech Development is uw lokale webdesigner in Veldhoven. Wij bouwen professionele websites, webshops en web applicaties voor ondernemers in Veldhoven, Eindhoven en omgeving. Persoonlijk contact en overleg op locatie is mogelijk.",
    category: "algemeen",
  },
  {
    id: "5",
    question: "Hoe lang bestaat RoTech Development?",
    answer: "RoTech Development (BVR Services) is opgericht door Bart van Rooij, een developer met jarenlange ervaring in web development en software engineering. Onze focus ligt op kwaliteit en persoonlijke aandacht voor elke klant.",
    category: "algemeen",
  },

  // Prijzen
  {
    id: "6",
    question: "Wat kost een website laten maken in Veldhoven?",
    answer: "Bij RoTech Development in Veldhoven start een eenvoudige website vanaf €500. Een professionele bedrijfswebsite kost €1.500 - €5.000, afhankelijk van de gewenste functies. Een webshop begint vanaf €3.500. U bepaalt zelf welke functies u nodig heeft en ziet direct de prijs.",
    category: "prijzen",
  },
  {
    id: "7",
    question: "Wat kost een webshop laten maken?",
    answer: "Een professionele webshop met iDEAL betaling, voorraad- en orderbeheer kost bij ons vanaf €3.500. De exacte prijs hangt af van het aantal producten en gewenste functionaliteit. U krijgt altijd vooraf een duidelijke offerte.",
    category: "prijzen",
  },
  {
    id: "8",
    question: "Moet ik alles vooraf betalen?",
    answer: "Nee, wij werken met een betaling in twee termijnen: 50% bij akkoord op de offerte en 50% bij oplevering. Zo heeft u zekerheid en wij ook. Bij grotere projecten kunnen we een aangepast betalingsschema afspreken.",
    category: "prijzen",
  },
  {
    id: "9",
    question: "Zijn er maandelijkse kosten na oplevering?",
    answer: "Hosting en onderhoud zijn optioneel maar aanbevolen. Onze onderhoudspakketten beginnen vanaf €99/maand en omvatten updates, backups, beveiliging en support. Hosting is het eerste jaar vaak gratis inbegrepen.",
    category: "prijzen",
  },
  {
    id: "10",
    question: "Wat als mijn budget beperkt is?",
    answer: "Wij denken graag mee over een MVP (Minimum Viable Product) aanpak. Begin met de essentiële functies en breid later uit. Zo kunt u starten zonder grote investering en groeien op basis van resultaten.",
    category: "prijzen",
  },

  // Technisch
  {
    id: "11",
    question: "Welke technologieën gebruiken jullie?",
    answer: "Wij werken met moderne technologieën zoals Next.js, React en TypeScript voor snelle, betrouwbare websites. Voor databases gebruiken we PostgreSQL of MongoDB, en voor hosting Vercel. Dit zorgt voor websites die razendsnel laden en goed scoren in Google.",
    category: "technisch",
  },
  {
    id: "12",
    question: "Wordt mijn website mobiel-vriendelijk (responsive)?",
    answer: "Absoluut! Alle websites die wij bouwen zijn 'mobile-first' en werken perfect op smartphones, tablets en desktops. Responsive design is standaard inbegrepen bij elk project.",
    category: "technisch",
  },
  {
    id: "13",
    question: "Is mijn website SEO-geoptimaliseerd voor Google?",
    answer: "Ja, SEO optimalisatie is standaard inbegrepen bij al onze projecten. Dit omvat technische SEO, snelle laadtijden, correcte structuur, metadata en lokale SEO voor vindbaarheid in uw regio (Veldhoven, Eindhoven, Brabant).",
    category: "technisch",
  },
  {
    id: "14",
    question: "Kan ik zelf content aanpassen (CMS)?",
    answer: "Ja, wij leveren waar mogelijk een gebruiksvriendelijk CMS (content management systeem) mee. Hiermee kunt u zelf teksten, afbeeldingen en andere content aanpassen zonder technische kennis.",
    category: "technisch",
  },

  // Proces
  {
    id: "15",
    question: "Hoe verloopt het ontwikkelproces?",
    answer: "Ons proces bestaat uit 5 fases: 1) Kennismaking & offerte, 2) Design & planning, 3) Ontwikkeling met tussentijdse previews, 4) Testing & optimalisatie, 5) Lancering & overdracht. U wordt bij elke fase betrokken.",
    category: "proces",
  },
  {
    id: "16",
    question: "Hoe lang duurt het om een website te bouwen?",
    answer: "Een eenvoudige website is binnen 1-2 weken klaar. Een professionele bedrijfswebsite duurt 2-4 weken, een webshop 4-6 weken. De exacte doorlooptijd hangt af van de complexiteit en uw feedback snelheid.",
    category: "proces",
  },
  {
    id: "17",
    question: "Wat moet ik aanleveren?",
    answer: "Wij hebben nodig: uw logo (bij voorkeur in vector formaat), teksten voor de belangrijkste pagina's, foto's of beeldmateriaal, en toegang tot eventuele bestaande systemen. Wij kunnen ook helpen met teksten en stockfoto's.",
    category: "proces",
  },
  {
    id: "18",
    question: "Bieden jullie website onderhoud aan?",
    answer: "Ja, wij bieden onderhoudspakketten vanaf €99/maand. Dit omvat updates, backups, beveiliging, uptime monitoring en support. Zo blijft uw website altijd veilig en up-to-date.",
    category: "proces",
  },
  {
    id: "19",
    question: "Kan ik langskomen voor een gesprek in Veldhoven?",
    answer: "Ja, persoonlijk overleg is mogelijk op ons kantoor in Veldhoven of bij u op locatie in de regio Eindhoven. Neem contact op om een afspraak te maken.",
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
