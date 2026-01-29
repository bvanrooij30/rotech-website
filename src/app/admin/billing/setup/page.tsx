"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Zap,
  AlertCircle,
  Copy,
} from "lucide-react";

interface ProductInfo {
  id: string;
  name: string;
  planId: string;
  hoursIncluded: string;
  prices: Array<{
    id: string;
    amount: number;
    currency: string;
    interval: string;
  }>;
}

interface SetupResult {
  plan: string;
  productId: string;
  priceId: string;
  status: string;
}

export default function StripeSetupPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [setupResults, setSetupResults] = useState<SetupResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/setup");
      const result = await response.json();

      if (result.success) {
        setConfigured(result.configured);
        setProducts(result.products || []);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Kon status niet ophalen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const syncProducts = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSetupResults([]);

      const response = await fetch("/api/stripe/setup", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSetupResults(result.products);
        await fetchStatus(); // Refresh the list
      } else {
        setError(result.error);
      }
    } catch {
      setError("Synchronisatie mislukt");
    } finally {
      setSyncing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Stripe status controleren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/billing"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar Billing
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" />
          Stripe Setup
        </h1>
        <p className="text-slate-600 mt-1">
          Configureer en synchroniseer je Stripe producten
        </p>
      </div>

      {/* Configuration Status */}
      <div className={`rounded-xl p-6 ${configured ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
        <div className="flex items-start gap-4">
          {configured ? (
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500" />
          )}
          <div>
            <h2 className={`text-lg font-semibold ${configured ? "text-green-800" : "text-red-800"}`}>
              {configured ? "Stripe is geconfigureerd" : "Stripe is niet geconfigureerd"}
            </h2>
            <p className={`text-sm mt-1 ${configured ? "text-green-700" : "text-red-700"}`}>
              {configured 
                ? "Je Stripe API keys zijn correct ingesteld. Je kunt nu producten synchroniseren."
                : "Voeg je Stripe API keys toe aan de .env file om door te gaan."
              }
            </p>
            {!configured && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-sm text-slate-700 font-mono">
                  STRIPE_SECRET_KEY=&quot;sk_test_...&quot;<br />
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=&quot;pk_test_...&quot;<br />
                  STRIPE_WEBHOOK_SECRET=&quot;whsec_...&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Fout</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Sync Button */}
      {configured && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Synchroniseer Producten</h3>
              <p className="text-sm text-slate-600 mt-1">
                Maak of update de onderhoudspakketten in Stripe
              </p>
            </div>
            <button
              onClick={syncProducts}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {syncing ? "Synchroniseren..." : "Synchroniseer naar Stripe"}
            </button>
          </div>

          {/* Sync Results */}
          {setupResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-slate-700">Resultaten:</h4>
              {setupResults.map((result) => (
                <div key={result.priceId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === "created" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                    <span className="font-medium text-slate-900">{result.plan}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      result.status === "created" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {result.status === "created" ? "Aangemaakt" : "Bestaand"}
                    </span>
                  </div>
                  <code className="text-xs text-slate-500">{result.priceId}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Products */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Geconfigureerde Producten</h3>
            <p className="text-sm text-slate-600">Deze producten zijn actief in Stripe</p>
          </div>
          <div className="divide-y divide-slate-100">
            {products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-sm text-slate-500 mt-1">
                      Plan ID: {product.planId} • {product.hoursIncluded} uur/maand
                    </div>
                  </div>
                  <a
                    href={`https://dashboard.stripe.com/products/${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                {product.prices.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {product.prices.map((price) => (
                      <div key={price.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            €{price.amount}/{price.interval === "month" ? "maand" : price.interval}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(price.id, price.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          {copiedId === price.id ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              Gekopieerd
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              {price.id}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 mb-3">Stripe Setup Guide</h3>
        <ol className="space-y-2 text-sm text-indigo-800">
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <span>Ga naar <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → API Keys</a></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <span>Kopieer de Secret Key en Publishable Key naar je .env file</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            <span>Maak een webhook aan in <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline">Stripe Webhooks</a></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            <span>Endpoint URL: <code className="bg-indigo-100 px-1 rounded">https://jouwdomein.nl/api/stripe/webhook</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
            <span>Kopieer de Webhook Signing Secret naar STRIPE_WEBHOOK_SECRET</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-indigo-200 text-indigo-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0">6</span>
            <span>Klik op &quot;Synchroniseer naar Stripe&quot; om de producten aan te maken</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
