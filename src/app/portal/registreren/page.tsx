"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    companyName: "",
    kvkNumber: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      number: /\d/.test(password),
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
    };
    return checks;
  };

  const passwordChecks = validatePassword(formData.password);
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError("Wachtwoorden komen niet overeen");
      setLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError("Wachtwoord voldoet niet aan de eisen");
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError("Je moet akkoord gaan met de voorwaarden");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          companyName: formData.companyName || undefined,
          kvkNumber: formData.kvkNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Er is een fout opgetreden");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/portal/login?registered=true");
      }, 2000);
    } catch {
      setError("Er is een fout opgetreden. Probeer het later opnieuw.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Account aangemaakt!
          </h1>
          <p className="text-slate-600 mb-4">
            Je account is succesvol aangemaakt. Je wordt doorgestuurd naar de login pagina.
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Account aanmaken</h1>
        <p className="text-slate-600">
          Maak een account aan voor het RoTech klantenportaal
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Info */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Naam <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Je volledige naam"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              E-mailadres <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="jouw@email.nl"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Telefoonnummer
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+31 6 12345678"
            />
          </div>

          {/* Company Info */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Bedrijfsgegevens (optioneel)</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                  Bedrijfsnaam
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Je bedrijfsnaam"
                />
              </div>

              <div>
                <label htmlFor="kvkNumber" className="block text-sm font-medium text-slate-700 mb-1">
                  KvK-nummer
                </label>
                <input
                  type="text"
                  id="kvkNumber"
                  name="kvkNumber"
                  value={formData.kvkNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="pt-4 border-t border-slate-200">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Wachtwoord <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Minimaal 8 tekens"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {formData.password && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordChecks.length ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle className="w-3 h-3" /> 8+ tekens
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.number ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle className="w-3 h-3" /> Bevat een cijfer
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.lowercase ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle className="w-3 h-3" /> Kleine letter
                  </div>
                  <div className={`flex items-center gap-1 ${passwordChecks.uppercase ? "text-emerald-600" : "text-slate-400"}`}>
                    <CheckCircle className="w-3 h-3" /> Hoofdletter
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                Wachtwoord bevestigen <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Herhaal je wachtwoord"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="pt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-600">
                Ik ga akkoord met de{" "}
                <Link href="/algemene-voorwaarden" className="text-indigo-600 hover:underline">
                  algemene voorwaarden
                </Link>{" "}
                en het{" "}
                <Link href="/privacy" className="text-indigo-600 hover:underline">
                  privacybeleid
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Account aanmaken...
              </>
            ) : (
              "Account aanmaken"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-slate-600">
            Heb je al een account?{" "}
            <Link href="/portal/login" className="text-indigo-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
