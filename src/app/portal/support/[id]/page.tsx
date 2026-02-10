import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/get-user";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Shield,
} from "lucide-react";
import TicketReplyForm from "@/components/portal/TicketReplyForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { ticketNumber: true, subject: true },
    });
    return { title: ticket ? `${ticket.ticketNumber} - ${ticket.subject}` : "Ticket" };
  } catch {
    return { title: "Ticket" };
  }
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/portal/login");

  const { id } = await params;

  let ticket = null;
  try {
    ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch { notFound(); }

  if (!ticket || ticket.userId !== userId) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "waiting_customer":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Open",
      in_progress: "In behandeling",
      waiting_customer: "Wacht op jouw reactie",
      resolved: "Opgelost",
      closed: "Gesloten",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="w-5 h-5" />;
      case "waiting_customer":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case "support":
        return <Shield className="w-5 h-5 text-indigo-600" />;
      case "ai":
        return <Bot className="w-5 h-5 text-purple-600" />;
      case "system":
        return <Clock className="w-5 h-5 text-slate-400" />;
      default:
        return <User className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSenderBg = (senderType: string) => {
    switch (senderType) {
      case "support":
        return "bg-indigo-50 border-indigo-100";
      case "ai":
        return "bg-purple-50 border-purple-100";
      case "system":
        return "bg-slate-50 border-slate-100";
      default:
        return "bg-white border-slate-200";
    }
  };

  const isTicketOpen = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/portal/support"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar overzicht
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-slate-400 font-mono">{ticket.ticketNumber}</span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
            {ticket.product && (
              <p className="text-slate-500 mt-1">Product: {ticket.product.name}</p>
            )}
          </div>
          
          <div className="text-sm text-slate-500">
            <p>Aangemaakt: {formatDate(ticket.createdAt)}</p>
            <p>Laatst bijgewerkt: {formatDate(ticket.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Action Required Banner */}
      {ticket.status === "waiting_customer" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-purple-800">Reactie gevraagd</p>
            <p className="text-sm text-purple-700">
              We wachten op jouw reactie om verder te kunnen helpen.
            </p>
          </div>
        </div>
      )}

      {/* Resolution */}
      {ticket.resolution && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-800">Oplossing</p>
              <p className="text-sm text-emerald-700 whitespace-pre-wrap">{ticket.resolution}</p>
              {ticket.resolvedAt && (
                <p className="text-xs text-emerald-600 mt-2">
                  Opgelost op {formatDate(ticket.resolvedAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900">Conversatie</h2>
        
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl border p-4 ${getSenderBg(message.senderType)}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getSenderIcon(message.senderType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{message.senderName}</span>
                    {message.senderType === "support" && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Support
                      </span>
                    )}
                    {message.senderType === "ai" && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        AI Assistent
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{message.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatDate(message.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      {isTicketOpen ? (
        <TicketReplyForm ticketId={ticket.id} />
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">
            Dit ticket is gesloten. Heb je nog een vraag?
          </p>
          <Link
            href="/portal/support/nieuw"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Maak een nieuw ticket
          </Link>
        </div>
      )}
    </div>
  );
}
