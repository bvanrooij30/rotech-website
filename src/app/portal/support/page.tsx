import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/get-user";
import Link from "next/link";
import {
  MessageCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Filter,
} from "lucide-react";

export const metadata = {
  title: "Support",
};

export default async function SupportPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/portal/login");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tickets: any[] = [];
  try {
    tickets = await prisma.supportTicket.findMany({
      where: { userId },
      include: {
        product: {
          select: { name: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch {}

  const openTickets = tickets.filter(t => t.status !== "closed" && t.status !== "resolved");
  const closedTickets = tickets.filter(t => t.status === "closed" || t.status === "resolved");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-amber-100 text-amber-700";
      case "waiting_customer":
        return "bg-purple-100 text-purple-700";
      case "resolved":
        return "bg-emerald-100 text-emerald-700";
      case "closed":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Open",
      in_progress: "In behandeling",
      waiting_customer: "Wacht op jou",
      resolved: "Opgelost",
      closed: "Gesloten",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "waiting_customer":
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-amber-600";
      default:
        return "text-slate-400";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Vandaag";
    if (days === 1) return "Gisteren";
    if (days < 7) return `${days} dagen geleden`;
    
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Support</h1>
          <p className="text-slate-600">
            Bekijk en beheer je support tickets. We helpen je graag!
          </p>
        </div>
        <Link
          href="/portal/support/nieuw"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" /> Nieuw ticket
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
          <p className="text-sm text-slate-500">Totaal tickets</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{openTickets.length}</p>
          <p className="text-sm text-slate-500">Open</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-amber-600">
            {tickets.filter(t => t.status === "in_progress").length}
          </p>
          <p className="text-sm text-slate-500">In behandeling</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-emerald-600">{closedTickets.length}</p>
          <p className="text-sm text-slate-500">Opgelost</p>
        </div>
      </div>

      {/* Waiting for Customer Action */}
      {tickets.filter(t => t.status === "waiting_customer").length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Actie vereist</p>
              <p className="text-sm text-purple-700">
                Er {tickets.filter(t => t.status === "waiting_customer").length === 1 ? "is" : "zijn"}{" "}
                {tickets.filter(t => t.status === "waiting_customer").length} ticket
                {tickets.filter(t => t.status === "waiting_customer").length !== 1 ? "s" : ""} die wacht
                {tickets.filter(t => t.status === "waiting_customer").length === 1 ? "" : "en"} op jouw reactie.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Open Tickets */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Openstaande tickets</h2>
          <button className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        
        {openTickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {openTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/support/${ticket.id}`}
                className="p-5 flex items-start justify-between hover:bg-slate-50 block"
              >
                <div className="flex items-start gap-4">
                  {getStatusIcon(ticket.status)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-mono">
                        {ticket.ticketNumber}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                      <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === "urgent" && "!!! "}
                        {ticket.priority === "high" && "!! "}
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                    {ticket.product && (
                      <p className="text-sm text-slate-500 mt-1">
                        Product: {ticket.product.name}
                      </p>
                    )}
                    {ticket.messages[0] && (
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                        Laatste reactie: {ticket.messages[0].message.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">{formatDate(ticket.updatedAt)}</span>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
            <p className="text-slate-600">
              Geen openstaande tickets. Alles is opgelost!
            </p>
          </div>
        )}
      </div>

      {/* Closed Tickets */}
      {closedTickets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-900">Opgeloste tickets</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {closedTickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/support/${ticket.id}`}
                className="p-5 flex items-center justify-between hover:bg-slate-50 block"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 font-mono">
                        {ticket.ticketNumber}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {formatDate(ticket.resolvedAt || ticket.updatedAt)}
                </div>
              </Link>
            ))}
          </div>
          {closedTickets.length > 5 && (
            <div className="p-4 border-t border-slate-100 text-center">
              <Link href="/portal/support/archief" className="text-sm text-indigo-600 hover:underline">
                Bekijk alle {closedTickets.length} opgeloste tickets
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {tickets.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Nog geen tickets</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Heb je een vraag of probleem? Maak een support ticket aan en we helpen je zo snel mogelijk.
          </p>
          <Link
            href="/portal/support/nieuw"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" /> Maak je eerste ticket
          </Link>
        </div>
      )}
    </div>
  );
}
