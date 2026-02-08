"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/portal";
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Map NextAuth errors to user-friendly messages
        if (result.error === "CredentialsSignin" || result.error === "Configuration") {
          setErrorMessage("Onjuiste inloggegevens. Controleer je e-mailadres en wachtwoord.");
        } else {
          setErrorMessage("Er is een fout opgetreden. Probeer het later opnieuw.");
        }
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setErrorMessage("Inloggen mislukt. Probeer het opnieuw.");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Er is een fout opgetreden. Probeer het later opnieuw.");
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Inloggen</h1>
        <p className="text-slate-600">
          Welkom terug bij het RoTech klantenportaal
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Success message for verified email */}
        {verified && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700">
              Je e-mailadres is geverifieerd! Je kunt nu inloggen.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              E-mailadres
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="jouw@email.nl"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Je wachtwoord"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-600">Onthoud mij</span>
            </label>
            <Link href="/portal/wachtwoord-vergeten" className="text-indigo-600 hover:underline">
              Wachtwoord vergeten?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600">
            Nog geen account?{" "}
            <Link href="/portal/registreren" className="text-indigo-600 font-medium hover:underline">
              Maak een account aan
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Problemen met inloggen?{" "}
        <Link href="/contact" className="text-indigo-600 hover:underline">
          Neem contact op
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="py-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
