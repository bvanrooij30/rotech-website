"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Mail,
  Target,
  Lightbulb,
  ChevronRight,
  Bell,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface Briefing {
  date: string;
  generatedAt: string;
  summary: {
    health: string;
    healthScore: number;
    highlights: string[];
    concerns: string[];
  };
  tasks: {
    completed: number;
    scheduled: number;
    overdue: number;
    completionRate: number;
  };
  projects: {
    active: number;
    completedThisWeek: number;
    atRisk: number;
  };
  marketing: {
    newLeads: number;
    qualifiedLeads: number;
    activeCampaigns: number;
    topChannel: string;
    emailsSent: number;
    openRate: number;
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    errorRate: number;
    promptQuality: number;
  };
  recommendations: Array<{
    priority: string;
    title: string;
    description: string;
    action: string;
  }>;
  actionItems: Array<{
    id: string;
    priority: number;
    title: string;
    description: string;
    assignedTo: string;
    status: string;
  }>;
  alerts: Array<{
    id: string;
    level: string;
    title: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const alertLevelColors: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  error: "bg-red-50 border-red-200 text-red-700",
  critical: "bg-red-100 border-red-300 text-red-800",
};

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-agents/briefing");
      const result = await response.json();
      
      if (result.success) {
        setBriefing(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Kon briefing niet laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Briefing genereren...</p>
        </div>
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error || "Geen briefing beschikbaar"}</p>
      </div>
    );
  }

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
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            Dagelijkse Briefing
          </h1>
          <p className="text-slate-600 mt-1">
            {new Date(briefing.date).toLocaleDateString("nl-NL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <button
          onClick={fetchBriefing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" />
          Vernieuwen
        </button>
      </div>

      {/* Health Score */}
      <div className={`rounded-xl p-6 ${
        briefing.summary.healthScore >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
        briefing.summary.healthScore >= 70 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
        briefing.summary.healthScore >= 50 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
        "bg-gradient-to-r from-red-500 to-rose-600"
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2">Systeem Gezondheid</h2>
            <p className="opacity-90">
              Status: {briefing.summary.health.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{briefing.summary.healthScore}</div>
            <div className="text-sm opacity-90">Health Score</div>
          </div>
        </div>
      </div>

      {/* Highlights & Concerns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Highlights
          </h3>
          <ul className="space-y-3">
            {briefing.summary.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-green-500 mt-0.5">✓</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Aandachtspunten
          </h3>
          {briefing.summary.concerns.length > 0 ? (
            <ul className="space-y-3">
              {briefing.summary.concerns.map((concern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-amber-500 mt-0.5">!</span>
                  {concern}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Geen aandachtspunten</p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Taken Voltooid</div>
          <div className="text-2xl font-bold text-slate-900">{briefing.tasks.completed}</div>
          <div className="text-xs text-green-600 mt-1">
            {briefing.tasks.completionRate}% completion rate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Nieuwe Leads</div>
          <div className="text-2xl font-bold text-slate-900">{briefing.marketing.newLeads}</div>
          <div className="text-xs text-indigo-600 mt-1">
            {briefing.marketing.qualifiedLeads} gekwalificeerd
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Actieve Projecten</div>
          <div className="text-2xl font-bold text-slate-900">{briefing.projects.active}</div>
          <div className="text-xs text-slate-500 mt-1">
            {briefing.projects.completedThisWeek} deze week voltooid
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-slate-900">{briefing.performance.successRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {briefing.performance.errorRate}% error rate
          </div>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Marketing Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Top Kanaal</div>
            <div className="font-semibold text-slate-900">{briefing.marketing.topChannel}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Actieve Campagnes</div>
            <div className="font-semibold text-slate-900">{briefing.marketing.activeCampaigns}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Emails Verzonden</div>
            <div className="font-semibold text-slate-900">{briefing.marketing.emailsSent}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-500">Open Rate</div>
            <div className="font-semibold text-slate-900">{briefing.marketing.openRate}%</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Aanbevelingen
        </h3>
        <div className="space-y-3">
          {briefing.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${priorityColors[rec.priority]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{rec.title}</div>
                  <div className="text-sm mt-1 opacity-80">{rec.description}</div>
                  <div className="text-xs mt-2 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {rec.action}
                  </div>
                </div>
                <span className="text-xs font-medium uppercase px-2 py-1 rounded">
                  {rec.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-red-500" />
          Actie Items
        </h3>
        <div className="space-y-3">
          {briefing.actionItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.priority === 1 ? "bg-red-500 text-white" :
                  item.priority === 2 ? "bg-amber-500 text-white" :
                  "bg-slate-400 text-white"
                }`}>
                  {item.priority}
                </div>
                <div>
                  <div className="font-medium text-slate-900 text-sm">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                  item.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {briefing.alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-indigo-500" />
            Alerts
          </h3>
          <div className="space-y-3">
            {briefing.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${alertLevelColors[alert.level]}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm mt-1">{alert.message}</div>
                  </div>
                  <div className="text-xs">
                    {new Date(alert.timestamp).toLocaleTimeString("nl-NL")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-slate-500">
        <Clock className="w-4 h-4 inline mr-1" />
        Gegenereerd: {new Date(briefing.generatedAt).toLocaleString("nl-NL")}
      </div>
    </div>
  );
}
