/**
 * Work Orders Store - Opslaan van werk opdrachten voor sync met Admin Portal.
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "work-orders.json");

export interface WorkOrder {
  id: string;
  orderNumber: string;
  
  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  address: string;
  postalCode: string;
  city: string;
  kvkNumber?: string;
  
  // Package
  packageId: string;
  packageName: string;
  features: {
    id: string;
    name: string;
    quantity: number;
  }[];
  
  // Pricing
  totalAmount: number;
  cancellationFee: number;
  
  // Agreements
  termsAccepted: boolean;
  quoteAccepted: boolean;
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
  signature: string;
  signatureDate: string;
  
  // Status
  status: "new" | "contacted" | "in_progress" | "completed" | "cancelled";
  
  // Sync
  syncedToAdmin: boolean;
  adminFormId?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface OrdersData {
  orders: WorkOrder[];
  lastUpdated: string;
  nextNumber: number;
}

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readOrders(): Promise<OrdersData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { 
      orders: [], 
      lastUpdated: new Date().toISOString(),
      nextNumber: 1
    };
  }
}

async function writeOrders(data: OrdersData): Promise<void> {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateOrderNumber(nextNum: number): string {
  const year = new Date().getFullYear();
  return `OFF-${year}-${String(nextNum).padStart(4, "0")}`;
}

/**
 * Store a new work order
 */
export async function storeWorkOrder(
  order: Omit<WorkOrder, "id" | "orderNumber" | "status" | "syncedToAdmin" | "createdAt" | "updatedAt">
): Promise<WorkOrder> {
  const data = await readOrders();
  
  const orderNumber = generateOrderNumber(data.nextNumber);
  
  const newOrder: WorkOrder = {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    orderNumber,
    status: "new",
    syncedToAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.orders.unshift(newOrder);
  data.nextNumber += 1;
  
  await writeOrders(data);
  
  console.log(`Work order stored: ${orderNumber}`);
  return newOrder;
}

/**
 * Get work orders with optional filters
 */
export async function getWorkOrders(options?: {
  unsynced?: boolean;
  status?: string;
  limit?: number;
}): Promise<WorkOrder[]> {
  const data = await readOrders();
  let orders = data.orders;
  
  if (options?.unsynced) {
    orders = orders.filter(o => !o.syncedToAdmin);
  }
  
  if (options?.status) {
    orders = orders.filter(o => o.status === options.status);
  }
  
  if (options?.limit) {
    orders = orders.slice(0, options.limit);
  }
  
  return orders;
}

/**
 * Mark orders as synced
 */
export async function markOrdersSynced(
  orderIds: string[],
  adminFormIds: Record<string, number>
): Promise<void> {
  const data = await readOrders();
  
  for (const order of data.orders) {
    if (orderIds.includes(order.id)) {
      order.syncedToAdmin = true;
      order.adminFormId = adminFormIds[order.id];
      order.updatedAt = new Date().toISOString();
    }
  }
  
  await writeOrders(data);
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: WorkOrder["status"]
): Promise<void> {
  const data = await readOrders();
  const order = data.orders.find(o => o.id === orderId);
  
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    await writeOrders(data);
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<WorkOrder | null> {
  const data = await readOrders();
  return data.orders.find(o => o.id === orderId || o.orderNumber === orderId) || null;
}
