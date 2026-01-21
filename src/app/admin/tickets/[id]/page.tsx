import { requirePermission, PERMISSIONS, hasPermission } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Shield,
  Mail,
  Package,
  Calendar,
} from "lucide-react";
import AdminTicketReplyForm from "@/components/admin/AdminTicketReplyForm";
import AdminTicketStatusForm from "@/components/admin/AdminTicketStatusForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: { ticketNumber: true, subject: true },
  });
  
  return {
    title: ticket ? `${ticket.ticketNumber} - ${ticket.subject}` : "Ticket",
  };
}

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePermission(PERMISSIONS.TICKETS_READ);
  const { id } = await params;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
        },
      },
      product: { select: { id: true, name: true, domain: true } },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  const canEdit = hasPermission(admin.permissions, PERMISSIONS.TICKETS_WRITE);

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
      waiting_customer: "Wacht op klant",
      resolved: "Opgelost",
      closed: "Gesloten",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "low":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: "Urgent",
      high: "Hoog",
      medium: "Medium",
      low: "Laag",
    };
    return labels[priority] || priority;
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
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/tickets"
            className="p-2 hover:bg-slate-100 rounded-lg mt-1"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <span className="text-sm text-slate-400 font-mono">{ticket.ticketNumber}</span>
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                {getStatusLabel(ticket.status)}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                {getPriorityLabel(ticket.priority)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Messages */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Conversatie</h2>
            
            <div className="space-y-4 mb-6">
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                        {message.senderType === "customer" && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            Klant
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

            {/* Reply Form */}
            {isTicketOpen && canEdit ? (
              <AdminTicketReplyForm 
                ticketId={ticket.id} 
                adminName={admin.name || "Support"} 
              />
            ) : !isTicketOpen ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-600">Dit ticket is gesloten.</p>
              </div>
            ) : null}
          </div>

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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          {canEdit && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Status Wijzigen</h3>
              <AdminTicketStatusForm 
                ticketId={ticket.id} 
                currentStatus={ticket.status}
                currentPriority={ticket.priority}
              />
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Klantgegevens
            </h3>
            <div className="space-y-3">
              <div>
                <Link
                  href={`/admin/users/${ticket.user.id}`}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  {ticket.user.name}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${ticket.user.email}`} className="text-slate-600 hover:underline">
                  {ticket.user.email}
                </a>
              </div>
              {ticket.user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{ticket.user.phone}</span>
                </div>
              )}
              {ticket.user.companyName && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">{ticket.user.companyName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          {ticket.product && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product
              </h3>
              <Link
                href={`/admin/products/${ticket.product.id}`}
                className="font-medium text-indigo-600 hover:underline"
              >
                {ticket.product.name}
              </Link>
              {ticket.product.domain && (
                <p className="text-sm text-slate-500 mt-1">{ticket.product.domain}</p>
              )}
            </div>
          )}

          {/* Ticket Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Aangemaakt</span>
                <span className="text-slate-700">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bijgewerkt</span>
                <span className="text-slate-700">{formatDate(ticket.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Categorie</span>
                <span className="text-slate-700">{ticket.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
