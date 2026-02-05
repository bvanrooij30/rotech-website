import Stripe from "stripe";

// Stripe client singleton - lazy initialization
let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY && 
         process.env.STRIPE_SECRET_KEY.startsWith("sk_");
}

// For backwards compatibility
const stripeClient = {
  get checkout() { return getStripeClient(); },
  get customers() { return getStripeClient().customers; },
  get subscriptions() { return getStripeClient().subscriptions; },
  get paymentIntents() { return getStripeClient().paymentIntents; },
  get products() { return getStripeClient().products; },
  get prices() { return getStripeClient().prices; },
  get invoices() { return getStripeClient().invoices; },
  get billingPortal() { return getStripeClient().billingPortal; },
};

export default stripeClient;

// ============================================
// STRIPE PRODUCT IDS - Te vullen na Stripe setup
// ============================================

export const STRIPE_PRODUCTS = {
  // Onderhoudspakketten (subscriptions)
  MAINTENANCE_BASIS: process.env.STRIPE_PRODUCT_MAINTENANCE_BASIS || "",
  MAINTENANCE_BUSINESS: process.env.STRIPE_PRODUCT_MAINTENANCE_BUSINESS || "",
  MAINTENANCE_PREMIUM: process.env.STRIPE_PRODUCT_MAINTENANCE_PREMIUM || "",
  
  // Website pakketten (one-time)
  WEBSITE_STARTER: process.env.STRIPE_PRODUCT_WEBSITE_STARTER || "",
  WEBSITE_BUSINESS: process.env.STRIPE_PRODUCT_WEBSITE_BUSINESS || "",
  WEBSHOP: process.env.STRIPE_PRODUCT_WEBSHOP || "",
  MAATWERK: process.env.STRIPE_PRODUCT_MAATWERK || "",
  
  // Automation subscriptions
  AUTOMATION_STARTER: process.env.STRIPE_PRODUCT_AUTOMATION_STARTER || "",
  AUTOMATION_BUSINESS: process.env.STRIPE_PRODUCT_AUTOMATION_BUSINESS || "",
  AUTOMATION_PROFESSIONAL: process.env.STRIPE_PRODUCT_AUTOMATION_PROFESSIONAL || "",
} as const;

// Automation subscription plans
export const AUTOMATION_PLANS: AutomationPlanConfig[] = [
  {
    id: "starter",
    name: "Automation Starter",
    monthlyPrice: 99,
    yearlyPrice: 990,
    maxWorkflows: 3,
    maxExecutions: 5000,
    supportHours: 1,
  },
  {
    id: "business",
    name: "Automation Business",
    monthlyPrice: 249,
    yearlyPrice: 2490,
    maxWorkflows: 10,
    maxExecutions: 25000,
    supportHours: 3,
  },
  {
    id: "professional",
    name: "Automation Professional",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    maxWorkflows: -1, // unlimited
    maxExecutions: 100000,
    supportHours: 8,
  },
];

export interface AutomationPlanConfig {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxWorkflows: number;
  maxExecutions: number;
  supportHours: number;
}

// Maintenance plan configuration
export const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: "basis",
    name: "Basis Onderhoud",
    price: 99,
    interval: "monthly",
    hoursIncluded: 1,
    features: [
      "1 uur onderhoud per maand",
      "WordPress/Next.js updates",
      "Plugin/package updates",
      "Dagelijkse backups",
      "Uptime monitoring",
      "Security scans",
      "Email support (24u respons)",
    ],
  },
  {
    id: "business",
    name: "Business Onderhoud",
    price: 199,
    interval: "monthly",
    hoursIncluded: 3,
    features: [
      "3 uur onderhoud per maand",
      "Alles uit Basis",
      "Performance optimalisatie",
      "SEO monitoring",
      "Maandelijks rapport",
      "Telefoon support",
      "4 uur responstijd",
    ],
  },
  {
    id: "premium",
    name: "Premium Onderhoud",
    price: 399,
    interval: "monthly",
    hoursIncluded: 8,
    features: [
      "8 uur onderhoud per maand",
      "Alles uit Business",
      "Prioriteit support",
      "2 uur responstijd",
      "A/B testing",
      "Conversie optimalisatie",
      "Dedicated account manager",
      "Quarterly strategy call",
    ],
  },
];

// Website package configuration  
export const WEBSITE_PACKAGES: Package[] = [
  {
    id: "starter",
    name: "Starter Website",
    description: "Perfect voor ZZP'ers en freelancers",
    basePrice: 997,
    deliveryTime: "1-2 weken",
    freeSupport: 1,
    features: [
      "One-page website",
      "Responsive design",
      "Contactformulier",
      "WhatsApp button",
      "SEO basis",
      "SSL certificaat",
    ],
  },
  {
    id: "business",
    name: "Business Website",
    description: "Voor professionele bedrijven",
    basePrice: 2497,
    deliveryTime: "2-4 weken",
    freeSupport: 3,
    features: [
      "Tot 10 pagina's",
      "CMS systeem",
      "Blog functionaliteit",
      "Uitgebreide SEO",
      "Google Analytics",
      "Nieuwsbrief integratie",
    ],
  },
  {
    id: "webshop",
    name: "Webshop",
    description: "Complete e-commerce oplossing",
    basePrice: 3997,
    deliveryTime: "4-6 weken",
    freeSupport: 3,
    features: [
      "Onbeperkt producten",
      "iDEAL / Bancontact",
      "Voorraadbeheer",
      "Order management",
      "Klantaccounts",
      "Email notificaties",
    ],
  },
  {
    id: "maatwerk",
    name: "Maatwerk",
    description: "Custom web applicaties",
    basePrice: 7500,
    deliveryTime: "6-12 weken",
    freeSupport: 6,
    features: [
      "Volledig op maat",
      "API integraties",
      "Dashboard/portal",
      "Gebruikersbeheer",
      "Uitgebreide documentatie",
      "Training inbegrepen",
    ],
  },
];

// Payment status types (mapped from Stripe)
export type PaymentStatus = 
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

// Subscription status types (mapped from Stripe)
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "canceled"
  | "suspended"
  | "completed"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "past_due"
  | "unpaid"
  | "paused";

// Package types
export interface Package {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
  deliveryTime: string;
  freeSupport: number; // months of free support included
}

// Maintenance plan types
export interface MaintenancePlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  hoursIncluded: number;
}

// Quote/Offerte types
export interface Quote {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  
  // Project details
  packageId: string;
  packagePrice: number;
  customizations: string[];
  customizationsCost: number;
  totalProjectCost: number;
  
  // Maintenance
  maintenancePlanId?: string;
  maintenancePrice?: number;
  
  // Payment
  depositAmount: number; // 50% or 30%
  depositPaid: boolean;
  depositPaymentId?: string;
  
  finalAmount: number; // remaining amount
  finalPaid: boolean;
  finalPaymentId?: string;
  
  // Subscription
  subscriptionId?: string;
  subscriptionStartDate?: Date;
  
  // Status
  status: "draft" | "sent" | "accepted" | "deposit_paid" | "in_progress" | "delivered" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

// Helper to calculate deposit
export function calculateDeposit(totalAmount: number, isLargeProject: boolean = false): {
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
} {
  // Large projects (>€7500) use 30-40-30 model
  // Regular projects use 50-50 model
  const depositPercentage = isLargeProject ? 30 : 50;
  const depositAmount = Math.round((totalAmount * depositPercentage) / 100 * 100) / 100;
  const remainingAmount = Math.round((totalAmount - depositAmount) * 100) / 100;
  
  return {
    depositPercentage,
    depositAmount,
    remainingAmount,
  };
}

// Format price for display
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

// Convert amount to Stripe cents format
export function toStripeAmount(amount: number): number {
  return Math.round(amount * 100);
}

// Convert Stripe cents to regular amount
export function fromStripeAmount(cents: number): number {
  return cents / 100;
}
