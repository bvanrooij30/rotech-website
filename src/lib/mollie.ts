import createMollieClient, { MollieClient } from "@mollie/api-client";

// Mollie client singleton - lazy initialization
let mollieClientInstance: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (!process.env.MOLLIE_API_KEY) {
    throw new Error("MOLLIE_API_KEY is not configured");
  }
  
  if (!mollieClientInstance) {
    mollieClientInstance = createMollieClient({
      apiKey: process.env.MOLLIE_API_KEY,
    });
  }
  
  return mollieClientInstance;
}

// For backwards compatibility
const mollieClient = {
  get payments() { return getMollieClient().payments; },
  get customers() { return getMollieClient().customers; },
  get customerSubscriptions() { return getMollieClient().customerSubscriptions; },
};

export default mollieClient;

// Payment status types
export type PaymentStatus = 
  | "open"
  | "canceled"
  | "pending"
  | "authorized"
  | "expired"
  | "failed"
  | "paid";

// Subscription status types
export type SubscriptionStatus =
  | "pending"
  | "active"
  | "canceled"
  | "suspended"
  | "completed";

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
