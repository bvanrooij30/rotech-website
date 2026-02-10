import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/get-user";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Package,
  ExternalLink,
  Calendar,
  Shield,
  Server,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
  Plus,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true },
    });
    return { title: product ? product.name : "Product" };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/portal/login");

  const { id } = await params;

  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: "desc" },
        },
        statusUpdates: {
          orderBy: { createdAt: "desc" },
          where: { isPublic: true },
          take: 10,
        },
        supportTickets: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });
  } catch { notFound(); }

  if (!product || product.userId !== userId) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "development":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "archived":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Actief",
      development: "In ontwikkeling",
      maintenance: "Onderhoud",
      archived: "Gearchiveerd",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      website: "Website",
      webshop: "Webshop",
      webapp: "Web Applicatie",
      api: "API / Integratie",
    };
    return labels[type] || type;
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-amber-100 text-amber-700";
      case "resolved":
        return "bg-emerald-100 text-emerald-700";
      case "closed":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeSubscription = product.subscriptions.find((s) => s.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/portal/producten"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar producten
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              {product.type === "website" || product.type === "webshop" ? (
                <Globe className="w-8 h-8 text-indigo-600" />
              ) : (
                <Package className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(product.status)}`}>
                  {getStatusLabel(product.status)}
                </span>
              </div>
              <p className="text-slate-500 mb-2">{getTypeLabel(product.type)}</p>
              {product.domain && (
                <a
                  href={`https://${product.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  {product.domain}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Launch Date */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Live sinds</p>
              <p className="font-semibold text-slate-900">
                {product.launchDate ? formatDate(product.launchDate) : "In ontwikkeling"}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeSubscription ? "bg-emerald-100" : "bg-slate-100"}`}>
              <Shield className={`w-5 h-5 ${activeSubscription ? "text-emerald-600" : "text-slate-400"}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Onderhoud</p>
              <p className={`font-semibold ${activeSubscription ? "text-emerald-600" : "text-slate-500"}`}>
                {activeSubscription ? "Actief" : "Niet actief"}
              </p>
            </div>
          </div>
        </div>

        {/* Hosting */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Hosting</p>
              <p className="font-semibold text-slate-900">
                {product.hostingProvider || "Niet opgegeven"}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Laatste update</p>
              <p className="font-semibold text-slate-900">
                {formatDate(product.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Beschrijving
          </h2>
          <p className="text-slate-600 whitespace-pre-wrap">{product.description}</p>
        </div>
      )}

      {/* Status Updates */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recente Updates
        </h2>
        
        {product.statusUpdates.length > 0 ? (
          <div className="space-y-4">
            {product.statusUpdates.map((update) => (
              <div key={update.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  {update.type === "update" ? (
                    <Plus className="w-5 h-5 text-indigo-600" />
                  ) : update.type === "resolved" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : update.type === "maintenance" ? (
                    <Settings className="w-5 h-5 text-amber-600" />
                  ) : update.type === "issue" ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Activity className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{update.title}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {update.type}
                    </span>
                  </div>
                  {update.message && (
                    <p className="text-sm text-slate-600">{update.message}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(update.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">Geen recente updates</p>
        )}
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Support Tickets
          </h2>
          <Link
            href="/portal/support/nieuw"
            className="text-sm text-indigo-600 hover:underline"
          >
            Nieuw ticket
          </Link>
        </div>
        
        {product.supportTickets.length > 0 ? (
          <div className="space-y-3">
            {product.supportTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/support/${ticket.id}`}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div>
                  <span className="text-sm text-slate-400 font-mono">{ticket.ticketNumber}</span>
                  <p className="font-medium text-slate-900">{ticket.subject}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTicketStatusColor(ticket.status)}`}>
                  {ticket.status === "open" ? "Open" : 
                   ticket.status === "in_progress" ? "In behandeling" :
                   ticket.status === "resolved" ? "Opgelost" : "Gesloten"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-4">Geen support tickets voor dit product</p>
        )}
      </div>
    </div>
  );
}
