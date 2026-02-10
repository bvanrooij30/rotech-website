import { requirePermission, PERMISSIONS } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Search, 
  Plus,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
  AlertCircle
} from "lucide-react";
import SubscriptionActionsMenu from "@/components/admin/SubscriptionActionsMenu";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}) {
  await requirePermission(PERMISSIONS.SUBSCRIPTIONS_READ);
  
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const statusFilter = params.status || "";
  const search = params.search || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      statusFilter ? { status: statusFilter } : {},
      search ? {
        OR: [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
          { planName: { contains: search } },
        ],
      } : {},
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let subscriptions: any[] = [], total = 0, stats: any[] = [];
  try {
    [subscriptions, total, stats] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, companyName: true } },
          product: { select: { id: true, name: true, domain: true } },
        },
        orderBy: { createdAt: "desc" }, skip, take: limit,
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.groupBy({ by: ["status"], _count: true }),
    ]);
  } catch {}

  const totalPages = Math.ceil(total / limit);
  
  const statusCounts = stats.reduce((acc: Record<string, number>, s: { status: string; _count: number }) => {
    acc[s.status] = s._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abonnementen</h1>
          <p className="text-slate-600">{total} abonnementen in totaal</p>
        </div>
        <Link
          href="/admin/subscriptions/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Nieuw Abonnement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusCard
          label="Actief"
          count={statusCounts.active || 0}
          icon={CheckCircle}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatusCard
          label="Gepauzeerd"
          count={statusCounts.paused || 0}
          icon={PauseCircle}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatusCard
          label="Achterstallig"
          count={statusCounts.past_due || 0}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatusCard
          label="Geannuleerd"
          count={statusCounts.cancelled || 0}
          icon={XCircle}
          color="text-slate-600"
          bgColor="bg-slate-50"
        />
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
              placeholder="Zoek op klant of plan..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle statussen</option>
            <option value="active">Actief</option>
            <option value="paused">Gepauzeerd</option>
            <option value="past_due">Achterstallig</option>
            <option value="cancelled">Geannuleerd</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Zoeken
          </button>
        </form>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Klant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Plan
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Uren
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Volgende Betaling
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${sub.user.id}`}
                      className="font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {sub.user.name}
                    </Link>
                    <p className="text-sm text-slate-500">{sub.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{sub.planName}</p>
                    <p className="text-sm text-slate-500">
                      €{sub.monthlyPrice}/maand
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className={`text-sm ${
                        sub.hoursUsed > sub.hoursIncluded 
                          ? "text-red-600 font-medium" 
                          : "text-slate-600"
                      }`}>
                        {sub.hoursUsed.toFixed(1)} / {sub.hoursIncluded}u
                      </span>
                    </div>
                    {sub.hoursUsed > sub.hoursIncluded && (
                      <p className="text-xs text-red-500 mt-1">
                        +{(sub.hoursUsed - sub.hoursIncluded).toFixed(1)}u extra
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <SubscriptionStatusBadge status={sub.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <SubscriptionActionsMenu 
                      subscriptionId={sub.id} 
                      status={sub.status}
                      planName={sub.planName}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Pagina {page} van {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/subscriptions?page=${page - 1}&status=${statusFilter}&search=${search}`}
                  className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Vorige
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/subscriptions?page=${page + 1}&status=${statusFilter}&search=${search}`}
                  className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Volgende
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCard({
  label,
  count,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: "Actief", classes: "bg-emerald-100 text-emerald-700" },
    paused: { label: "Gepauzeerd", classes: "bg-amber-100 text-amber-700" },
    past_due: { label: "Achterstallig", classes: "bg-red-100 text-red-700" },
    cancelled: { label: "Geannuleerd", classes: "bg-slate-100 text-slate-700" },
  }[status] || { label: status, classes: "bg-slate-100 text-slate-700" };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.classes}`}>
      {config.label}
    </span>
  );
}
