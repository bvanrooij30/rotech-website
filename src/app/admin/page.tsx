import { requireAdmin, getAdminStats, PERMISSIONS, hasPermission } from "@/lib/admin";
import { 
  Users, 
  CreditCard, 
  Package, 
  LifeBuoy, 
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const stats = await getAdminStats();

  // Get urgent tickets (with error handling for PgBouncer)
  let urgentTickets: Awaited<ReturnType<typeof prisma.supportTicket.findMany>> = [];
  try {
    urgentTickets = await prisma.supportTicket.findMany({
      where: {
        status: { notIn: ["closed", "resolved"] },
        priority: { in: ["high", "urgent"] },
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  } catch {}

  // Get recent activity (audit log)
  let recentActivity: Awaited<ReturnType<typeof prisma.adminAuditLog.findMany>> = [];
  try {
    recentActivity = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch {}

  const canManageUsers = hasPermission(admin.permissions, PERMISSIONS.USERS_READ);
  const canManageSubscriptions = hasPermission(admin.permissions, PERMISSIONS.SUBSCRIPTIONS_READ);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">
            Welkom terug, {admin.name}
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString("nl-NL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totaal Gebruikers"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          href="/admin/users"
        />
        <StatCard
          title="Actieve Abonnementen"
          value={stats.activeSubscriptions}
          icon={CreditCard}
          color="bg-emerald-500"
          href="/admin/subscriptions"
        />
        <StatCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={LifeBuoy}
          color="bg-amber-500"
          href="/admin/tickets"
        />
        <StatCard
          title="Maandelijkse Omzet"
          value={`€${stats.monthlyRevenue.toLocaleString("nl-NL")}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Urgente Tickets
            </h2>
            <Link 
              href="/admin/tickets?priority=urgent" 
              className="text-sm text-indigo-600 hover:underline"
            >
              Alle bekijken
            </Link>
          </div>
          
          {urgentTickets.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">
              Geen urgente tickets
            </p>
          ) : (
            <div className="space-y-3">
              {urgentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/admin/tickets/${ticket.id}`}
                  className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ticket.user.name} • {ticket.ticketNumber}
                      </p>
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${ticket.priority === "urgent" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-amber-100 text-amber-700"
                      }
                    `}>
                      {ticket.priority === "urgent" ? "Urgent" : "Hoog"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        {canManageUsers && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Nieuwe Gebruikers
              </h2>
              <Link 
                href="/admin/users" 
                className="text-sm text-indigo-600 hover:underline"
              >
                Alle bekijken
              </Link>
            </div>
            
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Recente Activiteit
          </h2>
          <Link 
            href="/admin/audit" 
            className="text-sm text-indigo-600 hover:underline"
          >
            Volledige log
          </Link>
        </div>
        
        {recentActivity.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">
            Geen recente activiteit
          </p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{log.adminEmail}</span>
                      {" "}
                      <span className="text-slate-500">{formatAction(log.action)}</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {formatTimeAgo(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {href && (
        <div className="mt-4 flex items-center text-sm text-indigo-600">
          Bekijken <ArrowUpRight className="w-4 h-4 ml-1" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

function formatAction(action: string): string {
  const actions: Record<string, string> = {
    "user.create": "heeft een gebruiker aangemaakt",
    "user.update": "heeft een gebruiker bijgewerkt",
    "user.delete": "heeft een gebruiker verwijderd",
    "subscription.create": "heeft een abonnement aangemaakt",
    "subscription.update": "heeft een abonnement bijgewerkt",
    "ticket.update": "heeft een ticket bijgewerkt",
    "ticket.reply": "heeft gereageerd op een ticket",
    "settings.update": "heeft instellingen gewijzigd",
  };
  return actions[action] || action;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Zojuist";
  if (minutes < 60) return `${minutes}m geleden`;
  if (hours < 24) return `${hours}u geleden`;
  return `${days}d geleden`;
}
