import { requireAdmin } from "@/lib/admin";
import { 
  Zap, 
  Key, 
  Webhook, 
  Copy, 
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code
} from "lucide-react";

export default async function AdminApiPage() {
  await requireAdmin();

  const endpoints = [
    { method: "GET", path: "/api/ai-agents", description: "Get all AI agent statuses" },
    { method: "GET", path: "/api/ai-agents/health", description: "System health check" },
    { method: "POST", path: "/api/ai-agents/health", description: "Run fallback recovery" },
    { method: "GET", path: "/api/ai-agents/heartbeat", description: "Get all heartbeats" },
    { method: "POST", path: "/api/ai-agents/heartbeat", description: "Record agent heartbeat" },
    { method: "GET", path: "/api/ai-agents/leads", description: "Get all leads" },
    { method: "POST", path: "/api/ai-agents/leads", description: "Create new lead" },
    { method: "GET", path: "/api/ai-agents/briefing", description: "Get daily briefing" },
    { method: "POST", path: "/api/ai-agents/generate-prompt", description: "Generate Cursor prompt" },
  ];

  const webhooks = [
    { name: "Stripe Webhook", url: "/api/webhooks/stripe", status: "active", lastTriggered: "2 uur geleden" },
    { name: "Resend Webhook", url: "/api/webhooks/email", status: "active", lastTriggered: "5 min geleden" },
  ];

  const cronJobs = [
    { name: "Scheduler", path: "/api/cron/scheduler", schedule: "* * * * *", description: "Elke minuut - taak verwerking" },
    { name: "Health Check", path: "/api/cron/health-check", schedule: "*/5 * * * *", description: "Elke 5 min - systeem monitoring" },
    { name: "Daily Briefing", path: "/api/cron/daily-briefing", schedule: "0 8 * * *", description: "Dagelijks 8:00 - rapportage" },
  ];

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Zap className="w-8 h-8 text-indigo-600" />
          API & Webhooks
        </h1>
        <p className="text-slate-600">API endpoints, webhooks en cron jobs beheren</p>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-amber-500" />
          API Keys
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">Cron Secret</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Actief</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-slate-200 px-3 py-2 rounded font-mono text-slate-700">
                ••••••••••••••••••••••••
              </code>
              <button className="p-2 hover:bg-slate-200 rounded">
                <Copy className="w-4 h-4 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-200 rounded">
                <RefreshCw className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Gebruikt voor authenticatie van Vercel cron jobs
            </p>
          </div>

          <div className="p-4 border-2 border-dashed border-slate-200 rounded-lg text-center">
            <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              + Nieuwe API Key Genereren
            </button>
          </div>
        </div>
      </div>

      {/* Cron Jobs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          Vercel Cron Jobs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-sm font-medium text-slate-500">Naam</th>
                <th className="text-left py-2 text-sm font-medium text-slate-500">Endpoint</th>
                <th className="text-left py-2 text-sm font-medium text-slate-500">Schedule</th>
                <th className="text-left py-2 text-sm font-medium text-slate-500">Beschrijving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cronJobs.map((job) => (
                <tr key={job.name}>
                  <td className="py-3 font-medium text-slate-900">{job.name}</td>
                  <td className="py-3">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{job.path}</code>
                  </td>
                  <td className="py-3">
                    <code className="text-sm text-slate-600">{job.schedule}</code>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{job.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Cron jobs worden automatisch uitgevoerd door Vercel. Zie vercel.json voor configuratie.
        </p>
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Webhook className="w-5 h-5 text-purple-500" />
          Webhooks
        </h2>
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <div key={webhook.name} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="font-medium text-slate-900">{webhook.name}</div>
                    <code className="text-sm text-slate-500">{webhook.url}</code>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  Laatst: {webhook.lastTriggered}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-green-500" />
          API Endpoints
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-sm font-medium text-slate-500">Methode</th>
                <th className="text-left py-2 text-sm font-medium text-slate-500">Endpoint</th>
                <th className="text-left py-2 text-sm font-medium text-slate-500">Beschrijving</th>
                <th className="text-right py-2 text-sm font-medium text-slate-500">Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {endpoints.map((endpoint, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === "GET" ? "bg-green-100 text-green-700" :
                      endpoint.method === "POST" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-700"
                    }`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="py-3">
                    <code className="text-sm">{endpoint.path}</code>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{endpoint.description}</td>
                  <td className="py-3 text-right">
                    <a
                      href={endpoint.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">API Documentatie</h3>
        <p className="text-sm text-indigo-700 mb-4">
          Volledige API documentatie is beschikbaar in het API-DOCUMENTATION.md bestand.
        </p>
        <a
          href="/API-DOCUMENTATION.md"
          target="_blank"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Bekijk Documentatie
        </a>
      </div>
    </div>
  );
}
