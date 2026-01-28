/**
 * RoTech AI Agents - Dashboard Component
 * React component voor het AI Agents dashboard in de portal
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Folder, 
  RefreshCw,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Bot,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface AgentInfo {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  lastActive: Date;
  activeProjects: number;
  metrics: {
    projectsCompleted: number;
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
    promptsGenerated: number;
    reportsGenerated: number;
  };
}

interface DashboardData {
  agents: {
    total: number;
    active: number;
    idle: number;
    error: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  logs: {
    total: number;
    errors: number;
    warnings: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    agentId: string;
  }>;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  agentId: string;
  message: string;
}

// ============================================
// MOCK DATA (Replace with actual API calls)
// ============================================

const MOCK_AGENTS: AgentInfo[] = [
  {
    id: 'intake-agent',
    name: 'Intake Agent',
    type: 'intake',
    version: '1.0.0',
    status: 'idle',
    lastActive: new Date(),
    activeProjects: 2,
    metrics: {
      projectsCompleted: 45,
      avgResponseTime: 234,
      errorRate: 1.2,
      successRate: 98.8,
      promptsGenerated: 156,
      reportsGenerated: 89,
    },
  },
  {
    id: 'seo-agent',
    name: 'SEO Agent',
    type: 'seo',
    version: '1.0.0',
    status: 'busy',
    lastActive: new Date(),
    activeProjects: 5,
    metrics: {
      projectsCompleted: 32,
      avgResponseTime: 1250,
      errorRate: 0.5,
      successRate: 99.5,
      promptsGenerated: 278,
      reportsGenerated: 67,
    },
  },
  {
    id: 'onderhoud-agent',
    name: 'Onderhoud Agent',
    type: 'onderhoud',
    version: '1.0.0',
    status: 'idle',
    lastActive: new Date(Date.now() - 300000),
    activeProjects: 12,
    metrics: {
      projectsCompleted: 120,
      avgResponseTime: 450,
      errorRate: 0.8,
      successRate: 99.2,
      promptsGenerated: 89,
      reportsGenerated: 156,
    },
  },
];

const MOCK_DASHBOARD: DashboardData = {
  agents: { total: 11, active: 2, idle: 8, error: 1 },
  projects: { total: 47, active: 12, completed: 32, onHold: 3 },
  logs: { total: 15420, errors: 23, warnings: 156 },
  recentActivity: [
    { type: 'info', message: 'SEO audit voltooid voor client-website.nl', timestamp: new Date(), agentId: 'seo-agent' },
    { type: 'info', message: 'Nieuwe lead gescored: 78/100 (warm)', timestamp: new Date(Date.now() - 60000), agentId: 'intake-agent' },
    { type: 'warn', message: 'SSL certificaat verloopt binnen 14 dagen', timestamp: new Date(Date.now() - 120000), agentId: 'onderhoud-agent' },
    { type: 'info', message: 'Backup succesvol gemaakt: 256 MB', timestamp: new Date(Date.now() - 180000), agentId: 'onderhoud-agent' },
    { type: 'error', message: 'API rate limit bereikt voor externe service', timestamp: new Date(Date.now() - 240000), agentId: 'seo-agent' },
  ],
};

// ============================================
// UTILITY COMPONENTS
// ============================================

const StatusBadge: React.FC<{ status: AgentInfo['status'] }> = ({ status }) => {
  const styles = {
    idle: 'bg-gray-100 text-gray-700',
    busy: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700',
    offline: 'bg-gray-200 text-gray-500',
  };

  const labels = {
    idle: 'Idle',
    busy: 'Actief',
    error: 'Error',
    offline: 'Offline',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}> = ({ title, value, icon, trend, className = '' }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs vorige week
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
    </div>
  </div>
);

const LogLevelBadge: React.FC<{ level: LogEntry['level'] }> = ({ level }) => {
  const styles = {
    debug: 'text-gray-400',
    info: 'text-blue-500',
    warn: 'text-yellow-500',
    error: 'text-red-500',
    critical: 'text-red-700 font-bold',
  };

  return (
    <span className={`text-xs uppercase font-medium ${styles[level]}`}>
      {level}
    </span>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentInfo[]>(MOCK_AGENTS);
  const [dashboard, setDashboard] = useState<DashboardData>(MOCK_DASHBOARD);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'logs' | 'projects'>('overview');

  const refreshData = async () => {
    setIsLoading(true);
    // In production, fetch from API
    // const response = await fetch('/api/ai-agents/dashboard');
    // const data = await response.json();
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
    // Set up polling interval
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Agents Dashboard</h1>
              <p className="text-sm text-gray-500">Ro-Tech Development</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          {(['overview', 'agents', 'logs', 'projects'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'overview' && 'Overzicht'}
              {tab === 'agents' && 'Agents'}
              {tab === 'logs' && 'Logs'}
              {tab === 'projects' && 'Projecten'}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Actieve Agents"
                value={`${dashboard.agents.active}/${dashboard.agents.total}`}
                icon={<Bot className="w-6 h-6" />}
                trend={{ value: 12, positive: true }}
              />
              <StatCard
                title="Lopende Projecten"
                value={dashboard.projects.active}
                icon={<Folder className="w-6 h-6" />}
                trend={{ value: 8, positive: true }}
              />
              <StatCard
                title="Errors (24u)"
                value={dashboard.logs.errors}
                icon={<AlertTriangle className="w-6 h-6" />}
                className={dashboard.logs.errors > 10 ? 'border-red-200' : ''}
              />
              <StatCard
                title="Voltooide Projecten"
                value={dashboard.projects.completed}
                icon={<CheckCircle className="w-6 h-6" />}
                trend={{ value: 15, positive: true }}
              />
            </div>

            {/* Agent Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Agent Status</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        agent.status === 'busy' ? 'bg-blue-100' :
                        agent.status === 'error' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <Zap className={`w-5 h-5 ${
                          agent.status === 'busy' ? 'text-blue-600' :
                          agent.status === 'error' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <p className="text-sm text-gray-500">v{agent.version} • {agent.activeProjects} actieve projecten</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-900">{agent.metrics.successRate}% succes</p>
                        <p className="text-gray-500">{agent.metrics.avgResponseTime}ms gem.</p>
                      </div>
                      <StatusBadge status={agent.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recente Activiteit</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {dashboard.recentActivity.map((activity, index) => (
                  <div key={index} className="px-6 py-3 flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'error' ? 'bg-red-500' :
                      activity.type === 'warn' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.agentId} • {new Date(activity.timestamp).toLocaleTimeString('nl-NL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      agent.status === 'busy' ? 'bg-blue-100' :
                      agent.status === 'error' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <Bot className={`w-6 h-6 ${
                        agent.status === 'busy' ? 'text-blue-600' :
                        agent.status === 'error' ? 'text-red-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">v{agent.version}</p>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Projecten</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.metrics.projectsCompleted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Succes Rate</p>
                    <p className="text-lg font-semibold text-green-600">{agent.metrics.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Prompts</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.metrics.promptsGenerated}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rapporten</p>
                    <p className="text-lg font-semibold text-gray-900">{agent.metrics.reportsGenerated}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Laatst actief: {new Date(agent.lastActive).toLocaleString('nl-NL')}
                  </p>
                </div>
              </div>
            ))}

            {/* Placeholder cards for unimplemented agents */}
            {['Starter Website', 'Business Website', 'Webshop', 'Maatwerk', 'Automatisering', 'PWA', 'API Integratie', 'Chatbot'].map((name) => (
              <div
                key={name}
                className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center min-h-[200px]"
              >
                <Bot className="w-8 h-8 text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-500">{name} Agent</h3>
                <p className="text-sm text-gray-400 mt-1">Binnenkort beschikbaar</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">System Logs</h2>
              <div className="flex gap-2">
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                  <option value="">Alle levels</option>
                  <option value="error">Errors</option>
                  <option value="warn">Warnings</option>
                  <option value="info">Info</option>
                </select>
                <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
                  <option value="">Alle agents</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tijd</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bericht</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dashboard.recentActivity.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('nl-NL')}
                      </td>
                      <td className="px-6 py-4">
                        <LogLevelBadge level={log.type as LogEntry['level']} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.agentId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Projecten</h2>
            </div>
            <div className="p-12 text-center text-gray-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Project overzicht wordt hier weergegeven</p>
              <p className="text-sm mt-1">Verbind met de API voor live data</p>
            </div>
          </div>
        )}
      </main>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedAgent.name}</h2>
                  <p className="text-sm text-gray-500">v{selectedAgent.version}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedAgent.status} />
                  <span className="text-sm text-gray-500">
                    Laatst actief: {new Date(selectedAgent.lastActive).toLocaleString('nl-NL')}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Projecten Voltooid</p>
                    <p className="text-xl font-semibold text-gray-900">{selectedAgent.metrics.projectsCompleted}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Succes Rate</p>
                    <p className="text-xl font-semibold text-green-600">{selectedAgent.metrics.successRate}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500">Gem. Response</p>
                    <p className="text-xl font-semibold text-gray-900">{selectedAgent.metrics.avgResponseTime}ms</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Acties</h3>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Workflow Starten
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    Logs Bekijken
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    Configuratie
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
