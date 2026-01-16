export interface Project {
  slug: string;
  title: string;
  client: string;
  category: "website" | "webshop" | "webapp" | "mobile";
  categoryLabel: string;
  description: string;
  longDescription: string;
  challenge: string;
  solution: string;
  results: string[];
  technologies: string[];
  image: string;
  images: string[];
  url?: string;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    image?: string;
  };
  featured: boolean;
  completedDate: string;
}

export const projects: Project[] = [
  {
    slug: "action-vloeren",
    title: "Action Vloeren B2B Platform",
    client: "Action Vloeren",
    category: "webapp",
    categoryLabel: "Web Applicatie",
    description: "Complete B2B bestelplatform met orderverwerking, voorraadbeheer en klantportaal.",
    longDescription: "Voor Action Vloeren hebben wij een volledig B2B platform ontwikkeld waarmee hun zakelijke klanten eenvoudig orders kunnen plaatsen. Het systeem bevat geavanceerde functies voor orderverwerking, voorraadbeheer en prijslijsten per klant.",
    challenge: "Action Vloeren had behoefte aan een efficiëntere manier om orders van hun B2B klanten te verwerken. Het bestaande proces via telefoon en email was tijdrovend en foutgevoelig.",
    solution: "Wij hebben een modern B2B platform gebouwd met Next.js en PostgreSQL. Klanten kunnen nu 24/7 orders plaatsen, hun orderhistorie bekijken en facturen downloaden. Het admin panel geeft Action Vloeren volledig inzicht in alle orders en klanten.",
    results: [
      "70% minder tijd besteed aan orderverwerking",
      "Foutpercentage gedaald van 5% naar 0.1%",
      "Klanten bestellen nu 24/7 online",
      "Omzetstijging van 25% in eerste jaar",
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS", "NextAuth.js", "Resend"],
    image: "/images/portfolio/action-vloeren-hero.jpg",
    images: [
      "/images/portfolio/action-vloeren-hero.jpg",
      "/images/portfolio/action-vloeren-dashboard.jpg",
      "/images/portfolio/action-vloeren-orders.jpg",
    ],
    url: "https://actionvloeren.nl",
    testimonial: {
      quote: "Ro-Tech heeft ons hele orderproces getransformeerd. Wat voorheen uren kostte, gaat nu automatisch. De kwaliteit en snelheid waarmee ze werken is indrukwekkend.",
      author: "Erik Foolen",
      role: "Eigenaar, Action Vloeren",
    },
    featured: true,
    completedDate: "2025-12",
  },
  {
    slug: "moderne-tandarts-praktijk",
    title: "Moderne Tandartspraktijk Website",
    client: "Tandartspraktijk Van der Berg",
    category: "website",
    categoryLabel: "Website",
    description: "Professionele website met online afspraken maken en patiënteninformatie.",
    longDescription: "Een moderne, gebruiksvriendelijke website voor een tandartspraktijk met focus op het gemakkelijk maken van afspraken en het informeren van patiënten over behandelingen.",
    challenge: "De praktijk had een verouderde website en patiënten moesten telefonisch afspraken maken, wat leidde tot lange wachttijden en gemiste kansen.",
    solution: "Wij bouwden een moderne website met een online afspraaksysteem, behandelinformatie en een FAQ sectie. De website is volledig geoptimaliseerd voor lokale SEO.",
    results: [
      "60% van afspraken nu online gemaakt",
      "Top 3 positie in Google voor 'tandarts [stad]'",
      "40% meer nieuwe patiënten per maand",
      "Telefoondruk significant verminderd",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Cal.com", "Google Maps API"],
    image: "/images/portfolio/tandarts-hero.jpg",
    images: [
      "/images/portfolio/tandarts-hero.jpg",
      "/images/portfolio/tandarts-afspraken.jpg",
    ],
    featured: true,
    completedDate: "2025-09",
  },
  {
    slug: "vintage-fashion-webshop",
    title: "Vintage Fashion Webshop",
    client: "Retro Revival",
    category: "webshop",
    categoryLabel: "Webshop",
    description: "Stijlvolle webshop voor vintage kleding met unieke filtering en lookbook.",
    longDescription: "Een e-commerce platform voor een vintage kledingwinkel met geavanceerde filteropties, een lookbook feature en naadloze betalingsintegratie.",
    challenge: "Retro Revival verkocht voornamelijk via Instagram en markten, maar wilde hun bereik vergroten met een eigen webshop die hun unieke stijl reflecteert.",
    solution: "Wij creëerden een visueel aantrekkelijke webshop met filters op tijdperk, stijl en maat. De lookbook feature laat complete outfits zien en stimuleert upselling.",
    results: [
      "200% omzetgroei in eerste 6 maanden",
      "Gemiddelde orderwaarde 35% hoger door lookbooks",
      "85% van bezoekers via mobiel",
      "Uitbreiding naar België en Duitsland",
    ],
    technologies: ["Next.js", "TypeScript", "Stripe", "Prisma", "PostgreSQL", "Cloudinary"],
    image: "/images/portfolio/vintage-hero.jpg",
    images: [
      "/images/portfolio/vintage-hero.jpg",
      "/images/portfolio/vintage-products.jpg",
      "/images/portfolio/vintage-lookbook.jpg",
    ],
    url: "https://retrorevival.nl",
    testimonial: {
      quote: "De webshop die Ro-Tech voor ons heeft gebouwd overtrof al onze verwachtingen. Het design past perfect bij ons merk en de verkopen zijn door het dak gegaan!",
      author: "Lisa Jansen",
      role: "Eigenaar, Retro Revival",
    },
    featured: true,
    completedDate: "2025-11",
  },
  {
    slug: "logistiek-dashboard",
    title: "Logistiek Dashboard",
    client: "TransportPro BV",
    category: "webapp",
    categoryLabel: "Web Applicatie",
    description: "Realtime dashboard voor vlootbeheer met route optimalisatie.",
    longDescription: "Een geavanceerd dashboard voor een transportbedrijf dat realtime inzicht geeft in de vloot, routes optimaliseert en rapportages genereert.",
    challenge: "TransportPro had geen centraal overzicht van hun vloot en besteedde veel tijd aan handmatige planning en rapportages.",
    solution: "Wij ontwikkelden een realtime dashboard met GPS tracking, automatische route optimalisatie en uitgebreide rapportagemogelijkheden.",
    results: [
      "15% brandstofbesparing door route optimalisatie",
      "Realtime overzicht van 50+ voertuigen",
      "Rapportages nu in minuten ipv uren",
      "Betere klanttevredenheid door accurate ETA's",
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Socket.io", "Google Maps API", "Chart.js"],
    image: "/images/portfolio/logistiek-hero.jpg",
    images: [
      "/images/portfolio/logistiek-hero.jpg",
      "/images/portfolio/logistiek-map.jpg",
    ],
    featured: false,
    completedDate: "2025-08",
  },
  {
    slug: "loodgieter-website",
    title: "Loodgieter Bedrijfswebsite",
    client: "De Loodgieter",
    category: "website",
    categoryLabel: "Starter Website",
    description: "Compacte, professionele website voor een lokale loodgieter met focus op leads.",
    longDescription: "Een effectieve one-page website voor een loodgietersbedrijf, geoptimaliseerd voor lokale zoekopdrachten en snelle contactmogelijkheden.",
    challenge: "De loodgieter was alleen vindbaar via mond-tot-mondreclame en miste klanten die online zoeken naar loodgieterdiensten.",
    solution: "Wij bouwden een snelle, mobile-first website met prominente contactknoppen, diensten overzicht en lokale SEO optimalisatie.",
    results: [
      "Binnen 2 weken live",
      "Top 5 positie voor 'loodgieter [stad]'",
      "3-5 nieuwe leads per week via website",
      "WhatsApp meest gebruikte contactmethode",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Google Maps API"],
    image: "/images/portfolio/loodgieter-hero.jpg",
    images: [
      "/images/portfolio/loodgieter-hero.jpg",
    ],
    featured: false,
    completedDate: "2025-10",
  },
  {
    slug: "advocatenkantoor-website",
    title: "Advocatenkantoor Website",
    client: "Van Dijk Advocaten",
    category: "website",
    categoryLabel: "Business Website",
    description: "Professionele website met team, expertises en blog voor een advocatenkantoor.",
    longDescription: "Een uitgebreide website voor een advocatenkantoor met focus op vertrouwen, expertise en toegankelijkheid. Inclusief blog voor thought leadership.",
    challenge: "Het kantoor had een verouderde website die geen vertrouwen wekte en slecht scoorde in Google op belangrijke zoektermen.",
    solution: "Wij ontwikkelden een moderne website met duidelijke expertise-pagina's, teamprofielen, klantreviews en een blog voor SEO content.",
    results: [
      "60% meer organisch verkeer na 3 maanden",
      "Blog artikelen ranken voor long-tail keywords",
      "Gemiddeld 15 contactaanvragen per maand",
      "Verbeterde first impression bij potentiële klanten",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "MDX Blog", "Google Analytics"],
    image: "/images/portfolio/advocaat-hero.jpg",
    images: [
      "/images/portfolio/advocaat-hero.jpg",
      "/images/portfolio/advocaat-team.jpg",
    ],
    featured: false,
    completedDate: "2025-07",
  },
  {
    slug: "fitness-webshop",
    title: "Fitness Supplements Webshop",
    client: "PowerFuel",
    category: "webshop",
    categoryLabel: "Webshop",
    description: "Complete webshop voor fitness supplementen met abonnementen en reviews.",
    longDescription: "Een high-performance webshop voor fitness supplementen met abonnementsmogelijkheden, productreviews en geavanceerde filtering.",
    challenge: "PowerFuel verkocht via externe platforms en betaalde hoge commissies. Ze wilden een eigen webshop met abonnementsmogelijkheden.",
    solution: "Wij bouwden een snelle webshop met iDEAL/creditcard betalingen, abonnementsysteem voor vaste klanten en geïntegreerde productreviews.",
    results: [
      "Geen platformcommissies meer (bespaart €500+/maand)",
      "30% van klanten kiest voor abonnement",
      "Gemiddeld 4.7 sterren uit 200+ reviews",
      "Herhaalaankopen verdubbeld door abonnementen",
    ],
    technologies: ["Next.js", "TypeScript", "Stripe Subscriptions", "PostgreSQL", "Prisma", "Cloudinary"],
    image: "/images/portfolio/fitness-hero.jpg",
    images: [
      "/images/portfolio/fitness-hero.jpg",
      "/images/portfolio/fitness-products.jpg",
    ],
    featured: false,
    completedDate: "2025-06",
  },
  {
    slug: "restaurant-website",
    title: "Restaurant Website met Reserveringen",
    client: "Ristorante Milano",
    category: "website",
    categoryLabel: "Business Website",
    description: "Stijlvolle website voor een Italiaans restaurant met online reserveringen.",
    longDescription: "Een sfeervolle website die de authenticiteit van het restaurant uitstraalt, met online reserveren, menu's en fotogalerij.",
    challenge: "Het restaurant miste veel reserveringen omdat mensen alleen telefonisch konden reserveren, vooral 's avonds wanneer het druk was.",
    solution: "Wij creëerden een visueel aantrekkelijke website met een gebruiksvriendelijk reserveringssysteem dat direct synchroniseert met hun planning.",
    results: [
      "70% van reserveringen nu online",
      "Telefoondruk significant afgenomen",
      "Minder no-shows door automatische herinneringen",
      "Betere tafelplanning door inzicht vooraf",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Cal.com", "Framer Motion"],
    image: "/images/portfolio/restaurant-hero.jpg",
    images: [
      "/images/portfolio/restaurant-hero.jpg",
      "/images/portfolio/restaurant-menu.jpg",
    ],
    featured: false,
    completedDate: "2025-05",
  },
  {
    slug: "mobile-fitness-app",
    title: "Fitness Tracking App",
    client: "FitTrack",
    category: "mobile",
    categoryLabel: "Mobile App",
    description: "iOS en Android app voor workout tracking met AI-gestuurde aanbevelingen.",
    longDescription: "Een cross-platform fitness app waarmee gebruikers workouts kunnen tracken, voortgang kunnen monitoren en gepersonaliseerde trainingsschema's ontvangen.",
    challenge: "FitTrack wilde een app die opvalt in de drukke fitness app markt door slimme personalisatie en een gebruiksvriendelijke interface.",
    solution: "Wij ontwikkelden een React Native app met AI-gestuurde aanbevelingen, sociale features en Apple Health/Google Fit integratie.",
    results: [
      "4.8 sterren in App Store en Play Store",
      "15.000+ downloads in eerste 3 maanden",
      "Gebruikers trainen 40% vaker met de app",
      "Premium conversie van 12%",
    ],
    technologies: ["React Native", "TypeScript", "Node.js", "PostgreSQL", "OpenAI API", "Firebase"],
    image: "/images/portfolio/fitapp-hero.jpg",
    images: [
      "/images/portfolio/fitapp-hero.jpg",
      "/images/portfolio/fitapp-screens.jpg",
    ],
    featured: false,
    completedDate: "2025-04",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((project) => project.slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function getProjectsByCategory(category: Project["category"]): Project[] {
  return projects.filter((project) => project.category === category);
}
