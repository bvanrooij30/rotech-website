/**
 * API endpoint for Customer Support Tickets
 * 
 * POST - Create a new support ticket (from website)
 * GET - Get tickets for a customer (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Store tickets in data directory (synced to Admin Portal)
const DATA_DIR = path.join(process.cwd(), "data");
const TICKETS_FILE = path.join(DATA_DIR, "support-tickets.json");

export interface WebsiteTicket {
  id: string;
  ticketNumber: string;
  
  // Customer
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName?: string;
  
  // Ticket details
  subject: string;
  description: string;
  category: "bug" | "feature_request" | "question" | "performance" | "security" | "billing" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  
  // Project reference (optional)
  projectUrl?: string;
  
  // Attachments
  attachments?: {
    filename: string;
    url: string;
  }[];
  
  // Status tracking
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  
  // Sync status
  syncedToAdmin: boolean;
  adminTicketId?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

interface TicketsData {
  tickets: WebsiteTicket[];
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

async function readTickets(): Promise<TicketsData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(TICKETS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { 
      tickets: [], 
      lastUpdated: new Date().toISOString(),
      nextNumber: 1
    };
  }
}

async function writeTickets(data: TicketsData): Promise<void> {
  await ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function generateTicketNumber(nextNum: number): string {
  const year = new Date().getFullYear();
  return `TKT-${year}-${String(nextNum).padStart(4, "0")}`;
}

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ["customerName", "customerEmail", "subject", "description"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Read existing tickets
    const data = await readTickets();
    
    // Generate ticket number
    const ticketNumber = generateTicketNumber(data.nextNumber);
    
    // Create ticket
    const ticket: WebsiteTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      ticketNumber,
      customerId: body.customerId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      companyName: body.companyName,
      subject: body.subject,
      description: body.description,
      category: body.category || "other",
      priority: body.priority || "medium",
      projectUrl: body.projectUrl,
      attachments: body.attachments || [],
      status: "open",
      syncedToAdmin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to list and increment counter
    data.tickets.unshift(ticket);
    data.nextNumber += 1;
    
    await writeTickets(data);
    
    console.log(`New support ticket created: ${ticketNumber}`);
    
    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      message: `Ticket ${ticketNumber} is aangemaakt. We nemen zo snel mogelijk contact met u op.`
    });
    
  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/support/tickets
 * Get tickets (for admin sync or customer portal)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const customerEmail = searchParams.get("customerEmail");
  const unsynced = searchParams.get("unsynced") === "true";
  const limit = parseInt(searchParams.get("limit") || "50");
  
  // Simple auth check for admin
  const authHeader = request.headers.get("Authorization");
  const isAdmin = authHeader?.startsWith("Bearer ") && 
    authHeader.split(" ")[1] === (process.env.ADMIN_API_KEY || "rotech-admin-secret-key");
  
  try {
    const data = await readTickets();
    let tickets = data.tickets;
    
    // Filter by customer if not admin
    if (!isAdmin) {
      if (!customerId && !customerEmail) {
        return NextResponse.json(
          { error: "Customer ID or email required" },
          { status: 400 }
        );
      }
      
      tickets = tickets.filter(t => 
        (customerId && t.customerId === customerId) ||
        (customerEmail && t.customerEmail === customerEmail)
      );
    }
    
    // Filter unsynced (for admin)
    if (unsynced && isAdmin) {
      tickets = tickets.filter(t => !t.syncedToAdmin);
    }
    
    // Limit results
    tickets = tickets.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
    
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
