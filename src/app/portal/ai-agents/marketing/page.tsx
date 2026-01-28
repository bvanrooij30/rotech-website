"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Mail,
  Share2,
  PenTool,
  BarChart3,
  Calendar,
  Users,
  Target,
  Zap,
  FileText,
  Send,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";

// Demo campaign data
const campaigns = [
  {
    id: "camp-1",
    name: "Q1 LinkedIn Campagne",
    type: "social",
    status: "active",
    budget: { allocated: 500, spent: 245 },
    metrics: { impressions: 12500, clicks: 340, leads: 8, ctr: 2.7 },
    startDate: "2026-01-01",
  },
  {
    id: "camp-2",
    name: "Content Marketing Blog",
    type: "content",
    status: "active",
    budget: { allocated: 200, spent: 120 },
    metrics: { impressions: 3200, clicks: 180, leads: 3, ctr: 5.6 },
    startDate: "2026-01-15",
  },
  {
    id: "camp-3",
    name: "Email Nurture Sequence",
    type: "email",
    status: "active",
    budget: { allocated: 0, spent: 0 },
    metrics: { impressions: 450, clicks: 145, leads: 5, ctr: 32.2 },
    startDate: "2025-12-01",
  },
];

const contentIdeas = [
  {
    id: "idea-1",
    type: "blog",
    title: "Waarom een professionele website essentieel is voor MKB in 2026",
    status: "published",
    impact: "high",
  },
  {
    id: "idea-2",
    type: "social",
    title: "5 fouten die ondernemers maken bij hun website",
    status: "scheduled",
    impact: "high",
  },
  {
    id: "idea-3",
    type: "email",
    title: "Case study: Hoe Bakkerij Van Dijk 3x meer bestellingen kreeg",
    status: "idea",
    impact: "medium",
  },
  {
    id: "idea-4",
    type: "blog",
    title: "Hoeveel kost een webshop? Complete prijsgids 2026",
    status: "in-progress",
    impact: "high",
  },
  {
    id: "idea-5",
    type: "social",
    title: "SEO tips voor lokale ondernemers",
    status: "idea",
    impact: "medium",
  },
];

const emailSequences = [
  {
    id: "seq-1",
    name: "Lead Nurture",
    trigger: "Nieuwe lead",
    emails: 3,
    status: "active",
    metrics: { sent: 145, opened: 78, clicked: 34, converted: 8 },
  },
  {
    id: "seq-2",
    name: "Welkom Klant",
    trigger: "Project gestart",
    emails: 5,
    status: "active",
    metrics: { sent: 45, opened: 38, clicked: 22, converted: 12 },
  },
  {
    id: "seq-3",
    name: "Re-engagement",
    trigger: "30 dagen inactief",
    emails: 4,
    status: "paused",
    metrics: { sent: 23, opened: 8, clicked: 3, converted: 1 },
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700" },
  paused: { bg: "bg-yellow-100", text: "text-yellow-700" },
  draft: { bg: "bg-slate-100", text: "text-slate-700" },
  completed: { bg: "bg-blue-100", text: "text-blue-700" },
};

const contentStatusColors: Record<string, { bg: string; text: string }> = {
  idea: { bg: "bg-slate-100", text: "text-slate-600" },
  "in-progress": { bg: "bg-yellow-100", text: "text-yellow-700" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700" },
  published: { bg: "bg-green-100", text: "text-green-700" },
};

const typeIcons: Record<string, React.ReactNode> = {
  blog: <FileText className="w-4 h-4" />,
  social: <Share2 className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  content: <PenTool className="w-4 h-4" />,
};

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "content" | "email">("campaigns");

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
            <TrendingUp className="w-8 h-8 text-purple-600" />
            Marketing Hub
          </h1>
          <p className="text-slate-600 mt-1">
            Automatisch beheerd door Marketing Agent
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Nieuwe Campagne
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Actieve Campagnes</div>
          <div className="text-2xl font-bold text-slate-900">3</div>
          <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +2 deze maand
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Leads Gegenereerd</div>
          <div className="text-2xl font-bold text-slate-900">16</div>
          <div className="text-xs text-green-600 mt-1">Deze maand</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Email Open Rate</div>
          <div className="text-2xl font-bold text-slate-900">32%</div>
          <div className="text-xs text-slate-500 mt-1">Industry avg: 21%</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Budget Gebruikt</div>
          <div className="text-2xl font-bold text-slate-900">€365</div>
          <div className="text-xs text-slate-500 mt-1">van €700 totaal</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {[
            { id: "campaigns", label: "Campagnes", icon: Target },
            { id: "content", label: "Content", icon: PenTool },
            { id: "email", label: "Email Sequences", icon: Mail },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    campaign.type === "social" ? "bg-blue-100" :
                    campaign.type === "content" ? "bg-green-100" :
                    "bg-purple-100"
                  }`}>
                    {typeIcons[campaign.type]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{campaign.name}</div>
                    <div className="text-sm text-slate-500">
                      Gestart: {new Date(campaign.startDate).toLocaleDateString("nl-NL")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status].bg} ${statusColors[campaign.status].text}`}>
                    {campaign.status}
                  </span>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    {campaign.status === "active" ? (
                      <Pause className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Play className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Impressies</div>
                  <div className="font-semibold text-slate-900">
                    {campaign.metrics.impressions.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Clicks</div>
                  <div className="font-semibold text-slate-900">
                    {campaign.metrics.clicks.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">CTR</div>
                  <div className="font-semibold text-slate-900">{campaign.metrics.ctr}%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Leads</div>
                  <div className="font-semibold text-green-600">{campaign.metrics.leads}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Budget</div>
                  <div className="font-semibold text-slate-900">
                    €{campaign.budget.spent} / €{campaign.budget.allocated}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "content" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI Content Generator
            </h3>
            <p className="text-sm opacity-90 mb-4">
              Laat de Marketing Agent automatisch content ideeën genereren op basis van trending topics en je doelgroep.
            </p>
            <button className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-slate-100">
              Genereer Content Ideeën
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Content Pipeline</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {contentIdeas.map((idea) => (
                <div key={idea.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        idea.type === "blog" ? "bg-orange-100 text-orange-600" :
                        idea.type === "social" ? "bg-blue-100 text-blue-600" :
                        "bg-purple-100 text-purple-600"
                      }`}>
                        {typeIcons[idea.type]}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{idea.title}</div>
                        <div className="text-xs text-slate-500 capitalize">{idea.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        idea.impact === "high" ? "bg-green-100 text-green-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {idea.impact} impact
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${contentStatusColors[idea.status].bg} ${contentStatusColors[idea.status].text}`}>
                        {idea.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "email" && (
        <div className="space-y-4">
          {emailSequences.map((sequence) => (
            <div key={sequence.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{sequence.name}</div>
                    <div className="text-sm text-slate-500">
                      Trigger: {sequence.trigger} • {sequence.emails} emails
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[sequence.status].bg} ${statusColors[sequence.status].text}`}>
                  {sequence.status}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Verzonden</div>
                  <div className="font-semibold text-slate-900">{sequence.metrics.sent}</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Geopend</div>
                  <div className="font-semibold text-slate-900">
                    {sequence.metrics.opened}
                    <span className="text-xs text-slate-500 ml-1">
                      ({Math.round((sequence.metrics.opened / sequence.metrics.sent) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Geklikt</div>
                  <div className="font-semibold text-slate-900">
                    {sequence.metrics.clicked}
                    <span className="text-xs text-slate-500 ml-1">
                      ({Math.round((sequence.metrics.clicked / sequence.metrics.opened) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xs text-green-600">Geconverteerd</div>
                  <div className="font-semibold text-green-700">{sequence.metrics.converted}</div>
                </div>
              </div>
            </div>
          ))}

          <button className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Nieuwe Email Sequence
          </button>
        </div>
      )}

      {/* AI Assistant */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          Marketing Agent Aanbevelingen
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <CheckCircle2 className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-medium text-amber-800">LinkedIn levert beste resultaten</div>
              <div className="text-sm text-amber-700">
                Overweeg om budget te herverdelen naar LinkedIn campagne (CTR 2.7% vs avg 1.5%)
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800">Beste verzendtijd emails: Dinsdag 10:00</div>
              <div className="text-sm text-blue-700">
                Emails verzonden op dinsdag hebben 40% hogere open rate
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Target className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-800">Focus op webshop content</div>
              <div className="text-sm text-green-700">
                "Webshop" gerelateerde content heeft hoogste conversie naar leads
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
