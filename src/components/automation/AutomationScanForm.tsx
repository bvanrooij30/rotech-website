"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, Send, Clock } from "lucide-react";

const systemOptions = [
  { id: "google-workspace", label: "Google Workspace" },
  { id: "microsoft-365", label: "Microsoft 365" },
  { id: "hubspot", label: "HubSpot" },
  { id: "pipedrive", label: "Pipedrive" },
  { id: "shopify", label: "Shopify" },
  { id: "woocommerce", label: "WooCommerce" },
  { id: "mollie", label: "Mollie" },
  { id: "exact", label: "Exact Online" },
  { id: "moneybird", label: "Moneybird" },
  { id: "slack", label: "Slack" },
  { id: "notion", label: "Notion" },
  { id: "trello", label: "Trello" },
  { id: "anders", label: "Anders" },
];

const timeOptions = [
  { value: "<1u", label: "Minder dan 1 uur" },
  { value: "1-5u", label: "1-5 uur" },
  { value: "5-10u", label: "5-10 uur" },
  { value: "10-20u", label: "10-20 uur" },
  { value: ">20u", label: "Meer dan 20 uur" },
];

interface FormData {
  naam: string;
  email: string;
  bedrijf: string;
  processen: string;
  tijdPerWeek: string;
  systemen: string[];
}

export function AutomationScanForm() {
  const [formData, setFormData] = useState<FormData>({
    naam: "",
    email: "",
    bedrijf: "",
    processen: "",
    tijdPerWeek: "",
    systemen: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSystemToggle = (systemId: string) => {
    setFormData((prev) => ({
      ...prev,
      systemen: prev.systemen.includes(systemId)
        ? prev.systemen.filter((s) => s !== systemId)
        : [...prev.systemen, systemId],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/automation-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is iets misgegaan");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is iets misgegaan");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 text-center shadow-xl"
      >
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          Aanvraag Ontvangen!
        </h3>
        <p className="text-slate-600 mb-6">
          Bedankt voor uw interesse. Wij nemen binnen 24 uur contact met u op voor
          een gratis automation scan.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          Verwachte reactietijd: binnen 24 uur
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-xl">
      <div className="space-y-6">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="naam"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Naam *
            </label>
            <input
              type="text"
              id="naam"
              required
              value={formData.naam}
              onChange={(e) =>
                setFormData({ ...formData, naam: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Uw naam"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              E-mailadres *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="uw@email.nl"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="bedrijf"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Bedrijfsnaam *
          </label>
          <input
            type="text"
            id="bedrijf"
            required
            value={formData.bedrijf}
            onChange={(e) =>
              setFormData({ ...formData, bedrijf: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="Uw bedrijfsnaam"
          />
        </div>

        <div>
          <label
            htmlFor="processen"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Welke processen wilt u automatiseren? *
          </label>
          <textarea
            id="processen"
            required
            rows={4}
            value={formData.processen}
            onChange={(e) =>
              setFormData({ ...formData, processen: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            placeholder="Beschrijf de taken of processen die u wilt automatiseren..."
          />
        </div>

        <div>
          <label
            htmlFor="tijdPerWeek"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Hoeveel tijd kosten deze processen nu per week? *
          </label>
          <select
            id="tijdPerWeek"
            required
            value={formData.tijdPerWeek}
            onChange={(e) =>
              setFormData({ ...formData, tijdPerWeek: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
          >
            <option value="">Selecteer...</option>
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Welke systemen gebruikt u? (meerdere mogelijk)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {systemOptions.map((system) => (
              <button
                key={system.id}
                type="button"
                onClick={() => handleSystemToggle(system.id)}
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  formData.systemen.includes(system.id)
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {system.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verzenden...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Gratis Automation Scan Aanvragen
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-500">
          Wij nemen binnen 24 uur contact met u op. Geen verplichtingen.
        </p>
      </div>
    </form>
  );
}

export default AutomationScanForm;
