/**
 * Automation Subscription Plans
 * Subscription-based automation services for RoTech Development
 */

export interface AutomationPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number; // 2 months free
  isPopular: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
  support: SupportLevel;
  cta: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

interface PlanFeature {
  text: string;
  included: boolean;
  tooltip?: string;
}

interface PlanLimits {
  maxWorkflows: number | "unlimited";
  maxExecutions: number;
  supportHours: number;
}

interface SupportLevel {
  channels: string[];
  responseTime: string;
  priority: "standard" | "priority" | "dedicated";
}

export const automationPlans: AutomationPlan[] = [
  {
    id: "starter",
    name: "Starter",
    slug: "starter",
    description: "Perfect voor kleine bedrijven die beginnen met automation",
    monthlyPrice: 99,
    yearlyPrice: 990, // 2 maanden gratis
    isPopular: false,
    features: [
      { text: "Tot 3 actieve workflows", included: true },
      { text: "5.000 executions per maand", included: true },
      { text: "Basis error monitoring", included: true },
      { text: "Email support (48u response)", included: true },
      { text: "1 kleine aanpassing per maand", included: true },
      { text: "95% uptime garantie", included: true },
      { text: "Maandelijkse rapportage", included: false },
      { text: "Proactieve monitoring", included: false },
      { text: "Priority fixes", included: false },
      { text: "Telefonische support", included: false },
    ],
    limits: {
      maxWorkflows: 3,
      maxExecutions: 5000,
      supportHours: 1,
    },
    support: {
      channels: ["email"],
      responseTime: "48 uur",
      priority: "standard",
    },
    cta: "Start met Starter",
  },
  {
    id: "business",
    name: "Business",
    slug: "business",
    description: "Ideaal voor groeiende bedrijven met meerdere processen",
    monthlyPrice: 249,
    yearlyPrice: 2490, // 2 maanden gratis
    isPopular: true,
    features: [
      { text: "Tot 10 actieve workflows", included: true },
      { text: "25.000 executions per maand", included: true },
      { text: "Proactieve monitoring + alerts", included: true },
      { text: "Email + Chat support (24u response)", included: true },
      { text: "3 uur werk per maand inbegrepen", included: true },
      { text: "99% uptime garantie", included: true },
      { text: "Maandelijkse rapportage", included: true },
      { text: "Priority bug fixes", included: true },
      { text: "Workflow performance optimalisatie", included: true },
      { text: "Telefonische support", included: false },
    ],
    limits: {
      maxWorkflows: 10,
      maxExecutions: 25000,
      supportHours: 3,
    },
    support: {
      channels: ["email", "chat"],
      responseTime: "24 uur",
      priority: "priority",
    },
    cta: "Kies Business",
  },
  {
    id: "professional",
    name: "Professional",
    slug: "professional",
    description: "Voor bedrijven die zwaar leunen op automation",
    monthlyPrice: 499,
    yearlyPrice: 4990, // 2 maanden gratis
    isPopular: false,
    features: [
      { text: "Onbeperkt actieve workflows", included: true },
      { text: "100.000 executions per maand", included: true },
      { text: "24/7 monitoring + auto-recovery", included: true },
      { text: "Telefoon + Chat support (4u response)", included: true },
      { text: "8 uur werk per maand inbegrepen", included: true },
      { text: "99.5% uptime garantie", included: true },
      { text: "Wekelijkse rapportage", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Kwartaal review meeting", included: true },
      { text: "50% korting op nieuwe workflows", included: true },
    ],
    limits: {
      maxWorkflows: "unlimited",
      maxExecutions: 100000,
      supportHours: 8,
    },
    support: {
      channels: ["email", "chat", "phone"],
      responseTime: "4 uur",
      priority: "dedicated",
    },
    cta: "Kies Professional",
  },
];

// Enterprise plan - contact for pricing
export const enterprisePlan = {
  id: "enterprise",
  name: "Enterprise",
  slug: "enterprise",
  description: "Maatwerk oplossing voor grote organisaties",
  startingPrice: 999,
  features: [
    "Alles van Professional",
    "Dedicated n8n instance",
    "Custom SLA",
    "On-site training",
    "Custom integraties inbegrepen",
    "API development inbegrepen",
    "White-label mogelijkheid",
    "Audit logging",
  ],
  cta: "Neem Contact Op",
};

// One-time automation services (no subscription)
export interface OneTimeService {
  id: string;
  name: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
  };
  deliveryDays: {
    min: number;
    max: number;
  };
  complexity: "low" | "medium" | "high";
  examples: string[];
}

export const oneTimeServices: OneTimeService[] = [
  {
    id: "quick-wins",
    name: "Quick Win Automations",
    description: "Simpele, snelle automations die direct resultaat opleveren",
    priceRange: { min: 150, max: 500 },
    deliveryDays: { min: 1, max: 3 },
    complexity: "low",
    examples: [
      "Lead capture formulier → CRM",
      "Email notificaties naar Slack/Teams",
      "Welkomstmail automatisering",
      "Formulier → Google Sheets",
      "Sociale media scheduler",
      "Automatische betaalherinneringen",
    ],
  },
  {
    id: "business-automation",
    name: "Business Automations",
    description: "Complexere workflows voor bedrijfskritische processen",
    priceRange: { min: 500, max: 1500 },
    deliveryDays: { min: 5, max: 14 },
    complexity: "medium",
    examples: [
      "Order processing pipeline",
      "Content distributie (blog → social)",
      "Klant onboarding flow",
      "Factuur automatisering",
      "Review aggregatie dashboard",
      "AI email categorisatie",
    ],
  },
  {
    id: "advanced-automation",
    name: "Geavanceerde Automations",
    description: "Complexe, multi-system integraties met AI",
    priceRange: { min: 1500, max: 5000 },
    deliveryDays: { min: 14, max: 28 },
    complexity: "high",
    examples: [
      "AI Chatbot backend (WhatsApp/Telegram)",
      "Lead scoring met AI",
      "Multi-platform content publishing",
      "Realtime data sync pipelines",
      "Automatische rapportage dashboards",
      "Faceless content productie",
    ],
  },
];

// Automation categories for filtering
export const automationCategories = [
  {
    id: "lead-generation",
    name: "Lead Generation",
    icon: "Users",
    description: "Leads verzamelen en verwerken",
  },
  {
    id: "sales",
    name: "Sales & CRM",
    icon: "TrendingUp",
    description: "Sales processen stroomlijnen",
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: "Megaphone",
    description: "Content en campagnes automatiseren",
  },
  {
    id: "e-commerce",
    name: "E-commerce",
    icon: "ShoppingCart",
    description: "Orders en voorraad beheren",
  },
  {
    id: "finance",
    name: "Financieel",
    icon: "CreditCard",
    description: "Facturen en betalingen",
  },
  {
    id: "customer-service",
    name: "Klantenservice",
    icon: "MessageCircle",
    description: "Support en tickets afhandelen",
  },
  {
    id: "ai-powered",
    name: "AI-Powered",
    icon: "Brain",
    description: "Slimme AI integraties",
  },
  {
    id: "integrations",
    name: "Integraties",
    icon: "Link2",
    description: "Systemen koppelen",
  },
];

// Helper functions
export function getPlanById(id: string): AutomationPlan | undefined {
  return automationPlans.find((plan) => plan.id === id);
}

export function getServiceByComplexity(
  complexity: "low" | "medium" | "high"
): OneTimeService | undefined {
  return oneTimeServices.find((service) => service.complexity === complexity);
}

export function calculateYearlySavings(plan: AutomationPlan): number {
  const yearlyIfMonthly = plan.monthlyPrice * 12;
  return yearlyIfMonthly - plan.yearlyPrice;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
