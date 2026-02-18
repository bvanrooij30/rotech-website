"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wand2,
  Download,
  Copy,
  CheckCircle2,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Target,
  Clock,
  Euro,
  FileText,
  Sparkles,
} from "lucide-react";

interface FormData {
  // Client
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string;
  industry: string;
  targetAudience: string;
  currentWebsite: string;
  // Project
  projectType: string;
  goals: string[];
  pages: string[];
  features: string[];
  hasLogo: boolean;
  hasTexts: boolean;
  hasPhotos: boolean;
  hasBrandColors: boolean;
  inspirationSites: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  specificWishes: string;
  domain: string;
  hasDomain: boolean;
  hasHosting: boolean;
}

const projectTypes = [
  { id: "starter", name: "Starter Website", price: "€1.295+" },
  { id: "business", name: "Business Website", price: "€2.995+" },
  { id: "webshop", name: "Webshop", price: "€4.995+" },
  { id: "maatwerk", name: "Maatwerk", price: "€9.995+" },
  { id: "automatisering", name: "Automatisering", price: "€695+" },
  { id: "pwa", name: "PWA", price: "€2.995+" },
  { id: "api-integratie", name: "API Integratie", price: "€1.495+" },
  { id: "seo", name: "SEO", price: "€695+" },
  { id: "onderhoud", name: "Onderhoud", price: "€129+/maand" },
  { id: "chatbot", name: "AI Chatbot", price: "€2.995+" },
];

const goalOptions = [
  "Online zichtbaarheid",
  "Leads genereren",
  "Producten verkopen",
  "Portfolio tonen",
  "Diensten presenteren",
  "Klanten informeren",
  "Afspraken maken",
  "Support bieden",
];

const featureOptions = [
  "Contactformulier",
  "WhatsApp button",
  "Blog",
  "CMS",
  "Nieuwsbrief",
  "Google Analytics",
  "SEO optimalisatie",
  "Meertaligheid",
  "Boekingssysteem",
  "Betaalfunctie",
  "Klantenlogin",
  "Chat widget",
];

export default function GeneratePromptPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    businessType: "",
    industry: "",
    targetAudience: "",
    currentWebsite: "",
    projectType: "business",
    goals: [],
    pages: [],
    features: [],
    hasLogo: false,
    hasTexts: false,
    hasPhotos: false,
    hasBrandColors: false,
    inspirationSites: "",
    budgetMin: 2995,
    budgetMax: 5000,
    timeline: "4-6 weken",
    specificWishes: "",
    domain: "",
    hasDomain: false,
    hasHosting: false,
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "goals" | "features", item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai-agents/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: {
            companyName: formData.companyName,
            contactName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            businessType: formData.businessType,
            industry: formData.industry,
            targetAudience: formData.targetAudience,
            currentWebsite: formData.currentWebsite,
          },
          project: {
            type: formData.projectType,
            goals: formData.goals,
            pages: formData.pages.length > 0 ? formData.pages : ["Homepage"],
            features: formData.features,
            contentProvided: {
              logo: formData.hasLogo,
              texts: formData.hasTexts,
              photos: formData.hasPhotos,
              brandColors: formData.hasBrandColors,
            },
            inspirationSites: formData.inspirationSites
              .split("\n")
              .filter(s => s.trim())
              .map(url => ({ url: url.trim(), whatLiked: "Inspiratie" })),
            budget: { min: formData.budgetMin, max: formData.budgetMax },
            timeline: formData.timeline,
            specificWishes: formData.specificWishes,
            domain: formData.domain,
            hasDomain: formData.hasDomain,
            hasHosting: formData.hasHosting,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedPrompt(result.prompt.prompt);
        setStep(4);
      } else {
        alert("Fout bij genereren: " + result.error);
      }
    } catch (error) {
      alert("Fout bij genereren prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedPrompt) {
      const blob = new Blob([generatedPrompt], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-${formData.companyName.replace(/\s/g, "-").toLowerCase()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/portal/ai-agents/prompts"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug naar Master Prompts
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-purple-600" />
          Prompt Generator
        </h1>
        <p className="text-slate-600 mt-1">
          Genereer automatisch een complete Cursor-ready prompt
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {["Klantgegevens", "Project Type", "Details", "Prompt"].map((label, idx) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > idx + 1
                  ? "bg-green-500 text-white"
                  : step === idx + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
            </div>
            <span className={`ml-2 text-sm ${step === idx + 1 ? "font-medium text-slate-900" : "text-slate-500"}`}>
              {label}
            </span>
            {idx < 3 && <div className="w-8 md:w-16 h-0.5 bg-slate-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Step 1: Client Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-500" />
              Klantgegevens
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Bedrijfsnaam *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData("companyName", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv: Bakkerij van Dam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contactpersoon *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateFormData("contactName", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv: Jan van Dam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="jan@bakkerijvandam.nl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefoon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="06 12345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type Bedrijf *
                </label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) => updateFormData("businessType", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv: Bakkerij, Coach, Webshop"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Branche *
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => updateFormData("industry", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv: Food & Beverage, Coaching, Retail"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Doelgroep *
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData("targetAudience", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv: Lokale consumenten in Veldhoven, MKB in regio Eindhoven"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Huidige Website (indien van toepassing)
                </label>
                <input
                  type="url"
                  value={formData.currentWebsite}
                  onChange={(e) => updateFormData("currentWebsite", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://www.bestaandewebsite.nl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Type */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-500" />
              Project Type
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateFormData("projectType", type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.projectType === type.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-medium text-slate-900">{type.name}</div>
                  <div className="text-sm text-slate-500">{type.price}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Doelen van de website
              </label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayItem("goals", goal)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      formData.goals.includes(goal)
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } border`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Project Details
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gewenste Features
              </label>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map((feature) => (
                  <button
                    key={feature}
                    onClick={() => toggleArrayItem("features", feature)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      formData.features.includes(feature)
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } border`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Budget Minimum (€)
                </label>
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => updateFormData("budgetMin", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Budget Maximum (€)
                </label>
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => updateFormData("budgetMax", parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => updateFormData("timeline", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="1-2 weken">1-2 weken (spoed)</option>
                <option value="2-4 weken">2-4 weken</option>
                <option value="4-6 weken">4-6 weken</option>
                <option value="6-8 weken">6-8 weken</option>
                <option value="8+ weken">8+ weken</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Content aangeleverd door klant
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "hasLogo", label: "Logo" },
                  { key: "hasTexts", label: "Teksten" },
                  { key: "hasPhotos", label: "Foto's" },
                  { key: "hasBrandColors", label: "Huisstijl" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData[item.key as keyof FormData] as boolean}
                      onChange={(e) => updateFormData(item.key as keyof FormData, e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Inspiratie Websites (1 per regel)
              </label>
              <textarea
                value={formData.inspirationSites}
                onChange={(e) => updateFormData("inspirationSites", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg h-24"
                placeholder="https://voorbeeld1.nl&#10;https://voorbeeld2.nl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Specifieke Wensen
              </label>
              <textarea
                value={formData.specificWishes}
                onChange={(e) => updateFormData("specificWishes", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg h-24"
                placeholder="Eventuele aanvullende wensen of opmerkingen..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Generated Prompt */}
        {step === 4 && generatedPrompt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Gegenereerde Prompt
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Gekopieerd!" : "Kopiëren"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4" />
                  Downloaden
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[500px]">
              <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono">
                {generatedPrompt}
              </pre>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-medium text-green-800 mb-2">Volgende Stappen</h3>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Kopieer de prompt hierboven</li>
                <li>Open Cursor IDE</li>
                <li>Start een nieuw project of open een bestaand project</li>
                <li>Plak de prompt in de chat</li>
                <li>Cursor bouwt het product voor je!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
          {step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-slate-600 hover:text-slate-900"
            >
              Vorige
            </button>
          )}
          {step === 4 && (
            <button
              onClick={() => {
                setStep(1);
                setGeneratedPrompt(null);
              }}
              className="px-6 py-2 text-slate-600 hover:text-slate-900"
            >
              Nieuwe Prompt
            </button>
          )}
          <div className="ml-auto">
            {step < 3 && (
              <button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.companyName || !formData.contactName || !formData.email)) ||
                  (step === 2 && !formData.projectType)
                }
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volgende
              </button>
            )}
            {step === 3 && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Genereren...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Genereer Prompt
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
