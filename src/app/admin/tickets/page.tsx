import { requirePermission, PERMISSIONS } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Search, MessageSquare, Clock, AlertTriangle, CheckCircle, User } from "lucide-react";

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; priority?: string; search?: string }>;
}) {
  await requirePermission(PERMISSIONS.TICKETS_READ);
  
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const statusFilter = params.status || "";
  const priorityFilter = params.priority || "";
  const search = params.search || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      statusFilter ? { status: statusFilter } : {},
      priorityFilter ? { priority: priorityFilter } : {},
      search ? {
        OR: [
          { subject: { contains: search } },
          { ticketNumber: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      } : {},
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tickets: any[] = [], total = 0;
  try {
    [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { name: true } },
          _count: { select: { messages: true } },
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        skip, take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);
  } catch {}

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="text-slate-600">{total} tickets in totaal</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Zoek op onderwerp, nummer of klant..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle statussen</option>
            <option value="open">Open</option>
            <option value="in_progress">In behandeling</option>
            <option value="waiting_customer">Wacht op klant</option>
            <option value="resolved">Opgelost</option>
            <option value="closed">Gesloten</option>
          </select>
          <select
            name="priority"
            defaultValue={priorityFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle prioriteiten</option>
            <option value="urgent">Urgent</option>
            <option value="high">Hoog</option>
            <option value="medium">Medium</option>
            <option value="low">Laag</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Zoeken
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Geen tickets gevonden
          </div>
        ) : (
          tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/tickets/${ticket.id}`}
              className="block p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-sm text-slate-500">{ticket.ticketNumber}</span>
                  </div>
                  <h3 className="font-medium text-slate-900 truncate">
                    {ticket.subject}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {ticket.user.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {ticket._count.messages} berichten
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(ticket.updatedAt)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Pagina {page} van {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/tickets?page=${page - 1}&status=${statusFilter}&priority=${priorityFilter}&search=${search}`}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
              >
                Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/tickets?page=${page + 1}&status=${statusFilter}&priority=${priorityFilter}&search=${search}`}
                className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
              >
                Volgende
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = {
    urgent: { icon: AlertTriangle, classes: "text-red-600" },
    high: { icon: AlertTriangle, classes: "text-amber-600" },
    medium: { icon: Clock, classes: "text-blue-600" },
    low: { icon: Clock, classes: "text-slate-400" },
  }[priority] || { icon: Clock, classes: "text-slate-400" };

  const Icon = config.icon;
  return <Icon className={`w-4 h-4 ${config.classes}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    open: { label: "Open", classes: "bg-blue-100 text-blue-700" },
    in_progress: { label: "In behandeling", classes: "bg-amber-100 text-amber-700" },
    waiting_customer: { label: "Wacht op klant", classes: "bg-purple-100 text-purple-700" },
    resolved: { label: "Opgelost", classes: "bg-emerald-100 text-emerald-700" },
    closed: { label: "Gesloten", classes: "bg-slate-100 text-slate-700" },
  }[status] || { label: status, classes: "bg-slate-100 text-slate-700" };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.classes}`}>
      {config.label}
    </span>
  );
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
  if (days < 7) return `${days}d geleden`;
  return new Date(date).toLocaleDateString("nl-NL");
}
