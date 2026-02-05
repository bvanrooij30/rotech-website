"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import {
  automationPlans,
  enterprisePlan,
  formatPrice,
  calculateYearlySavings,
} from "@/data/automation-subscriptions";

export function AutomationPricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span
          className={`text-sm font-medium transition-colors ${
            !isYearly ? "text-slate-900" : "text-slate-500"
          }`}
        >
          Maandelijks
        </span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-16 h-8 bg-slate-200 rounded-full transition-colors hover:bg-slate-300"
          aria-label="Toggle prijzen"
        >
          <motion.div
            className="absolute top-1 w-6 h-6 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-lg"
            animate={{ left: isYearly ? "calc(100% - 28px)" : "4px" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium transition-colors ${
              isYearly ? "text-slate-900" : "text-slate-500"
            }`}
          >
            Jaarlijks
          </span>
          {isYearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
            >
              2 maanden gratis
            </motion.span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {automationPlans.map((plan, index) => {
          const price = isYearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
          const savings = calculateYearlySavings(plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 ${
                plan.isPopular
                  ? "bg-gradient-to-b from-indigo-600 to-violet-700 text-white ring-4 ring-indigo-500/30 scale-105 z-10"
                  : "bg-white border border-slate-200"
              }`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-sm font-bold rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    Meest Gekozen
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3
                  className={`text-xl font-bold mb-2 ${
                    plan.isPopular ? "text-white" : "text-slate-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.isPopular ? "text-indigo-100" : "text-slate-600"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-bold ${
                      plan.isPopular ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {formatPrice(Math.round(price))}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.isPopular ? "text-indigo-200" : "text-slate-500"
                    }`}
                  >
                    /maand
                  </span>
                </div>
                {isYearly && savings > 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      plan.isPopular ? "text-emerald-300" : "text-emerald-600"
                    }`}
                  >
                    Bespaar {formatPrice(savings)} per jaar
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.isPopular ? "text-emerald-300" : "text-emerald-500"
                        }`}
                      />
                    ) : (
                      <X
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          plan.isPopular ? "text-indigo-300" : "text-slate-300"
                        }`}
                      />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? plan.isPopular
                            ? "text-white"
                            : "text-slate-700"
                          : plan.isPopular
                          ? "text-indigo-300"
                          : "text-slate-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/checkout/automation/${plan.slug}?billing=${
                  isYearly ? "yearly" : "monthly"
                }`}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  plan.isPopular
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          );
        })}

        {/* Enterprise Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative rounded-2xl p-6 bg-gradient-to-b from-slate-800 to-slate-900 text-white"
        >
          {/* Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{enterprisePlan.name}</h3>
            <p className="text-sm text-slate-300">{enterprisePlan.description}</p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-lg text-slate-400">Vanaf</span>
              <span className="text-4xl font-bold text-white">
                {formatPrice(enterprisePlan.startingPrice)}
              </span>
              <span className="text-sm text-slate-400">/maand</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">Op maat offerte</p>
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {enterprisePlan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                <span className="text-sm text-slate-200">{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href="/contact?subject=Enterprise%20Automation"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium border-2 border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {enterprisePlan.cta}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default AutomationPricing;
