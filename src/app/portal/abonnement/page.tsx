import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  CheckCircle,
  Clock,
  CreditCard,
  Calendar,
  AlertCircle,
  ArrowRight,
  Package,
} from "lucide-react";
import { SubscriptionActions } from "@/components/portal/SubscriptionActions";

export const metadata = {
  title: "Mijn Abonnement",
};

export default async function SubscriptionPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/portal/login");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    include: {
      product: true,
      usageLogs: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeSubscription = subscriptions.find(s => s.status === "active");
  const pastSubscriptions = subscriptions.filter(s => s.status !== "active");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getProgressPercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((used / total) * 100));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mijn Abonnement</h1>
        <p className="text-slate-600">Beheer je onderhoudsabonnement en bekijk je verbruik.</p>
      </div>

      {activeSubscription ? (
        <>
          {/* Active Subscription Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-indigo-200 text-sm">Actief abonnement</span>
                  <h2 className="text-2xl font-bold mt-1">{activeSubscription.planName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">€{activeSubscription.monthlyPrice}</p>
                  <p className="text-indigo-200 text-sm">per maand</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Period Info */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Huidige periode</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Startdatum</p>
                        <p className="font-medium text-slate-900">
                          {formatDate(activeSubscription.currentPeriodStart)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Volgende facturatie</p>
                        <p className="font-medium text-slate-900">
                          {formatDate(activeSubscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>
                    {activeSubscription.product && (
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-500">Gekoppeld product</p>
                          <p className="font-medium text-slate-900">
                            {activeSubscription.product.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hours Usage */}
                {activeSubscription.hoursIncluded > 0 && (
                  <div>
                    <h3 className="font-medium text-slate-900 mb-3">Uren verbruik</h3>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-2xl font-bold text-slate-900">
                          {activeSubscription.hoursUsed}
                        </span>
                        <span className="text-slate-500">
                          van {activeSubscription.hoursIncluded} uur
                        </span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            getProgressPercentage(activeSubscription.hoursUsed, activeSubscription.hoursIncluded) > 80
                              ? "bg-amber-500"
                              : "bg-indigo-600"
                          }`}
                          style={{
                            width: `${getProgressPercentage(activeSubscription.hoursUsed, activeSubscription.hoursIncluded)}%`,
                          }}
                        />
                      </div>
                      <p className="text-sm text-slate-500 mt-2">
                        {activeSubscription.hoursIncluded - activeSubscription.hoursUsed} uur resterend deze maand
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancel Warning */}
              {activeSubscription.cancelAtPeriodEnd && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Opzegging gepland</p>
                    <p className="text-sm text-amber-700">
                      Je abonnement eindigt op {formatDate(activeSubscription.currentPeriodEnd)}.
                      Tot die tijd heb je nog toegang tot alle functies.
                    </p>
                  </div>
                </div>
              )}

              {/* Subscription Actions */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 mb-4">Abonnement beheren</h3>
                <SubscriptionActions
                  subscriptionId={activeSubscription.id}
                  cancelAtPeriodEnd={activeSubscription.cancelAtPeriodEnd}
                  status={activeSubscription.status}
                />
              </div>
            </div>
          </div>

          {/* Usage Log */}
          {activeSubscription.usageLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-5 border-b border-slate-200">
                <h2 className="font-bold text-slate-900">Recente werkzaamheden</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {activeSubscription.usageLogs.map((log) => (
                  <div key={log.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{log.description}</p>
                      <p className="text-sm text-slate-500">
                        {formatDate(log.date)} • {log.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{log.hours} uur</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Features */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">Inbegrepen in je abonnement</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Software updates",
                "Dagelijkse backups",
                "Uptime monitoring",
                "Beveiligingsupdates",
                "E-mail support",
                "Performance optimalisatie",
                ...(activeSubscription.planType === "business" || activeSubscription.planType === "premium"
                  ? ["Content wijzigingen", "Maandelijkse rapportage"]
                  : []),
                ...(activeSubscription.planType === "premium"
                  ? ["Priority support", "SEO monitoring", "Telefonische support"]
                  : []),
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* No Active Subscription */
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Geen actief abonnement</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Met een onderhoudsabonnement zorgen wij voor updates, backups en ondersteuning 
            van je website of applicatie.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
            {[
              { name: "Basis", price: 99, features: ["Updates & backups", "Monitoring", "E-mail support"] },
              { name: "Business", price: 199, features: ["Alles van Basis", "2 uur wijzigingen", "Maandrapportage"] },
              { name: "Premium", price: 399, features: ["Alles van Business", "5 uur wijzigingen", "Priority support"] },
            ].map((plan) => (
              <div key={plan.name} className="border border-slate-200 rounded-xl p-4 text-left">
                <h3 className="font-bold text-slate-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-indigo-600 my-2">
                  €{plan.price}<span className="text-sm text-slate-500">/maand</span>
                </p>
                <ul className="space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-slate-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Neem contact op <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Past Subscriptions */}
      {pastSubscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="font-bold text-slate-900">Eerdere abonnementen</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pastSubscriptions.map((sub) => (
              <div key={sub.id} className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{sub.planName}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(sub.currentPeriodStart)} - {formatDate(sub.currentPeriodEnd)}
                  </p>
                </div>
                <span className="text-sm text-slate-400 capitalize">{sub.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
