"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Clock,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Loader2,
  Settings,
  FileText,
  Euro,
  Zap,
  XCircle,
  Pause,
} from "lucide-react";
import { formatPrice } from "@/lib/stripe";

interface Subscription {
  id: string;
  planType: string;
  planName: string;
  status: string;
  monthlyPrice: number;
  hoursIncluded: number;
  hoursUsed: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  recentUsage: Array<{
    id: string;
    description: string;
    hours: number;
    date: string;
    category: string;
  }>;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  pdfUrl?: string;
}

interface SubscriptionData {
  subscription: Subscription | null;
  allSubscriptions: Array<{
    id: string;
    planName: string;
    status: string;
    createdAt: string;
    cancelledAt?: string;
  }>;
  recentInvoices: Invoice[];
  hasStripePortal: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Actief", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-4 h-4" /> },
  trialing: { label: "Proefperiode", color: "bg-blue-100 text-blue-700", icon: <Clock className="w-4 h-4" /> },
  past_due: { label: "Betaling achterstallig", color: "bg-red-100 text-red-700", icon: <AlertCircle className="w-4 h-4" /> },
  canceled: { label: "Opgezegd", color: "bg-slate-100 text-slate-700", icon: <XCircle className="w-4 h-4" /> },
  paused: { label: "Gepauzeerd", color: "bg-yellow-100 text-yellow-700", icon: <Pause className="w-4 h-4" /> },
};

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/portal");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Kon abonnement niet laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openStripePortal = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        setError(result.error || "Kon portal niet openen");
      }
    } catch {
      setError("Kon portal niet openen");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Abonnement laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  const subscription = data?.subscription;
  const status = subscription ? statusConfig[subscription.status] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            Mijn Abonnement
          </h1>
          <p className="text-slate-600 mt-1">
            Beheer je onderhoudspakket en bekijk je facturen
          </p>
        </div>
        {data?.hasStripePortal && (
          <button
            onClick={openStripePortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {portalLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            Beheer via Stripe
          </button>
        )}
      </div>

      {/* No Subscription */}
      {!subscription && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Geen actief abonnement</h2>
          <p className="opacity-90 mb-6">
            Zorg dat je website altijd up-to-date en veilig blijft met een onderhoudspakket.
          </p>
          <Link
            href="/onderhoud"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50"
          >
            Bekijk Onderhoudspakketten
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Active Subscription */}
      {subscription && (
        <>
          {/* Subscription Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{subscription.planName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${status?.color}`}>
                      {status?.icon}
                      {status?.label}
                    </span>
                    {subscription.cancelAtPeriodEnd && (
                      <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        Eindigt {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">
                    {formatPrice(subscription.monthlyPrice)}
                  </div>
                  <div className="text-sm text-slate-500">per maand</div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hours Usage */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Clock className="w-4 h-4" />
                  Uren deze maand
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {subscription.hoursUsed}
                  </span>
                  <span className="text-slate-500 mb-1">
                    / {subscription.hoursIncluded} uur
                  </span>
                </div>
                <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      subscription.hoursUsed / subscription.hoursIncluded > 0.8
                        ? "bg-red-500"
                        : subscription.hoursUsed / subscription.hoursIncluded > 0.5
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(100, (subscription.hoursUsed / subscription.hoursIncluded) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Period */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  Huidige periode
                </div>
                <div className="text-sm text-slate-900">
                  <div>
                    Start: {new Date(subscription.currentPeriodStart).toLocaleDateString("nl-NL")}
                  </div>
                  <div>
                    Einde: {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL")}
                  </div>
                </div>
              </div>

              {/* Value */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Waarde
                </div>
                <div className="text-sm text-slate-900">
                  <div>Normaal: {formatPrice(subscription.hoursIncluded * 75)}/maand</div>
                  <div className="text-green-600 font-medium">
                    Besparing: {formatPrice(subscription.hoursIncluded * 75 - subscription.monthlyPrice)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Usage */}
          {subscription.recentUsage.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recente Activiteit</h3>
              <div className="space-y-3">
                {subscription.recentUsage.map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="font-medium text-slate-900">{usage.description}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(usage.date).toLocaleDateString("nl-NL")} • {usage.category}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-slate-700">
                      {usage.hours} uur
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Invoices */}
      {data?.recentInvoices && data.recentInvoices.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-500" />
            Recente Facturen
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 text-sm font-medium text-slate-500">Factuurnummer</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-500">Datum</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-500">Bedrag</th>
                  <th className="text-left py-2 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-right py-2 text-sm font-medium text-slate-500">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="py-3 text-slate-600">
                      {new Date(invoice.createdAt).toLocaleDateString("nl-NL")}
                    </td>
                    <td className="py-3 text-slate-900">{formatPrice(invoice.amount)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === "paid" ? "bg-green-100 text-green-700" :
                        invoice.status === "open" ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-700"
                      }`}>
                        {invoice.status === "paid" ? "Betaald" :
                         invoice.status === "open" ? "Open" : invoice.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {subscription && subscription.planType !== "premium" && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-amber-900">Upgrade naar Premium</h3>
              <p className="text-sm text-amber-700 mt-1">
                Krijg 8 uur onderhoud per maand, prioriteit support en een dedicated account manager.
              </p>
            </div>
            <Link
              href="/onderhoud"
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
            >
              Bekijk opties
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
