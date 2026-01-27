"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, Shield, ArrowRight } from "lucide-react";

interface SetupStatus {
  setupRequired: boolean;
  stats: {
    totalUsers: number;
    superAdmins: number;
    admins: number;
  };
}

export default function SetupPage() {
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    setupKey: "",
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/setup/admin");
      const data = await res.json();
      setStatus(data);
    } catch {
      setError("Kon de setup status niet ophalen");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Wachtwoorden komen niet overeen");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          setupKey: formData.setupKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Er is een fout opgetreden");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Er is een fout opgetreden. Probeer het later opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Setup Voltooid!
          </h1>
          <p className="text-slate-600 mb-6">
            Je admin account is aangemaakt. Je kunt nu inloggen.
          </p>
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ga naar inloggen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (status && !status.setupRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Setup Voltooid
          </h1>
          <p className="text-slate-600 mb-6">
            Er bestaat al een admin account. Ga naar de login pagina om in te loggen.
          </p>
          <div className="text-sm text-slate-500 mb-6 p-4 bg-slate-50 rounded-lg">
            <p><strong>Totaal gebruikers:</strong> {status.stats.totalUsers}</p>
            <p><strong>Super admins:</strong> {status.stats.superAdmins}</p>
            <p><strong>Admins:</strong> {status.stats.admins}</p>
          </div>
          <Link
            href="/portal/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Ga naar inloggen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="setupGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#setupGrid)" />
        </svg>
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Ro-Tech Setup
          </h1>
          <p className="text-indigo-200">
            Maak je eerste admin account aan
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Naam
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ro-Tech Admin"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                E-mailadres
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="admin@ro-techdevelopment.dev"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Wachtwoord
              </label>
              <input
                type="password"
                id="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Minimaal 8 karakters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Bevestig wachtwoord
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Herhaal je wachtwoord"
              />
            </div>

            <div>
              <label htmlFor="setupKey" className="block text-sm font-medium text-slate-700 mb-1">
                Setup Key
              </label>
              <input
                type="password"
                id="setupKey"
                required
                value={formData.setupKey}
                onChange={(e) => setFormData({ ...formData, setupKey: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Uit Vercel environment variables"
              />
              <p className="mt-1 text-xs text-slate-500">
                De ADMIN_SETUP_KEY uit je Vercel environment variables
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Aanmaken...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Admin Account Aanmaken
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-indigo-200 text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            ← Terug naar de website
          </Link>
        </p>
      </div>
    </div>
  );
}
