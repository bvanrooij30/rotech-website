"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  CreditCard,
  Loader2,
  AlertCircle,
  Shield,
  Star,
  Calendar,
} from "lucide-react";
import { maintenancePlans, getYearlyPrice } from "@/data/packages";
import { formatPrice } from "@/lib/stripe";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
}

type BillingInterval = "monthly" | "yearly";

export function MaintenanceCheckout() {
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");
  const cancelled = searchParams.get("cancelled");

  const [step, setStep] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(preselectedPlan);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(cancelled ? "Betaling geannuleerd. Probeer het opnieuw." : null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
  });

  const selectedPlan = maintenancePlans.find(p => p.id === selectedPlanId);

  // Calculate price based on billing interval
  const getDisplayPrice = (monthlyPrice: number) => {
    if (billingInterval === "yearly") {
      return getYearlyPrice(monthlyPrice) / 12; // Show monthly equivalent
    }
    return monthlyPrice;
  };

  const getTotalPrice = (monthlyPrice: number) => {
    if (billingInterval === "yearly") {
      return getYearlyPrice(monthlyPrice);
    }
    return monthlyPrice;
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !customerInfo.name || !customerInfo.email) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          interval: billingInterval,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          companyName: customerInfo.company || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Er is een fout opgetreden");
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedPlanId !== null;
      case 2:
        return customerInfo.name && customerInfo.email && customerInfo.phone;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-full p-1 shadow-md inline-flex">
          <button
            onClick={() => setBillingInterval("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingInterval === "monthly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Maandelijks
          </button>
          <button
            onClick={() => setBillingInterval("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingInterval === "yearly"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jaarlijks
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              -10%
            </span>
          </button>
        </div>
      </div>

      {/* Step 1: Plan Selection */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid md:grid-cols-3 gap-6">
            {maintenancePlans.map((plan, index) => {
              const isSelected = selectedPlanId === plan.id;
              const isPopular = index === 1;
              const monthlyPrice = getDisplayPrice(plan.price);
              const totalPrice = getTotalPrice(plan.price);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`relative rounded-2xl p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                    isSelected
                      ? "bg-indigo-50 border-2 border-indigo-600 shadow-lg shadow-indigo-500/20"
                      : isPopular
                      ? "bg-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/10"
                      : "bg-white border-2 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Populairste keuze
                      </span>
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-slate-300"
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>

                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    
                    <div className="mt-4 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">
                          {formatPrice(monthlyPrice)}
                        </span>
                        <span className="text-slate-500">/maand</span>
                      </div>
                      {billingInterval === "yearly" && (
                        <div className="mt-1 text-sm text-emerald-600 font-medium">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatPrice(totalPrice)}/jaar (10% korting)
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${
                            isSelected ? "text-indigo-600" : "text-emerald-500"
                          }`} />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.hoursIncluded > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-sm font-medium text-indigo-600">
                          Inclusief {plan.hoursIncluded} uur content wijzigingen
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-lg disabled:opacity-50"
            >
              Doorgaan naar gegevens
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Customer Info */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Order Summary */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Uw selectie</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-indigo-100">Onderhoud {selectedPlan?.name}</p>
                  <p className="text-sm text-indigo-200">
                    {billingInterval === "yearly" ? "Jaarlijks" : "Maandelijks"} factureren
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {formatPrice(getTotalPrice(selectedPlan?.price || 0))}
                  </p>
                  <p className="text-sm text-indigo-200">
                    {billingInterval === "yearly" ? "/jaar" : "/maand"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Uw gegevens
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Naam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw volledige naam"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="uw@email.nl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefoon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="+31 6 12345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bedrijfsnaam
                  </label>
                  <input
                    type="text"
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw bedrijfsnaam (optioneel)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={customerInfo.website}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, website: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="https://uwwebsite.nl"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 my-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Veilig betalen via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>iDEAL, Creditcard, Bancontact</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Terug
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={!canProceed() || isLoading}
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Bezig...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Naar betaling - {formatPrice(getTotalPrice(selectedPlan?.price || 0))}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                Door te betalen gaat u akkoord met onze{" "}
                <a href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                  algemene voorwaarden
                </a>{" "}
                en{" "}
                <a href="/privacy" className="text-indigo-600 hover:underline">
                  privacybeleid
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
