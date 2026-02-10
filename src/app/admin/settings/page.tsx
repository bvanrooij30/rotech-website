import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { 
  Settings, 
  Globe, 
  Mail, 
  CreditCard, 
  Shield, 
  Bell,
  Save,
  Database,
  Server
} from "lucide-react";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  // Get current settings
  let settingsMap: Record<string, string> = {};
  try {
    const settings = await prisma.systemSetting.findMany();
    settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
  } catch {}

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" />
          Systeem Instellingen
        </h1>
        <p className="text-slate-600">Configureer het platform</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
            Algemeen
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website Naam
              </label>
              <input
                type="text"
                defaultValue={settingsMap.site_name || "RoTech Development"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                defaultValue={settingsMap.site_url || "https://ro-techdevelopment.dev"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Onderhoudsmodus
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="false">Uit</option>
                <option value="true">Aan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-green-500" />
            Email
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Afzender Email
              </label>
              <input
                type="email"
                defaultValue={settingsMap.email_from || "noreply@ro-techdevelopment.dev"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Support Email
              </label>
              <input
                type="email"
                defaultValue={settingsMap.email_support || "support@ro-techdevelopment.dev"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Admin Notificaties
              </label>
              <input
                type="email"
                defaultValue={settingsMap.email_admin || "bart@ro-techdevelopment.dev"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-500" />
            Betalingen
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stripe Mode
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="test">Test Mode</option>
                <option value="live">Live Mode</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                BTW Percentage
              </label>
              <input
                type="number"
                defaultValue={settingsMap.vat_rate || "21"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Valuta
              </label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-500" />
            Notificaties
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">Email bij nieuwe lead</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">Email bij nieuw support ticket</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">Dagelijkse briefing om 8:00</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">SMS bij kritieke alerts</span>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-red-500" />
            Beveiliging
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sessie Timeout (minuten)
              </label>
              <input
                type="number"
                defaultValue={settingsMap.session_timeout || "1440"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">Rate limiting actief</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded" />
              <span className="text-sm text-slate-700">CSRF bescherming</span>
            </label>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-slate-500" />
            Systeem Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Node.js</span>
              <span className="text-slate-900 font-mono">{process.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Platform</span>
              <span className="text-slate-900 font-mono">{process.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Environment</span>
              <span className="text-slate-900 font-mono">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Database</span>
              <span className="text-slate-900 font-mono">SQLite (dev)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <Save className="w-4 h-4" />
          Instellingen Opslaan
        </button>
      </div>
    </div>
  );
}
