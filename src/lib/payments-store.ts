/**
 * Simple payment store for logging completed payments.
 * Used for syncing with Admin Portal invoicing.
 */

import { promises as fs } from "fs";
import path from "path";

// Store in data directory
const DATA_DIR = path.join(process.cwd(), "data");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

export interface StoredPayment {
  id: string;
  molliePaymentId: string;
  
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  
  // Payment details
  amount: number;
  currency: string;
  description: string;
  paymentType: "deposit" | "final" | "subscription" | "other";
  
  // Package info
  packageId?: string;
  packageName?: string;
  maintenancePlanId?: string;
  maintenancePlanName?: string;
  
  // Status
  status: "paid" | "pending" | "failed" | "refunded";
  paidAt: string; // ISO date
  
  // Sync status
  syncedToAdmin: boolean;
  syncedAt?: string;
  adminInvoiceId?: number;
  
  // Metadata
  createdAt: string;
}

interface PaymentsData {
  payments: StoredPayment[];
  lastUpdated: string;
}

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readPayments(): Promise<PaymentsData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(PAYMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { payments: [], lastUpdated: new Date().toISOString() };
  }
}

async function writePayments(data: PaymentsData): Promise<void> {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(PAYMENTS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Store a new payment after successful Mollie webhook
 */
export async function storePayment(payment: Omit<StoredPayment, "id" | "createdAt" | "syncedToAdmin">): Promise<StoredPayment> {
  const data = await readPayments();
  
  // Check for duplicate
  const existing = data.payments.find(p => p.molliePaymentId === payment.molliePaymentId);
  if (existing) {
    return existing;
  }
  
  const newPayment: StoredPayment = {
    ...payment,
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date().toISOString(),
    syncedToAdmin: false,
  };
  
  data.payments.unshift(newPayment); // Add to front (newest first)
  await writePayments(data);
  
  return newPayment;
}

/**
 * Get all payments, optionally filtered
 */
export async function getPayments(options?: {
  unsynced?: boolean;
  status?: string;
  limit?: number;
}): Promise<StoredPayment[]> {
  const data = await readPayments();
  let payments = data.payments;
  
  if (options?.unsynced) {
    payments = payments.filter(p => !p.syncedToAdmin);
  }
  
  if (options?.status) {
    payments = payments.filter(p => p.status === options.status);
  }
  
  if (options?.limit) {
    payments = payments.slice(0, options.limit);
  }
  
  return payments;
}

/**
 * Mark payments as synced to Admin Portal
 */
export async function markPaymentsSynced(
  paymentIds: string[],
  adminInvoiceIds: Record<string, number>
): Promise<void> {
  const data = await readPayments();
  
  for (const payment of data.payments) {
    if (paymentIds.includes(payment.id)) {
      payment.syncedToAdmin = true;
      payment.syncedAt = new Date().toISOString();
      payment.adminInvoiceId = adminInvoiceIds[payment.id];
    }
  }
  
  await writePayments(data);
}

/**
 * Get a single payment by Mollie ID
 */
export async function getPaymentByMollieId(molliePaymentId: string): Promise<StoredPayment | null> {
  const data = await readPayments();
  return data.payments.find(p => p.molliePaymentId === molliePaymentId) || null;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  molliePaymentId: string,
  status: StoredPayment["status"]
): Promise<void> {
  const data = await readPayments();
  const payment = data.payments.find(p => p.molliePaymentId === molliePaymentId);
  
  if (payment) {
    payment.status = status;
    await writePayments(data);
  }
}
