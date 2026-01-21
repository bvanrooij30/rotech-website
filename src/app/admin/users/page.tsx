import { requirePermission, PERMISSIONS } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Shield, 
  ShieldCheck,
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import UserActionsMenu from "@/components/admin/UserActionsMenu";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  await requirePermission(PERMISSIONS.USERS_READ);
  
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";
  const roleFilter = params.role || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { companyName: { contains: search } },
        ],
      } : {},
      roleFilter ? { role: roleFilter } : {},
    ],
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            products: true,
            subscriptions: true,
            supportTickets: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gebruikers</h1>
          <p className="text-slate-600">{total} gebruikers in totaal</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Nieuwe Gebruiker
        </Link>
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
              placeholder="Zoek op naam, email of bedrijf..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            name="role"
            defaultValue={roleFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle rollen</option>
            <option value="customer">Klanten</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Zoeken
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Gebruiker
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Rol
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Producten
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Aangemaakt
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-600 uppercase">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {user.name}
                        </Link>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        {user.companyName && (
                          <p className="text-xs text-slate-400">{user.companyName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">
                      {user._count.products} producten
                      <br />
                      <span className="text-slate-400">
                        {user._count.subscriptions} abonnementen
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" /> Actief
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        <XCircle className="w-3 h-3" /> Inactief
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <UserActionsMenu userId={user.id} userName={user.name} userRole={user.role} />
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
                  href={`/admin/users?page=${page - 1}&search=${search}&role=${roleFilter}`}
                  className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50"
                >
                  Vorige
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}&search=${search}&role=${roleFilter}`}
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

function RoleBadge({ role }: { role: string }) {
  const config = {
    super_admin: { 
      icon: ShieldCheck, 
      label: "Super Admin", 
      classes: "bg-purple-100 text-purple-700" 
    },
    admin: { 
      icon: Shield, 
      label: "Admin", 
      classes: "bg-indigo-100 text-indigo-700" 
    },
    customer: { 
      icon: UserIcon, 
      label: "Klant", 
      classes: "bg-slate-100 text-slate-700" 
    },
  }[role] || { icon: UserIcon, label: role, classes: "bg-slate-100 text-slate-700" };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.classes}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
