"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  CreditCard,
  Loader2,
  Package,
  Settings,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { packageDefinitions, maintenancePlans, getPackageById, getMaintenancePlanById } from "@/data/packages";
import { formatPrice, calculateDeposit } from "@/lib/stripe";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export default function CheckoutWizard() {
  const searchParams = useSearchParams();
  const preselectedPackage = searchParams.get("pakket");
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selections
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(preselectedPackage);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  // Get selected items
  const selectedPackage = selectedPackageId ? getPackageById(selectedPackageId) : null;
  const selectedPlan = selectedPlanId ? getMaintenancePlanById(selectedPlanId) : null;

  // Calculate totals - for checkout, we use a base estimate
  // In practice, this should come from an accepted quote
  const projectTotal = 2500; // Default estimate - actual amount comes from quote
  const { depositAmount, remainingAmount, depositPercentage } = calculateDeposit(
    projectTotal,
    projectTotal > 7500
  );
  const monthlyMaintenance = selectedPlan?.price || 0;

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          companyName: customerInfo.company || undefined,
          amount: depositAmount,
          description: `Aanbetaling ${selectedPackage.name} - RoTech Development`,
          paymentType: "deposit",
          packageId: selectedPackage.id,
          maintenancePlanId: selectedPlan?.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Betaling kon niet worden aangemaakt");
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
        return selectedPackageId !== null;
      case 2:
        return true; // Maintenance is optional
      case 3:
        return customerInfo.name && customerInfo.email && customerInfo.phone;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: "Pakket", icon: Package },
            { num: 2, label: "Onderhoud", icon: Settings },
            { num: 3, label: "Gegevens", icon: ShoppingCart },
            { num: 4, label: "Betalen", icon: CreditCard },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step > s.num
                    ? "bg-emerald-500"
                    : step === s.num
                    ? "bg-white text-indigo-600"
                    : "bg-white/20"
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className="ml-2 hidden sm:inline text-sm font-medium">
                {s.label}
              </span>
              {i < 3 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                  step > s.num ? "bg-emerald-500" : "bg-white/20"
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Package */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Kies uw pakket
              </h2>
              <p className="text-slate-600 mb-6">
                Selecteer het pakket dat het beste bij uw project past.
              </p>

              <div className="grid gap-4">
                {packageDefinitions.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedPackageId === pkg.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${pkg.popular ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="package"
                        value={pkg.id}
                        checked={selectedPackageId === pkg.id}
                        onChange={() => setSelectedPackageId(pkg.id)}
                        className="mt-1 w-5 h-5 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                          <span className="text-sm text-indigo-600 font-medium">{pkg.subtitle}</span>
                          {pkg.popular && (
                            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                              Populair
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{pkg.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {pkg.deliveryTime}
                          </span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            Prijs op basis van functies
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <p className="text-sm text-slate-500 mt-4 text-center">
                Ander pakket nodig?{" "}
                <a href="/contact" className="text-indigo-600 hover:underline">
                  Neem contact op
                </a>{" "}
                voor een offerte op maat.
              </p>
            </motion.div>
          )}

          {/* Step 2: Maintenance Plan */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Onderhoudsplan (optioneel)
              </h2>
              <p className="text-slate-600 mb-6">
                Kies een onderhoudsabonnement voor doorlopende ondersteuning na oplevering.
              </p>

              <div className="grid gap-4 mb-6">
                {/* No maintenance option */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanId === null
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="plan"
                      checked={selectedPlanId === null}
                      onChange={() => setSelectedPlanId(null)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900">Geen onderhoud</h3>
                      <p className="text-sm text-slate-600">
                        Ik regel onderhoud zelf of beslis later
                      </p>
                    </div>
                  </div>
                </label>

                {maintenancePlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedPlanId === plan.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${plan.id === "business" ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selectedPlanId === plan.id}
                        onChange={() => setSelectedPlanId(plan.id)}
                        className="mt-1 w-5 h-5 text-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900">{plan.name}</h3>
                            {plan.id === "business" && (
                              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                                Populair
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-indigo-600">
                            {formatPrice(plan.price)}/mnd
                          </span>
                        </div>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-emerald-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                <p className="text-amber-800">
                  <strong>💡 Let op:</strong> Onderhoudsabonnementen starten automatisch na uw gratis supportperiode. 
                  Minimale looptijd is 3 maanden met 1 maand opzegtermijn.
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customer Info */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Uw gegevens
              </h2>
              <p className="text-slate-600 mb-6">
                Vul uw contactgegevens in voor de betaling en communicatie.
              </p>

              <div className="grid gap-4">
                <div>
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
                    Bedrijfsnaam (optioneel)
                  </label>
                  <input
                    type="text"
                    value={customerInfo.company}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, company: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Uw bedrijfsnaam"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review & Pay */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Overzicht & Betalen
              </h2>
              <p className="text-slate-600 mb-6">
                Controleer uw bestelling en ga naar betalen.
              </p>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-4">Uw bestelling</h3>
                
                {/* Package */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="font-medium text-slate-900">{selectedPackage?.name} - {selectedPackage?.subtitle}</p>
                    <p className="text-sm text-slate-600">{selectedPackage?.deliveryTime}</p>
                  </div>
                  <p className="font-bold text-slate-900">{formatPrice(projectTotal)}</p>
                </div>

                {/* Maintenance */}
                {selectedPlan && (
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-200">
                    <div>
                      <p className="font-medium text-slate-900">Onderhoud {selectedPlan.name}</p>
                      <p className="text-sm text-slate-600">
                        Start na oplevering
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">{formatPrice(monthlyMaintenance)}/mnd</p>
                  </div>
                )}

                {/* Payment breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Projecttotaal</span>
                    <span className="text-slate-900">{formatPrice(projectTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Aanbetaling ({depositPercentage}%)</span>
                    <span className="text-slate-900">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Na oplevering</span>
                    <span className="text-slate-900">{formatPrice(remainingAmount)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Nu te betalen</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {formatPrice(depositAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer info summary */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Uw gegevens</h3>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Naam:</strong> {customerInfo.name}</p>
                  <p><strong>E-mail:</strong> {customerInfo.email}</p>
                  <p><strong>Telefoon:</strong> {customerInfo.phone}</p>
                  {customerInfo.company && <p><strong>Bedrijf:</strong> {customerInfo.company}</p>}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  <span>Veilig betalen via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>iDEAL, Creditcard, Bancontact</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Bezig met doorsturen...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Nu betalen - {formatPrice(depositAmount)}
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Door te betalen gaat u akkoord met onze{" "}
                <a href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                  algemene voorwaarden
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Vorige
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
            >
              Volgende
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
