import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { getFormSubmissions } from "@/lib/forms-store";
import { getWorkOrders } from "@/lib/work-orders-store";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  MessageSquare,
  Mail,
  Target,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

export default async function AnalyticsPage() {
  await requireAdmin();

  // Get current date info
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  // Fetch analytics data from database and files
  let totalUsers = 0, usersThisMonth = 0, usersLastMonth = 0, openTickets = 0, resolvedTicketsThisMonth = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let formSubmissions: any[] = [], workOrders: any[] = [];
  try {
    [totalUsers, usersThisMonth, usersLastMonth, openTickets, resolvedTicketsThisMonth, formSubmissions, workOrders] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.supportTicket.count({ where: { status: { notIn: ['closed', 'resolved'] } } }),
      prisma.supportTicket.count({ where: { status: { in: ['closed', 'resolved'] }, updatedAt: { gte: startOfMonth } } }),
      getFormSubmissions().catch(() => []),
      getWorkOrders().catch(() => []),
    ]);
  } catch {}

  // Calculate lead stats from form submissions and work orders
  const allLeads = [
    ...formSubmissions.map(f => ({ 
      ...f, 
      type: 'contact' as const, 
      date: new Date(f.submittedAt) 
    })),
    ...workOrders.map(w => ({ 
      ...w, 
      type: 'quote' as const, 
      date: new Date(w.createdAt),
      email: w.customerEmail,
      name: w.customerName,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalLeads = allLeads.length;
  const leadsThisMonth = allLeads.filter(l => l.date >= startOfMonth).length;
  const leadsLastMonth = allLeads.filter(l => l.date >= startOfLastMonth && l.date <= endOfLastMonth).length;
  const leadsThisWeek = allLeads.filter(l => l.date >= startOfWeek).length;
  const recentLeads = allLeads.slice(0, 10);

  // Calculate growth percentages
  const userGrowth = usersLastMonth > 0 
    ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
    : usersThisMonth > 0 ? '100' : '0';
  
  const leadGrowth = leadsLastMonth > 0 
    ? ((leadsThisMonth - leadsLastMonth) / leadsLastMonth * 100).toFixed(1)
    : leadsThisMonth > 0 ? '100' : '0';

  // Get conversion funnel data (simplified)
  const funnelData = {
    visitors: '---', // Placeholder - needs GA integration
    pageViews: '---',
    contactClicks: leadsThisMonth,
    conversions: leadsThisMonth, // Actual form submissions
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600">
            Website prestaties en lead tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Google Analytics
          </Link>
        </div>
      </div>

      {/* GA Setup Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Google Analytics Configuratie</h3>
            <p className="text-sm text-amber-700 mt-1">
              Voeg je GA4 Measurement ID toe aan <code className="bg-amber-100 px-1 rounded">.env.local</code>: 
              <code className="bg-amber-100 px-1 rounded ml-1">NEXT_PUBLIC_GA_MEASUREMENT_ID=&quot;G-XXXXXXXXXX&quot;</code>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              Traffic data wordt dan automatisch getrackt. Conversies (offerte, contact) worden al getrackt.
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Nieuwe Gebruikers"
          value={usersThisMonth}
          subtitle="deze maand"
          change={parseFloat(userGrowth)}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Leads / Offertes"
          value={leadsThisMonth}
          subtitle="deze maand"
          change={parseFloat(leadGrowth)}
          icon={Target}
          color="emerald"
        />
        <MetricCard
          title="Leads Deze Week"
          value={leadsThisWeek}
          subtitle="laatste 7 dagen"
          icon={FileText}
          color="purple"
        />
        <MetricCard
          title="Tickets Opgelost"
          value={resolvedTicketsThisMonth}
          subtitle="deze maand"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Conversie Overzicht
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FunnelStep
              label="Website Bezoekers"
              value={funnelData.visitors}
              description="Unieke bezoekers (GA4)"
              isPlaceholder={true}
            />
            <FunnelStep
              label="Pagina Views"
              value={funnelData.pageViews}
              description="Totaal bekeken (GA4)"
              isPlaceholder={true}
            />
            <FunnelStep
              label="Form Starts"
              value={"-"}
              description="Contact/offerte focus"
              isPlaceholder={true}
            />
            <FunnelStep
              label="Conversies"
              value={funnelData.conversions}
              description="Ingediende formulieren"
              highlight={true}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                <p className="text-sm text-slate-500">Totaal Gebruikers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalLeads}</p>
                <p className="text-sm text-slate-500">Totaal Leads</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{openTickets}</p>
                <p className="text-sm text-slate-500">Open Tickets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Recente Leads
          </h2>
          
          {recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nog geen leads geregistreerd</p>
              <p className="text-slate-400 text-xs mt-1">
                Leads verschijnen hier na contact/offerte formulier inzendingen
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeads.slice(0, 5).map((lead, index) => (
                <div
                  key={`${lead.type}-${index}`}
                  className="p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        lead.type === 'quote' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-slate-700">
                        {lead.type === 'quote' ? 'Offerte' : 'Contact'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatTimeAgo(lead.date)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {lead.name} - {lead.email}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/admin/audit"
            className="mt-4 block text-center text-sm text-indigo-600 hover:underline"
          >
            Bekijk alle activiteit →
          </Link>
        </div>
      </div>

      {/* Tracking Events Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Getrackte Events
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Deze events worden automatisch naar Google Analytics gestuurd:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EventCard
            name="offerte_submitted"
            description="Offerte formulier ingediend"
            type="conversion"
          />
          <EventCard
            name="contact_form_submitted"
            description="Contact formulier ingediend"
            type="conversion"
          />
          <EventCard
            name="offerte_pakket_selected"
            description="Pakket geselecteerd in wizard"
            type="funnel"
          />
          <EventCard
            name="contact_form_focused"
            description="Focus op contact formulier"
            type="engagement"
          />
          <EventCard
            name="view_pricing"
            description="Prijzen pagina bekeken"
            type="engagement"
          />
          <EventCard
            name="view_dienst"
            description="Dienst pagina bekeken"
            type="engagement"
          />
        </div>
      </div>
    </div>
  );
}

// Components

function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {change !== undefined && (
        <div className={`mt-4 flex items-center text-sm ${
          change >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {change >= 0 ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          <span>{change >= 0 ? '+' : ''}{change}% vs vorige maand</span>
        </div>
      )}
    </div>
  );
}

function FunnelStep({
  label,
  value,
  description,
  highlight = false,
  isPlaceholder = false,
}: {
  label: string;
  value: string | number;
  description: string;
  highlight?: boolean;
  isPlaceholder?: boolean;
}) {
  return (
    <div className={`text-center p-4 rounded-lg ${
      highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'
    }`}>
      <p className={`text-2xl font-bold ${
        isPlaceholder ? 'text-slate-300' : highlight ? 'text-emerald-600' : 'text-slate-900'
      }`}>
        {value}
      </p>
      <p className={`text-sm font-medium mt-1 ${
        highlight ? 'text-emerald-700' : 'text-slate-700'
      }`}>
        {label}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
  );
}

function EventCard({
  name,
  description,
  type,
}: {
  name: string;
  description: string;
  type: 'conversion' | 'funnel' | 'engagement';
}) {
  const typeStyles = {
    conversion: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    funnel: 'bg-blue-100 text-blue-700 border-blue-200',
    engagement: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const typeLabels = {
    conversion: 'Conversie',
    funnel: 'Funnel',
    engagement: 'Engagement',
  };

  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <code className="text-sm font-mono text-indigo-600">{name}</code>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeStyles[type]}`}>
          {typeLabels[type]}
        </span>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Zojuist";
  if (minutes < 60) return `${minutes}m geleden`;
  if (hours < 24) return `${hours}u geleden`;
  if (days < 7) return `${days}d geleden`;
  return dateObj.toLocaleDateString("nl-NL");
}
