import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Bericht is verplicht" },
        { status: 400 }
      );
    }

    // Find ticket and verify ownership
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket niet gevonden" },
        { status: 404 }
      );
    }

    if (ticket.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Geen toegang tot dit ticket" },
        { status: 403 }
      );
    }

    if (ticket.status === "closed") {
      return NextResponse.json(
        { error: "Dit ticket is gesloten" },
        { status: 400 }
      );
    }

    // Create the message
    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderType: "customer",
        senderName: session.user.name,
        senderId: session.user.id,
        message: message.trim(),
      },
    });

    // Update ticket status if it was waiting for customer
    if (ticket.status === "waiting_customer") {
      await prisma.supportTicket.update({
        where: { id },
        data: {
          status: "open",
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.supportTicket.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    }

    // Sync reply to Admin Portal
    try {
      const adminPortalUrl = process.env.ROTECH_ADMIN_PORTAL_URL;
      const adminApiKey = process.env.ROTECH_ADMIN_API_KEY;
      
      if (adminPortalUrl && adminApiKey && ticket.adminPortalId) {
        await fetch(`${adminPortalUrl}/api/support/tickets/${ticket.adminPortalId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminApiKey}`,
          },
          body: JSON.stringify({
            externalMessageId: newMessage.id,
            senderType: "customer",
            senderName: session.user.name,
            message: message.trim(),
            source: "customer-portal",
          }),
        });
      }
    } catch (syncError) {
      console.error("Failed to sync message to admin portal:", syncError);
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
    });

  } catch (error) {
    console.error("Failed to add reply:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
