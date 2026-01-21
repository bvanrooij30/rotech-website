import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  CreditCard,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Dashboard",
};

export default async function PortalDashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/portal/login");
  }

  // Fetch user data with relations
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        where: { status: "active" },
        include: { product: true },
        take: 1,
      },
      products: {
        where: { status: { not: "archived" } },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
      supportTickets: {
        where: { status: { not: "closed" } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/portal/login");
  }

  const activeSubscription = user.subscriptions[0];
  const openTickets = user.supportTickets.filter(t => t.status !== "resolved" && t.status !== "closed");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "development":
        return "bg-blue-100 text-blue-700";
      case "maintenance":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-amber-100 text-amber-700";
      case "waiting_customer":
        return "bg-purple-100 text-purple-700";
      case "resolved":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getTicketStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: "Open",
      in_progress: "In behandeling",
      waiting_customer: "Wacht op reactie",
      resolved: "Opgelost",
      closed: "Gesloten",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welkom terug, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-indigo-100">
          Bekijk hier een overzicht van je projecten en abonnement.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Subscription */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            {activeSubscription ? (
              <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Actief
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                Geen
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900">Abonnement</h3>
          {activeSubscription ? (
            <p className="text-sm text-slate-600">
              {activeSubscription.planName} - €{activeSubscription.monthlyPrice}/maand
            </p>
          ) : (
            <p className="text-sm text-slate-500">Geen actief abonnement</p>
          )}
          <Link
            href="/portal/abonnement"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:underline"
          >
            Bekijken <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
              {user.products.length} product{user.products.length !== 1 ? "en" : ""}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900">Mijn Producten</h3>
          <p className="text-sm text-slate-600">
            {user.products.length > 0
              ? `${user.products[0].name}${user.products.length > 1 ? ` +${user.products.length - 1}` : ""}`
              : "Geen producten"}
          </p>
          <Link
            href="/portal/producten"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:underline"
          >
            Bekijken <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
            {openTickets.length > 0 ? (
              <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                {openTickets.length} open
              </span>
            ) : (
              <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Geen open
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900">Support</h3>
          <p className="text-sm text-slate-600">
            {openTickets.length > 0
              ? `${openTickets.length} open ticket${openTickets.length !== 1 ? "s" : ""}`
              : "Geen openstaande tickets"}
          </p>
          <Link
            href="/portal/support"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:underline"
          >
            Bekijken <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Mijn Producten</h2>
          <Link
            href="/portal/producten"
            className="text-sm text-indigo-600 hover:underline"
          >
            Bekijk alle
          </Link>
        </div>
        
        {user.products.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {user.products.map((product) => (
              <div key={product.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500">
                      {product.domain || product.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${getStatusColor(product.status)}`}>
                    {product.status === "active" ? "Actief" : product.status}
                  </span>
                  <Link
                    href={`/portal/producten/${product.id}`}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">Je hebt nog geen producten.</p>
            <Link
              href="/offerte"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Vraag een offerte aan
            </Link>
          </div>
        )}
      </div>

      {/* Support Tickets */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Recente Support Tickets</h2>
          <Link
            href="/portal/support/nieuw"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Nieuw ticket
          </Link>
        </div>
        
        {user.supportTickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {user.supportTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/portal/support/${ticket.id}`}
                className="p-5 flex items-center justify-between hover:bg-slate-50 block"
              >
                <div className="flex items-center gap-4">
                  {ticket.status === "resolved" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : ticket.status === "waiting_customer" ? (
                    <AlertCircle className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{ticket.ticketNumber}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTicketStatusColor(ticket.status)}`}>
                        {getTicketStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900">{ticket.subject}</h3>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString("nl-NL")}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">Je hebt nog geen support tickets.</p>
            <Link
              href="/portal/support/nieuw"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" /> Maak een ticket aan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
