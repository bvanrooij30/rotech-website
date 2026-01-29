"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Activity,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Crown,
  Target,
  BarChart3,
  Calendar,
  Mail,
  Brain,
} from "lucide-react";

interface SystemStatus {
  mode: string;
  health: string;
  overallScore: number;
  uptime: number;
  lastHealthCheck: string;
}

interface Agent {
  id: string;
  name: string;
  type: string;
  role: string;
  status: string;
  lastActive: string;
  metrics: Record<string, number>;
}

interface Metrics {
  totalAgents: number;
  onlineAgents: number;
  tasksCompletedToday: number;
  activeLeads: number;
  revenuePipeline: number;
}

interface DebugInfo {
  heartbeatCount: number;
  lastUpdate: string;
  dataSource: string;
  isRealData: boolean;
}

interface AgentData {
  systemAgents: Agent[];
  serviceAgents: Agent[];
  systemStatus: SystemStatus;
  metrics: Metrics;
  _debug?: DebugInfo;
}

const statusColors: Record<string, string> = {
  online: "bg-green-100 text-green-700",
  standby: "bg-yellow-100 text-yellow-700",
  offline: "bg-red-100 text-red-700",
  busy: "bg-blue-100 text-blue-700",
};

const healthColors: Record<string, string> = {
  excellent: "text-green-600",
  good: "text-green-500",
  fair: "text-yellow-600",
  poor: "text-orange-600",
  critical: "text-red-600",
};

const agentIcons: Record<string, React.ReactNode> = {
  "master-agent": <Crown className="w-5 h-5 text-amber-500" />,
  "orchestrator-agent": <Activity className="w-5 h-5 text-blue-500" />,
  "optimizer-agent": <Zap className="w-5 h-5 text-purple-500" />,
  "marketing-agent": <TrendingUp className="w-5 h-5 text-green-500" />,
  "scheduler-agent": <Calendar className="w-5 h-5 text-indigo-500" />,
  "intake-agent": <Users className="w-5 h-5 text-cyan-500" />,
  "seo-agent": <Target className="w-5 h-5 text-orange-500" />,
  "onderhoud-agent": <RefreshCw className="w-5 h-5 text-slate-500" />,
};

export default function AIAgentsPage() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/ai-agents");
      const result = await response.json();
      
      if (result.success) {
        // Include debug info in data
        setData({
          ...result.data,
          _debug: result._debug,
        });
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Kon agent data niet laden");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="w-12 h-12 text-indigo-500 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600">AI Agents laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error || "Geen data beschikbaar"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-indigo-600" />
            AI Agent Team
          </h1>
          <p className="text-slate-600 mt-1">
            Autonoom systeem met {data.metrics.totalAgents} agents
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Vernieuwen
        </button>
      </div>

      {/* System Status Banner */}
      <div className={`rounded-xl p-6 ${
        data.systemStatus.health === "excellent" ? "bg-gradient-to-r from-green-500 to-emerald-600" :
        data.systemStatus.health === "good" ? "bg-gradient-to-r from-green-400 to-emerald-500" :
        data.systemStatus.health === "fair" ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
        "bg-gradient-to-r from-red-500 to-rose-600"
      } text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6" />
              <span className="text-lg font-semibold">
                Systeem Status: {data.systemStatus.health.toUpperCase()}
              </span>
            </div>
            <p className="opacity-90">
              Mode: {data.systemStatus.mode} | Score: {data.systemStatus.overallScore}/100 | Uptime: {data.systemStatus.uptime}%
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{data.metrics.onlineAgents}/{data.metrics.totalAgents}</div>
            <div className="text-sm opacity-90">Agents Online</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {data.metrics.tasksCompletedToday}
              </div>
              <div className="text-sm text-slate-600">Taken Vandaag</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {data.metrics.activeLeads}
              </div>
              <div className="text-sm text-slate-600">Actieve Leads</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                €{data.metrics.revenuePipeline.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Pipeline Waarde</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {data.systemStatus.overallScore}%
              </div>
              <div className="text-sm text-slate-600">Health Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/portal/ai-agents/monitoring"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Live Monitoring</div>
                <div className="text-sm text-slate-600">Alle agents real-time</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/portal/ai-agents/briefing"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Dagelijkse Briefing</div>
                <div className="text-sm text-slate-600">Overzicht & aanbevelingen</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/portal/ai-agents/leads"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Leads Beheren</div>
                <div className="text-sm text-slate-600">{data.metrics.activeLeads} actieve leads</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
          </div>
        </Link>

        <Link
          href="/portal/ai-agents/marketing"
          className="bg-white rounded-xl border border-slate-200 p-5 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">Marketing Hub</div>
                <div className="text-sm text-slate-600">Campagnes & content</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* System Agents */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            System Agents
          </h2>
          <p className="text-sm text-slate-600">Kern van het autonome systeem</p>
        </div>
        <div className="divide-y divide-slate-100">
          {data.systemAgents.map((agent) => (
            <div key={agent.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    {agentIcons[agent.id] || <Bot className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{agent.name}</div>
                    <div className="text-sm text-slate-600">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    {Object.entries(agent.metrics).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-slate-600">
                        {key.replace(/([A-Z])/g, " $1").trim()}: <span className="font-medium text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[agent.status] || "bg-slate-100 text-slate-700"}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Agents */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-500" />
            Service Agents
          </h2>
          <p className="text-sm text-slate-600">Klantgerichte dienstverlening</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {data.serviceAgents.map((agent) => (
            <div
              key={agent.id}
              className={`p-4 rounded-lg border ${
                agent.status === "online"
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {agentIcons[agent.id] || <Bot className="w-4 h-4 text-slate-500" />}
                  <span className="font-medium text-slate-900 text-sm">{agent.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                  {agent.status}
                </span>
              </div>
              <div className="text-xs text-slate-600">{agent.role}</div>
              <div className="mt-2 pt-2 border-t border-slate-200/50 text-xs text-slate-500">
                {Object.entries(agent.metrics).map(([key, value]) => (
                  <span key={key} className="mr-3">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-slate-500">
        <Clock className="w-4 h-4 inline mr-1" />
        Laatste update: {new Date(data.systemStatus.lastHealthCheck).toLocaleString("nl-NL")}
      </div>

      {/* Data Source Indicator */}
      {data._debug && (
        <div className={`mt-4 p-4 rounded-xl border ${
          data._debug.isRealData 
            ? "bg-green-50 border-green-200" 
            : "bg-yellow-50 border-yellow-200"
        }`}>
          <div className="flex items-center justify-center gap-2 text-sm">
            {data._debug.isRealData ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Live Data - Heartbeat Systeem Actief
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">
                  Demo Data - Agents niet verbonden
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-center mt-1 opacity-75">
            Bron: {data._debug.dataSource} | Heartbeats: {data._debug.heartbeatCount}
          </div>
        </div>
      )}
    </div>
  );
}
