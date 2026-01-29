"use client";

import { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  Crown,
  Target,
  Calendar,
  Mail,
  Brain,
  Server,
  Cpu,
  Database,
  Wifi,
  WifiOff,
  ArrowLeft,
  Play,
  Pause,
  Settings,
  BarChart2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Code,
  FileText,
  Gauge,
  Timer,
  CheckCheck,
  XCircle,
  Loader2,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface AgentDetail {
  id: string;
  name: string;
  type: "system" | "service";
  category: string;
  description: string;
  status: "online" | "busy" | "standby" | "offline" | "error";
  health: "healthy" | "degraded" | "unhealthy";
  version: string;
  lastActive: string;
  uptime: number;
  metrics: {
    tasksCompleted: number;
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
    promptsGenerated: number;
    reportsGenerated: number;
  };
  capabilities: string[];
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    status: "success" | "error" | "warning" | "info";
  }>;
}

interface SystemMetrics {
  totalAgents: number;
  onlineAgents: number;
  busyAgents: number;
  offlineAgents: number;
  healthScore: number;
  totalTasksToday: number;
  avgResponseTime: number;
  errorRate: number;
  aiTokensUsed: number;
  lastHealthCheck: string;
  cronJobs: Array<{
    name: string;
    schedule: string;
    lastRun: string | null;
    nextRun: string;
    status: "active" | "paused" | "error";
  }>;
}

// ============================================
// MOCK DATA (wordt vervangen door echte API data)
// ============================================

const mockAgents: AgentDetail[] = [
  // System Agents
  {
    id: "master-agent",
    name: "Master Agent",
    type: "system",
    category: "Coördinatie",
    description: "Centraal brein - coördineert alle agents en genereert dagelijkse briefings",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.9,
    metrics: {
      tasksCompleted: 156,
      avgResponseTime: 245,
      errorRate: 0.2,
      successRate: 99.8,
      promptsGenerated: 89,
      reportsGenerated: 12,
    },
    capabilities: [
      "Dagelijkse briefing generatie",
      "Agent coördinatie",
      "Resource allocatie",
      "Escalatie handling",
    ],
    recentActivity: [
      { id: "1", type: "briefing", message: "Dagelijkse briefing gegenereerd", timestamp: new Date().toISOString(), status: "success" },
      { id: "2", type: "decision", message: "Taak hertoegewezen aan SEO Agent", timestamp: new Date(Date.now() - 3600000).toISOString(), status: "info" },
    ],
  },
  {
    id: "orchestrator-agent",
    name: "Orchestrator Agent",
    type: "system",
    category: "Quality Control",
    description: "Manager van alle agents - monitort prestaties en kwaliteit",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.8,
    metrics: {
      tasksCompleted: 892,
      avgResponseTime: 180,
      errorRate: 0.5,
      successRate: 99.5,
      promptsGenerated: 45,
      reportsGenerated: 24,
    },
    capabilities: [
      "Systeem health monitoring",
      "Performance tracking",
      "Issue detectie",
      "Optimalisatie aanbevelingen",
    ],
    recentActivity: [
      { id: "1", type: "health", message: "Health check voltooid - Score: 94", timestamp: new Date().toISOString(), status: "success" },
      { id: "2", type: "alert", message: "Response time piek gedetecteerd", timestamp: new Date(Date.now() - 1800000).toISOString(), status: "warning" },
    ],
  },
  {
    id: "optimizer-agent",
    name: "Optimizer Agent",
    type: "system",
    category: "Optimalisatie",
    description: "Vindt en implementeert verbeteringen in het hele systeem",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date(Date.now() - 300000).toISOString(),
    uptime: 99.7,
    metrics: {
      tasksCompleted: 67,
      avgResponseTime: 1250,
      errorRate: 1.2,
      successRate: 98.8,
      promptsGenerated: 156,
      reportsGenerated: 8,
    },
    capabilities: [
      "Prompt optimalisatie",
      "Workflow verbetering",
      "A/B testing",
      "Performance tuning",
    ],
    recentActivity: [
      { id: "1", type: "optimization", message: "3 nieuwe optimalisaties ontdekt", timestamp: new Date(Date.now() - 600000).toISOString(), status: "success" },
    ],
  },
  {
    id: "marketing-agent",
    name: "Marketing Agent",
    type: "system",
    category: "Marketing",
    description: "Lead generatie, nurturing en marketing automations",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.6,
    metrics: {
      tasksCompleted: 234,
      avgResponseTime: 890,
      errorRate: 0.8,
      successRate: 99.2,
      promptsGenerated: 312,
      reportsGenerated: 15,
    },
    capabilities: [
      "Lead scoring",
      "Email nurturing",
      "Content generatie",
      "Campagne beheer",
    ],
    recentActivity: [
      { id: "1", type: "lead", message: "Nieuwe lead gescoord: 85 punten", timestamp: new Date().toISOString(), status: "success" },
      { id: "2", type: "email", message: "Follow-up email verzonden", timestamp: new Date(Date.now() - 900000).toISOString(), status: "success" },
    ],
  },
  {
    id: "scheduler-agent",
    name: "Scheduler Agent",
    type: "system",
    category: "Planning",
    description: "Automatische taakplanning en load balancing",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.9,
    metrics: {
      tasksCompleted: 1456,
      avgResponseTime: 45,
      errorRate: 0.1,
      successRate: 99.9,
      promptsGenerated: 12,
      reportsGenerated: 5,
    },
    capabilities: [
      "Taak scheduling",
      "Priority queue",
      "Load balancing",
      "Recurring tasks",
    ],
    recentActivity: [
      { id: "1", type: "schedule", message: "15 taken gepland voor vandaag", timestamp: new Date().toISOString(), status: "info" },
    ],
  },
  // Service Agents
  {
    id: "intake-agent",
    name: "Intake Agent",
    type: "service",
    category: "Sales",
    description: "Lead kwalificatie en requirement gathering",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.5,
    metrics: {
      tasksCompleted: 89,
      avgResponseTime: 560,
      errorRate: 0.5,
      successRate: 99.5,
      promptsGenerated: 178,
      reportsGenerated: 34,
    },
    capabilities: [
      "Lead scoring",
      "Requirement extraction",
      "Package matching",
      "Follow-up emails",
    ],
    recentActivity: [],
  },
  {
    id: "seo-agent",
    name: "SEO Agent",
    type: "service",
    category: "Marketing",
    description: "SEO analyse en optimalisatie",
    status: "standby",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    uptime: 98.5,
    metrics: {
      tasksCompleted: 45,
      avgResponseTime: 2340,
      errorRate: 2.1,
      successRate: 97.9,
      promptsGenerated: 89,
      reportsGenerated: 12,
    },
    capabilities: [
      "Website audit",
      "Keyword research",
      "Content optimalisatie",
      "Ranking tracking",
    ],
    recentActivity: [],
  },
  {
    id: "onderhoud-agent",
    name: "Onderhoud Agent",
    type: "service",
    category: "Support",
    description: "Website onderhoud en monitoring",
    status: "online",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date().toISOString(),
    uptime: 99.8,
    metrics: {
      tasksCompleted: 234,
      avgResponseTime: 890,
      errorRate: 0.3,
      successRate: 99.7,
      promptsGenerated: 56,
      reportsGenerated: 28,
    },
    capabilities: [
      "Security monitoring",
      "Backup verificatie",
      "Performance checks",
      "Update management",
    ],
    recentActivity: [],
  },
  {
    id: "starter-website-agent",
    name: "Starter Website Agent",
    type: "service",
    category: "Development",
    description: "Starter websites bouwen",
    status: "standby",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date(Date.now() - 7200000).toISOString(),
    uptime: 99.0,
    metrics: {
      tasksCompleted: 12,
      avgResponseTime: 45000,
      errorRate: 1.5,
      successRate: 98.5,
      promptsGenerated: 234,
      reportsGenerated: 6,
    },
    capabilities: [],
    recentActivity: [],
  },
  {
    id: "business-website-agent",
    name: "Business Website Agent",
    type: "service",
    category: "Development",
    description: "Business websites bouwen",
    status: "standby",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    uptime: 99.2,
    metrics: {
      tasksCompleted: 8,
      avgResponseTime: 72000,
      errorRate: 0.8,
      successRate: 99.2,
      promptsGenerated: 312,
      reportsGenerated: 4,
    },
    capabilities: [],
    recentActivity: [],
  },
  {
    id: "webshop-agent",
    name: "Webshop Agent",
    type: "service",
    category: "Development",
    description: "E-commerce webshops bouwen",
    status: "standby",
    health: "healthy",
    version: "1.0.0",
    lastActive: new Date(Date.now() - 172800000).toISOString(),
    uptime: 98.8,
    metrics: {
      tasksCompleted: 5,
      avgResponseTime: 120000,
      errorRate: 1.2,
      successRate: 98.8,
      promptsGenerated: 445,
      reportsGenerated: 3,
    },
    capabilities: [],
    recentActivity: [],
  },
];

const mockSystemMetrics: SystemMetrics = {
  totalAgents: 16,
  onlineAgents: 8,
  busyAgents: 2,
  offlineAgents: 0,
  healthScore: 94,
  totalTasksToday: 156,
  avgResponseTime: 342,
  errorRate: 0.8,
  aiTokensUsed: 45678,
  lastHealthCheck: new Date().toISOString(),
  cronJobs: [
    {
      name: "Scheduler Cycle",
      schedule: "Elke minuut",
      lastRun: new Date(Date.now() - 45000).toISOString(),
      nextRun: new Date(Date.now() + 15000).toISOString(),
      status: "active",
    },
    {
      name: "Health Check",
      schedule: "Elke 5 minuten",
      lastRun: new Date(Date.now() - 180000).toISOString(),
      nextRun: new Date(Date.now() + 120000).toISOString(),
      status: "active",
    },
    {
      name: "Daily Briefing",
      schedule: "08:00 dagelijks",
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(new Date().setHours(8, 0, 0, 0) + 86400000).toISOString(),
      status: "active",
    },
  ],
};

// ============================================
// COMPONENTS
// ============================================

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    online: "bg-green-100 text-green-700 border-green-200",
    busy: "bg-blue-100 text-blue-700 border-blue-200",
    standby: "bg-yellow-100 text-yellow-700 border-yellow-200",
    offline: "bg-red-100 text-red-700 border-red-200",
    error: "bg-red-100 text-red-700 border-red-200",
    active: "bg-green-100 text-green-700 border-green-200",
    paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const icons: Record<string, React.ReactNode> = {
    online: <Wifi className="w-3 h-3" />,
    busy: <Loader2 className="w-3 h-3 animate-spin" />,
    standby: <Clock className="w-3 h-3" />,
    offline: <WifiOff className="w-3 h-3" />,
    error: <AlertCircle className="w-3 h-3" />,
    active: <CheckCircle2 className="w-3 h-3" />,
    paused: <Pause className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.offline}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function HealthBadge({ health }: { health: string }) {
  const styles: Record<string, string> = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    unhealthy: "bg-red-500",
  };

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${styles[health] || styles.unhealthy}`} />
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  suffix,
  trend,
  color = "indigo" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}) {
  const colorStyles: Record<string, { bg: string; icon: string }> = {
    indigo: { bg: "bg-indigo-100", icon: "text-indigo-600" },
    green: { bg: "bg-green-100", icon: "text-green-600" },
    amber: { bg: "bg-amber-100", icon: "text-amber-600" },
    red: { bg: "bg-red-100", icon: "text-red-600" },
    blue: { bg: "bg-blue-100", icon: "text-blue-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600" },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`p-2 ${style.bg} rounded-lg`}>
          <div className={style.icon}>{icon}</div>
        </div>
        {trend && (
          <div className={`text-xs ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-400"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900">
          {value}{suffix && <span className="text-sm font-normal text-slate-500">{suffix}</span>}
        </div>
        <div className="text-sm text-slate-600">{label}</div>
      </div>
    </div>
  );
}

function AgentCard({ agent, expanded, onToggle }: { agent: AgentDetail; expanded: boolean; onToggle: () => void }) {
  const typeIcons: Record<string, React.ReactNode> = {
    "master-agent": <Crown className="w-5 h-5 text-amber-500" />,
    "orchestrator-agent": <Activity className="w-5 h-5 text-blue-500" />,
    "optimizer-agent": <Zap className="w-5 h-5 text-purple-500" />,
    "marketing-agent": <TrendingUp className="w-5 h-5 text-green-500" />,
    "scheduler-agent": <Calendar className="w-5 h-5 text-indigo-500" />,
    "intake-agent": <Users className="w-5 h-5 text-cyan-500" />,
    "seo-agent": <Target className="w-5 h-5 text-orange-500" />,
    "onderhoud-agent": <RefreshCw className="w-5 h-5 text-slate-500" />,
  };

  const statusColors: Record<string, string> = {
    online: "border-l-green-500",
    busy: "border-l-blue-500",
    standby: "border-l-yellow-500",
    offline: "border-l-red-500",
    error: "border-l-red-500",
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${statusColors[agent.status]} overflow-hidden transition-all`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-100 rounded-lg">
            {typeIcons[agent.id] || <Bot className="w-5 h-5 text-slate-500" />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{agent.name}</span>
              <HealthBadge health={agent.health} />
            </div>
            <div className="text-sm text-slate-600">{agent.category}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{agent.metrics.tasksCompleted}</span> taken
            </div>
            <div className="text-xs text-slate-500">
              {agent.metrics.avgResponseTime}ms avg
            </div>
          </div>
          <StatusBadge status={agent.status} />
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Informatie</h4>
              <p className="text-sm text-slate-600 mb-3">{agent.description}</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Versie</span>
                  <span className="text-slate-900">{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Uptime</span>
                  <span className="text-slate-900">{agent.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Laatst actief</span>
                  <span className="text-slate-900">
                    {new Date(agent.lastActive).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Prestaties</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{agent.metrics.successRate}%</div>
                  <div className="text-xs text-slate-500">Success Rate</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{agent.metrics.errorRate}%</div>
                  <div className="text-xs text-slate-500">Error Rate</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{agent.metrics.promptsGenerated}</div>
                  <div className="text-xs text-slate-500">Prompts</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{agent.metrics.reportsGenerated}</div>
                  <div className="text-xs text-slate-500">Reports</div>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Capabilities</h4>
              {agent.capabilities.length > 0 ? (
                <ul className="space-y-1">
                  {agent.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">Capabilities laden...</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {agent.recentActivity.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Recente Activiteit</h4>
              <div className="space-y-2">
                {agent.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 text-sm">
                    {activity.status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {activity.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
                    {activity.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                    {activity.status === "info" && <Activity className="w-4 h-4 text-blue-500" />}
                    <span className="text-slate-600">{activity.message}</span>
                    <span className="text-slate-400 text-xs">
                      {new Date(activity.timestamp).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CronJobCard({ job }: { job: SystemMetrics["cronJobs"][0] }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded ${job.status === "active" ? "bg-green-100" : "bg-yellow-100"}`}>
          {job.status === "active" ? (
            <Play className="w-4 h-4 text-green-600" />
          ) : (
            <Pause className="w-4 h-4 text-yellow-600" />
          )}
        </div>
        <div>
          <div className="font-medium text-slate-900 text-sm">{job.name}</div>
          <div className="text-xs text-slate-500">{job.schedule}</div>
        </div>
      </div>
      <div className="text-right text-xs">
        <div className="text-slate-600">
          Laatste: {job.lastRun ? new Date(job.lastRun).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "-"}
        </div>
        <div className="text-slate-500">
          Volgende: {new Date(job.nextRun).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MonitoringPage() {
  const [agents, setAgents] = useState<AgentDetail[]>(mockAgents);
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set(["master-agent"]));
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<"all" | "system" | "service">("all");

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/ai-agents/monitoring");
      const result = await response.json();
      
      if (result.success && result.data) {
        setAgents(result.data.agents);
        setMetrics(result.data.systemMetrics);
      }
    } catch (error) {
      console.error("Failed to fetch monitoring data:", error);
      // Keep existing data on error
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchData, autoRefresh]);

  const toggleAgent = (agentId: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  const filteredAgents = agents.filter(agent => {
    if (filter === "all") return true;
    return agent.type === filter;
  });

  const systemAgents = filteredAgents.filter(a => a.type === "system");
  const serviceAgents = filteredAgents.filter(a => a.type === "service");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/portal/ai-agents"
              className="p-1 rounded hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Gauge className="w-7 h-7 text-indigo-600" />
              Agent Monitoring
            </h1>
          </div>
          <p className="text-slate-600 ml-9">
            Real-time overzicht van alle {metrics.totalAgents} AI agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              autoRefresh
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            {autoRefresh ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Auto-refresh aan
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Auto-refresh uit
              </>
            )}
          </button>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Vernieuwen
          </button>
        </div>
      </div>

      {/* System Health Banner */}
      <div className={`rounded-xl p-6 ${
        metrics.healthScore >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
        metrics.healthScore >= 70 ? "bg-gradient-to-r from-yellow-500 to-amber-600" :
        "bg-gradient-to-r from-red-500 to-rose-600"
      } text-white`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Systeem Gezondheid</h2>
              <p className="opacity-90">
                {metrics.healthScore >= 90 ? "Alle systemen operationeel" :
                 metrics.healthScore >= 70 ? "Kleine problemen gedetecteerd" :
                 "Kritieke issues vereisen aandacht"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{metrics.healthScore}</div>
              <div className="text-sm opacity-90">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">{metrics.onlineAgents}/{metrics.totalAgents}</div>
              <div className="text-sm opacity-90">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={<CheckCheck className="w-5 h-5" />}
          label="Taken Vandaag"
          value={metrics.totalTasksToday}
          color="green"
          trend="up"
        />
        <MetricCard
          icon={<Timer className="w-5 h-5" />}
          label="Gem. Response"
          value={metrics.avgResponseTime}
          suffix="ms"
          color="blue"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Error Rate"
          value={metrics.errorRate}
          suffix="%"
          color={metrics.errorRate > 2 ? "red" : "green"}
        />
        <MetricCard
          icon={<Cpu className="w-5 h-5" />}
          label="Busy Agents"
          value={metrics.busyAgents}
          color="amber"
        />
        <MetricCard
          icon={<Brain className="w-5 h-5" />}
          label="AI Tokens"
          value={(metrics.aiTokensUsed / 1000).toFixed(1)}
          suffix="K"
          color="purple"
        />
        <MetricCard
          icon={<Database className="w-5 h-5" />}
          label="Offline"
          value={metrics.offlineAgents}
          color={metrics.offlineAgents > 0 ? "red" : "green"}
        />
      </div>

      {/* Cron Jobs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Vercel Cron Jobs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {metrics.cronJobs.map((job, i) => (
            <CronJobCard key={i} job={job} />
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all" ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Alle Agents ({agents.length})
        </button>
        <button
          onClick={() => setFilter("system")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "system" ? "bg-amber-100 text-amber-700" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          System ({agents.filter(a => a.type === "system").length})
        </button>
        <button
          onClick={() => setFilter("service")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "service" ? "bg-cyan-100 text-cyan-700" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Service ({agents.filter(a => a.type === "service").length})
        </button>
      </div>

      {/* System Agents */}
      {(filter === "all" || filter === "system") && systemAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            System Agents
            <span className="text-sm font-normal text-slate-500">
              ({systemAgents.filter(a => a.status === "online").length}/{systemAgents.length} online)
            </span>
          </h3>
          <div className="space-y-3">
            {systemAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                expanded={expandedAgents.has(agent.id)}
                onToggle={() => toggleAgent(agent.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Service Agents */}
      {(filter === "all" || filter === "service") && serviceAgents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-500" />
            Service Agents
            <span className="text-sm font-normal text-slate-500">
              ({serviceAgents.filter(a => a.status === "online").length}/{serviceAgents.length} online)
            </span>
          </h3>
          <div className="space-y-3">
            {serviceAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                expanded={expandedAgents.has(agent.id)}
                onToggle={() => toggleAgent(agent.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
        <Clock className="w-4 h-4 inline mr-1" />
        Laatste update: {new Date(metrics.lastHealthCheck).toLocaleString("nl-NL")}
        {autoRefresh && (
          <span className="ml-2 text-green-600">
            • Auto-refresh actief (30s)
          </span>
        )}
      </div>
    </div>
  );
}
