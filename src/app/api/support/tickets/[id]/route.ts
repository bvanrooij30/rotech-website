/**
 * API endpoint for individual support ticket operations
 * 
 * GET - Get ticket details
 * PATCH - Update ticket (status, add message, mark synced)
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const TICKETS_FILE = path.join(DATA_DIR, "support-tickets.json");

interface TicketMessage {
  id: string;
  senderType: "customer" | "support" | "ai" | "system";
  senderName: string;
  message: string;
  createdAt: string;
}

async function readTickets() {
  try {
    const data = await fs.readFile(TICKETS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { tickets: [], lastUpdated: new Date().toISOString(), nextNumber: 1 };
  }
}

async function writeTickets(data: any) {
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return false;
  const [type, key] = authHeader.split(" ");
  return type === "Bearer" && key === (process.env.ADMIN_API_KEY || "rotech-admin-secret-key");
}

/**
 * GET /api/support/tickets/[id]
 * Get a single ticket with messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await readTickets();
    const ticket = data.tickets.find((t: any) => 
      t.id === id || t.ticketNumber === id
    );
    
    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      ticket,
    });
    
  } catch (error) {
    console.error("Failed to fetch ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/support/tickets/[id]
 * Update ticket status, add message, mark synced
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await readTickets();
    
    const ticketIndex = data.tickets.findIndex((t: any) => 
      t.id === id || t.ticketNumber === id
    );
    
    if (ticketIndex === -1) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }
    
    const ticket = data.tickets[ticketIndex];
    
    // Update status
    if (body.status) {
      ticket.status = body.status;
    }
    
    // Mark as synced (admin only)
    if (body.syncedToAdmin !== undefined) {
      if (!validateAuth(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      ticket.syncedToAdmin = body.syncedToAdmin;
      ticket.adminTicketId = body.adminTicketId;
    }
    
    // Add message
    if (body.message) {
      if (!ticket.messages) {
        ticket.messages = [];
      }
      
      const newMessage: TicketMessage = {
        id: `msg_${Date.now()}`,
        senderType: body.senderType || "customer",
        senderName: body.senderName || ticket.customerName,
        message: body.message,
        createdAt: new Date().toISOString(),
      };
      
      ticket.messages.push(newMessage);
    }
    
    // Update resolution
    if (body.resolution) {
      ticket.resolution = body.resolution;
      ticket.resolvedAt = new Date().toISOString();
      ticket.resolvedBy = body.resolvedBy || "support";
    }
    
    // Update timestamp
    ticket.updatedAt = new Date().toISOString();
    
    await writeTickets(data);
    
    return NextResponse.json({
      success: true,
      ticket,
    });
    
  } catch (error) {
    console.error("Failed to update ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}
