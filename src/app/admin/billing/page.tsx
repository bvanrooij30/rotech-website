import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { isStripeConfigured, formatPrice, MAINTENANCE_PLANS } from "@/lib/stripe";
import Link from "next/link";
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  Euro,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Zap,
} from "lucide-react";

export default async function AdminBillingPage() {
  await requireAdmin();

  // Get subscription stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let subscriptionStats: any[] = [], revenueData: any = { _sum: { monthlyPrice: 0 }, _count: 0 }, recentSubscriptions: any[] = [];
  try {
    [subscriptionStats, revenueData, recentSubscriptions] = await Promise.all([
      prisma.subscription.groupBy({ by: ["status"], _count: true }),
      prisma.subscription.aggregate({ where: { status: "active" }, _sum: { monthlyPrice: true }, _count: true }),
      prisma.subscription.findMany({
        orderBy: { createdAt: "desc" }, take: 10,
        include: { user: { select: { name: true, email: true, companyName: true } } },
      }),
    ]);
  } catch {}

  const activeCount = subscriptionStats.find((s: { status: string }) => s.status === "active")?._count || 0;
  const trialingCount = subscriptionStats.find((s: { status: string }) => s.status === "trialing")?._count || 0;
  const cancelledCount = subscriptionStats.find((s: { status: string }) => s.status === "cancelled")?._count || 0;
  const pastDueCount = subscriptionStats.find((s: { status: string }) => s.status === "past_due")?._count || 0;

  const mrr = revenueData._sum?.monthlyPrice || 0;
  const arr = mrr * 12;

  const stripeConfigured = isStripeConfigured();

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-700",
    paused: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels: Record<string, string> = {
    active: "Actief",
    trialing: "Proefperiode",
    past_due: "Achterstallig",
    cancelled: "Opgezegd",
    paused: "Gepauzeerd",
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            Billing Dashboard
          </h1>
          <p className="text-slate-600">Beheer abonnementen en omzet</p>
        </div>
        <div className="flex gap-3">
          {stripeConfigured && (
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <ExternalLink className="w-4 h-4" />
              Stripe Dashboard
            </a>
          )}
          <Link
            href="/admin/billing/setup"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Settings className="w-4 h-4" />
            Stripe Setup
          </Link>
        </div>
      </div>

      {/* Stripe Status */}
      {!stripeConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Stripe niet geconfigureerd</h3>
              <p className="text-sm text-amber-700 mt-1">
                Voeg je Stripe API keys toe aan de .env file om betalingen te activeren.
              </p>
              <Link
                href="/admin/billing/setup"
                className="text-sm text-amber-800 underline hover:no-underline mt-2 inline-block"
              >
                Configureer Stripe →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 opacity-90 mb-2">
            <Euro className="w-5 h-5" />
            <span className="text-sm">MRR (Monthly)</span>
          </div>
          <div className="text-3xl font-bold">{formatPrice(mrr)}</div>
          <div className="text-sm opacity-75 mt-1">
            {revenueData._count} actieve abonnementen
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 opacity-90 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">ARR (Yearly)</span>
          </div>
          <div className="text-3xl font-bold">{formatPrice(arr)}</div>
          <div className="text-sm opacity-75 mt-1">
            Jaarlijkse projectie
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Actieve Klanten</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{activeCount + trialingCount}</div>
          <div className="text-sm text-slate-500 mt-1">
            {trialingCount > 0 && `${trialingCount} in proefperiode`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-slate-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Aandacht Nodig</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{pastDueCount + cancelledCount}</div>
          <div className="text-sm text-slate-500 mt-1">
            {pastDueCount > 0 && `${pastDueCount} achterstallig`}
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Abonnement Verdeling</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MAINTENANCE_PLANS.map((plan) => {
            const count = recentSubscriptions.filter(s => 
              s.planType === plan.id && s.status === "active"
            ).length;
            
            return (
              <div key={plan.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{plan.name}</span>
                  <span className="text-2xl font-bold text-indigo-600">{count}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {formatPrice(plan.price)}/maand • {plan.hoursIncluded} uur
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Omzet: {formatPrice(count * plan.price)}/maand
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recente Abonnementen</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Klant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Prijs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Gestart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nog geen abonnementen
                </td>
              </tr>
            ) : (
              recentSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{sub.user.name}</div>
                    <div className="text-sm text-slate-500">{sub.user.companyName || sub.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{sub.planName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[sub.status] || "bg-slate-100 text-slate-700"}`}>
                      {statusLabels[sub.status] || sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {formatPrice(sub.monthlyPrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(sub.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/subscriptions"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-indigo-100 rounded-lg">
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Alle Abonnementen</div>
            <div className="text-sm text-slate-500">Beheer en wijzig</div>
          </div>
        </Link>

        <Link
          href="/admin/invoices"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <Euro className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Facturen</div>
            <div className="text-sm text-slate-500">Bekijk alle facturen</div>
          </div>
        </Link>

        <Link
          href="/admin/billing/setup"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900">Stripe Producten</div>
            <div className="text-sm text-slate-500">Synchroniseer pakketten</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
