export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  image?: string;
  projectSlug?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "Ro-Tech heeft ons complete B2B platform gebouwd en het resultaat is fenomenaal. De orderverwerking gaat nu 70% sneller en onze klanten zijn enthousiast over het gebruiksgemak.",
    author: "Erik Foolen",
    role: "Eigenaar",
    company: "Action Vloeren",
    rating: 5,
    projectSlug: "action-vloeren",
  },
  {
    id: "2",
    quote: "De webshop die Ro-Tech voor ons heeft gebouwd overtrof al onze verwachtingen. Het design past perfect bij ons merk en de verkopen zijn door het dak gegaan!",
    author: "Lisa Jansen",
    role: "Eigenaar",
    company: "Retro Revival",
    rating: 5,
    projectSlug: "vintage-fashion-webshop",
  },
  {
    id: "3",
    quote: "Professioneel, snel en altijd bereikbaar. Ro-Tech denkt echt mee over wat het beste is voor je bedrijf. De website die ze hebben gemaakt zorgt voor een continue stroom nieuwe patiënten.",
    author: "Dr. M. van der Berg",
    role: "Tandarts",
    company: "Tandartspraktijk Van der Berg",
    rating: 5,
    projectSlug: "moderne-tandarts-praktijk",
  },
  {
    id: "4",
    quote: "Het logistiek dashboard heeft onze operatie getransformeerd. Realtime overzicht, betere routes en tevreden klanten. Ro-Tech begrijpt wat ondernemers nodig hebben.",
    author: "Jan de Vries",
    role: "Directeur",
    company: "TransportPro BV",
    rating: 5,
    projectSlug: "logistiek-dashboard",
  },
  {
    id: "5",
    quote: "Als startup hadden we een beperkt budget maar grote ambities. Ro-Tech heeft een MVP voor ons gebouwd die precies deed wat we nodig hadden, zonder overbodige functies.",
    author: "Thijs Bakker",
    role: "Founder",
    company: "TechStart BV",
    rating: 5,
  },
  {
    id: "6",
    quote: "De automatisering die Ro-Tech voor ons heeft opgezet bespaart ons minimaal 10 uur per week. Leads worden nu automatisch verwerkt en opvolging gaat vanzelf.",
    author: "Sandra Pieters",
    role: "Marketing Manager",
    company: "Groeimeesters",
    rating: 5,
  },
];

export function getTestimonialById(id: string): Testimonial | undefined {
  return testimonials.find((t) => t.id === id);
}

export function getFeaturedTestimonials(count: number = 3): Testimonial[] {
  return testimonials.slice(0, count);
}
