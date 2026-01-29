import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { 
  Activity, 
  User, 
  CreditCard, 
  Package, 
  LifeBuoy,
  Settings,
  Clock
} from "lucide-react";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string }>;
}) {
  await requireAdmin();
  
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const actionFilter = params.action || "";
  const limit = 50;
  const skip = (page - 1) * limit;

  const where = actionFilter ? { action: { startsWith: actionFilter } } : {};

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminAuditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const actionIcons: Record<string, React.ReactNode> = {
    user: <User className="w-4 h-4 text-blue-500" />,
    subscription: <CreditCard className="w-4 h-4 text-green-500" />,
    product: <Package className="w-4 h-4 text-purple-500" />,
    ticket: <LifeBuoy className="w-4 h-4 text-orange-500" />,
    settings: <Settings className="w-4 h-4 text-slate-500" />,
  };

  const formatAction = (action: string): string => {
    const actions: Record<string, string> = {
      "user.create": "Gebruiker aangemaakt",
      "user.update": "Gebruiker bijgewerkt",
      "user.delete": "Gebruiker verwijderd",
      "subscription.create": "Abonnement aangemaakt",
      "subscription.update": "Abonnement bijgewerkt",
      "subscription.cancel": "Abonnement geannuleerd",
      "ticket.update": "Ticket bijgewerkt",
      "ticket.reply": "Ticket reactie toegevoegd",
      "ticket.close": "Ticket gesloten",
      "settings.update": "Instellingen gewijzigd",
      "product.create": "Product aangemaakt",
      "product.update": "Product bijgewerkt",
    };
    return actions[action] || action;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Zojuist";
    if (minutes < 60) return `${minutes}m geleden`;
    if (hours < 24) return `${hours}u geleden`;
    if (days < 7) return `${days}d geleden`;
    return new Date(date).toLocaleDateString("nl-NL");
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" />
          Audit Log
        </h1>
        <p className="text-slate-600">Alle admin activiteiten</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form className="flex gap-4">
          <select
            name="action"
            defaultValue={actionFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="">Alle acties</option>
            <option value="user">Gebruikers</option>
            <option value="subscription">Abonnementen</option>
            <option value="ticket">Tickets</option>
            <option value="product">Producten</option>
            <option value="settings">Instellingen</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Filteren
          </button>
        </form>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Geen audit logs gevonden</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => {
              const [category] = log.action.split(".");
              return (
                <div key={log.id} className="p-4 hover:bg-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      {actionIcons[category] || <Activity className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{log.adminEmail}</span>
                        <span className="text-slate-500">{formatAction(log.action)}</span>
                      </div>
                      {log.targetId && (
                        <div className="text-sm text-slate-500 mt-1">
                          {log.targetType}: {log.targetId}
                        </div>
                      )}
                      {log.ipAddress && (
                        <div className="text-xs text-slate-400 mt-1">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(log.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Pagina {page} van {totalPages} ({total} logs)
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/audit?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Vorige
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/audit?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ""}`}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Volgende
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
