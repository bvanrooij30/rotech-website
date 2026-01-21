import { requirePermission, PERMISSIONS } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Plus,
  Search,
  Globe,
  Package,
  ExternalLink,
  MoreVertical,
} from "lucide-react";

export const metadata = {
  title: "Producten",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; type?: string }>;
}) {
  await requirePermission(PERMISSIONS.USERS_READ);
  const params = await searchParams;

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { domain: { contains: params.search, mode: "insensitive" } },
      { user: { name: { contains: params.search, mode: "insensitive" } } },
      { user: { email: { contains: params.search, mode: "insensitive" } } },
    ];
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.type) {
    where.type = params.type;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subscriptions: {
        where: { status: "active" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "development":
        return "bg-blue-100 text-blue-700";
      case "maintenance":
        return "bg-amber-100 text-amber-700";
      case "archived":
        return "bg-slate-100 text-slate-500";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Actief",
      development: "In ontwikkeling",
      maintenance: "Onderhoud",
      archived: "Gearchiveerd",
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      website: "Website",
      webshop: "Webshop",
      webapp: "Web App",
      api: "API",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Producten</h1>
          <p className="text-slate-600">{products.length} producten in totaal</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5" />
          Nieuw Product
        </Link>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="search"
                placeholder="Zoek op naam, domain of klant..."
                defaultValue={params.search}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            name="status"
            defaultValue={params.status}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle statussen</option>
            <option value="active">Actief</option>
            <option value="development">In ontwikkeling</option>
            <option value="maintenance">Onderhoud</option>
            <option value="archived">Gearchiveerd</option>
          </select>
          <select
            name="type"
            defaultValue={params.type}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle types</option>
            <option value="website">Website</option>
            <option value="webshop">Webshop</option>
            <option value="webapp">Web App</option>
            <option value="api">API</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
          >
            Zoeken
          </button>
        </div>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Klant
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Onderhoud
                </th>
                <th className="text-right px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Geen producten gevonden
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          {product.type === "website" || product.type === "webshop" ? (
                            <Globe className="w-5 h-5 text-indigo-600" />
                          ) : (
                            <Package className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-slate-900 hover:text-indigo-600"
                          >
                            {product.name}
                          </Link>
                          {product.domain && (
                            <a
                              href={`https://${product.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"
                            >
                              {product.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/users/${product.user.id}`}
                        className="text-sm text-slate-900 hover:text-indigo-600"
                      >
                        {product.user.name}
                      </Link>
                      <p className="text-xs text-slate-500">{product.user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">
                        {getTypeLabel(product.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.subscriptions.length > 0 ? (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          Actief
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Geen</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg inline-flex"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
