import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Generate ticket number: RT-2026-001
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RT-${year}-`;
  
  // Find the highest ticket number for this year
  const lastTicket = await prisma.supportTicket.findFirst({
    where: {
      ticketNumber: { startsWith: prefix },
    },
    orderBy: { ticketNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastTicket) {
    const lastNumber = parseInt(lastTicket.ticketNumber.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { subject, description, category, priority, productId } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Onderwerp en beschrijving zijn verplicht" },
        { status: 400 }
      );
    }

    const ticketNumber = await generateTicketNumber();

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: session.user.id,
        subject,
        description,
        category: category || "general",
        priority: priority || "medium",
        productId: productId || null,
        status: "open",
        messages: {
          create: {
            senderType: "customer",
            senderName: session.user.name,
            senderId: session.user.id,
            message: description,
          },
        },
      },
      include: {
        product: { select: { name: true } },
      },
    });

    // Sync to Ro-Tech Admin Portal (webhook call)
    try {
      const adminPortalUrl = process.env.ROTECH_ADMIN_PORTAL_URL;
      const adminApiKey = process.env.ROTECH_ADMIN_API_KEY;
      
      if (adminPortalUrl && adminApiKey) {
        await fetch(`${adminPortalUrl}/api/support/tickets/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminApiKey}`,
          },
          body: JSON.stringify({
            externalId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            customerName: session.user.name,
            customerEmail: session.user.email,
            subject: ticket.subject,
            description: ticket.description,
            category: ticket.category,
            priority: ticket.priority,
            productName: ticket.product?.name,
            source: "customer-portal",
          }),
        });

        // Mark as synced
        await prisma.supportTicket.update({
          where: { id: ticket.id },
          data: { syncedAt: new Date() },
        });
      }
    } catch (syncError) {
      console.error("Failed to sync ticket to admin portal:", syncError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
      },
    });

  } catch (error) {
    console.error("Failed to create ticket:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

// GET - Get user's tickets
export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      include: {
        product: { select: { name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
