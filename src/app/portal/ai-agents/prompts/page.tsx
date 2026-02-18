"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  Search,
  Wand2,
  Copy,
  CheckCircle2,
  Star,
  Clock,
  Euro,
  Users,
} from "lucide-react";

// Master Prompts Data
const masterPrompts = [
  {
    id: "00-klant-intake",
    name: "Klant Intake",
    filename: "00-KLANT-INTAKE.md",
    description: "Template voor het eerste klantgesprek. Verzamel alle benodigde informatie voordat je naar een specifieke pakket-prompt gaat.",
    category: "intake",
    price: null,
    estimatedHours: "0.5-1",
    icon: "📋",
    tags: ["intake", "gesprek", "requirements"],
    isEntryPoint: true,
  },
  {
    id: "01-starter-website",
    name: "Starter Website",
    filename: "01-STARTER-WEBSITE.md",
    description: "One-page website voor ZZP'ers en freelancers. Inclusief contactformulier, WhatsApp button, SEO basis.",
    category: "website",
    price: "€1.295+",
    estimatedHours: "8-16",
    icon: "🚀",
    tags: ["one-page", "zzp", "basic"],
    targetAudience: "ZZP'ers, Freelancers, Starters",
  },
  {
    id: "02-business-website",
    name: "Business Website",
    filename: "02-BUSINESS-WEBSITE.md",
    description: "Professionele bedrijfswebsite met meerdere pagina's, CMS, blog en uitgebreide SEO.",
    category: "website",
    price: "€2.995+",
    estimatedHours: "20-40",
    icon: "🏢",
    tags: ["multi-page", "cms", "blog", "seo"],
    targetAudience: "MKB, Dienstverleners, Professionals",
  },
  {
    id: "03-webshop",
    name: "Webshop",
    filename: "03-WEBSHOP.md",
    description: "Complete e-commerce oplossing met iDEAL, productbeheer, orderbeheer en voorraadbeheer.",
    category: "e-commerce",
    price: "€4.995+",
    estimatedHours: "40-80",
    icon: "🛒",
    tags: ["e-commerce", "ideal", "products", "orders"],
    targetAudience: "Retailers, Webwinkeliers",
  },
  {
    id: "04-maatwerk",
    name: "Maatwerk Web Applicatie",
    filename: "04-MAATWERK-WEB-APPLICATIE.md",
    description: "Custom web applicaties, portals, dashboards. Volledige technische specificatie en architectuur.",
    category: "development",
    price: "€9.995+",
    estimatedHours: "80-200",
    icon: "⚙️",
    tags: ["custom", "portal", "dashboard", "api"],
    targetAudience: "Bedrijven met complexe processen",
  },
  {
    id: "05-automatisering",
    name: "Automatisering (n8n/Make)",
    filename: "05-AUTOMATISERING-N8N.md",
    description: "Workflow automatisering met n8n of Make.com. Van intake tot deployment.",
    category: "automation",
    price: "€695+",
    estimatedHours: "8-24",
    icon: "🤖",
    tags: ["n8n", "make", "workflow", "automation"],
    targetAudience: "Iedereen met repetitieve taken",
  },
  {
    id: "06-pwa",
    name: "Progressive Web App",
    filename: "06-PWA-PROGRESSIVE-WEB-APP.md",
    description: "App-like experience op web. Offline functionaliteit, push notifications, installeerbaar.",
    category: "mobile",
    price: "€2.995+",
    estimatedHours: "16-32",
    icon: "📱",
    tags: ["pwa", "offline", "mobile", "notifications"],
    targetAudience: "Bedrijven die mobile-first willen",
  },
  {
    id: "07-api-integraties",
    name: "API Integraties",
    filename: "07-API-INTEGRATIES.md",
    description: "Systeem koppelingen en API development. REST, OAuth, webhooks.",
    category: "integration",
    price: "€1.495+",
    estimatedHours: "8-24",
    icon: "🔗",
    tags: ["api", "integration", "rest", "webhooks"],
    targetAudience: "Bedrijven met meerdere systemen",
  },
  {
    id: "08-seo",
    name: "SEO Optimalisatie",
    filename: "08-SEO-OPTIMALISATIE.md",
    description: "Complete SEO audit en optimalisatie. Keyword research, on-page, technical SEO.",
    category: "marketing",
    price: "€695+",
    estimatedHours: "8-16",
    icon: "🔍",
    tags: ["seo", "keywords", "ranking", "google"],
    targetAudience: "Bedrijven die hoger willen ranken",
  },
  {
    id: "09-onderhoud",
    name: "Website Onderhoud",
    filename: "09-WEBSITE-ONDERHOUD.md",
    description: "Maandelijks onderhoud: updates, backups, monitoring, support.",
    category: "maintenance",
    price: "€129-495/maand",
    estimatedHours: "1-8/maand",
    icon: "🛠️",
    tags: ["onderhoud", "updates", "backup", "support"],
    targetAudience: "Alle website eigenaren",
    isRecurring: true,
  },
  {
    id: "10-ai-chatbot",
    name: "AI Chatbot",
    filename: "10-AI-CHATBOT.md",
    description: "AI-gedreven chatbot voor klantenservice. GPT-powered, custom training.",
    category: "ai",
    price: "€2.995+",
    estimatedHours: "16-40",
    icon: "💬",
    tags: ["ai", "chatbot", "gpt", "support"],
    targetAudience: "Bedrijven met veel klantvragen",
  },
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  intake: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  website: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  "e-commerce": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  development: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  automation: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  mobile: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
  integration: { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  marketing: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  maintenance: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  ai: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
};

export default function PromptsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = masterPrompts.filter((prompt) => {
    const matchesSearch =
      prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !categoryFilter || prompt.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(masterPrompts.map((p) => p.category))];

  const handleDownload = async (filename: string) => {
    // In production, this would fetch the actual file
    window.open(`/master-prompts/${filename}`, "_blank");
  };

  const handleCopyFilename = (id: string, filename: string) => {
    navigator.clipboard.writeText(`/master-prompts/${filename}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/portal/ai-agents"
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar AI Agents
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            Master Prompts
          </h1>
          <p className="text-slate-600 mt-1">
            Complete Cursor-ready prompts voor elk type project
          </p>
        </div>
        <Link
          href="/portal/ai-agents/prompts/generate"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700"
        >
          <Wand2 className="w-4 h-4" />
          Auto-Genereer Prompt
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Totaal Prompts</div>
          <div className="text-2xl font-bold text-slate-900">{masterPrompts.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Categorieën</div>
          <div className="text-2xl font-bold text-slate-900">{categories.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Prijs Range</div>
          <div className="text-2xl font-bold text-slate-900">€129 - €9.995+</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Gemiddelde Uren</div>
          <div className="text-2xl font-bold text-slate-900">~24 uur</div>
        </div>
      </div>

      {/* Workflow Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg mb-3">Hoe werkt het?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">1. Klant Intake</div>
            <div className="opacity-90">Verzamel alle klantinfo met intake template</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">2. Kies Prompt</div>
            <div className="opacity-90">Selecteer de juiste master prompt</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">3. Vul In</div>
            <div className="opacity-90">Vul klantgegevens in de placeholders</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium mb-1">4. Cursor</div>
            <div className="opacity-90">Plak in Cursor en start ontwikkeling</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Zoek op naam, beschrijving of tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !categoryFilter
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Alle
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  categoryFilter === category
                    ? `${categoryColors[category].bg} ${categoryColors[category].text}`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className={`bg-white rounded-xl border ${categoryColors[prompt.category].border} p-5 hover:shadow-lg transition-shadow ${
              prompt.isEntryPoint ? "ring-2 ring-indigo-500" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{prompt.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-900">{prompt.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[prompt.category].bg} ${categoryColors[prompt.category].text}`}>
                    {prompt.category}
                  </span>
                </div>
              </div>
              {prompt.isEntryPoint && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Start hier
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mb-4 line-clamp-2">
              {prompt.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              {prompt.price && (
                <span className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {prompt.price}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {prompt.estimatedHours} uur
              </span>
              {prompt.targetAudience && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {prompt.targetAudience.split(",")[0]}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {prompt.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(prompt.filename)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handleCopyFilename(prompt.id, prompt.filename)}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                title="Kopieer pad"
              >
                {copiedId === prompt.id ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <Link
                href={`/master-prompts/${prompt.filename}`}
                target="_blank"
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                title="Open in nieuw tabblad"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredPrompts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Geen prompts gevonden voor deze zoekopdracht</p>
        </div>
      )}

      {/* Pro Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Pro Tip
        </h3>
        <p className="text-sm text-amber-700">
          Gebruik de "Auto-Genereer Prompt" functie om automatisch een complete Cursor-ready prompt te maken 
          op basis van klantgegevens. De AI vult alle placeholders voor je in!
        </p>
      </div>
    </div>
  );
}
