import { requirePermission, PERMISSIONS, hasPermission, getAdminUser } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  CreditCard,
  Package,
  LifeBuoy,
  FileText,
  Edit,
  Shield
} from "lucide-react";
import UserEditForm from "@/components/admin/UserEditForm";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requirePermission(PERMISSIONS.USERS_READ);
  const { id } = await params;

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, name: true, type: true, status: true, domain: true } },
        subscriptions: { select: { id: true, planName: true, status: true, monthlyPrice: true, hoursUsed: true, hoursIncluded: true, currentPeriodEnd: true } },
        supportTickets: { select: { id: true, ticketNumber: true, subject: true, status: true, priority: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
        invoices: { select: { id: true, invoiceNumber: true, amount: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  } catch { notFound(); }

  if (!user) {
    notFound();
  }

  const canEdit = hasPermission(admin.permissions, PERMISSIONS.USERS_WRITE);

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
            <p className="text-slate-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleBadge role={user.role} />
          <StatusBadge isActive={user.isActive} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Details Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Edit className="w-5 h-5 text-slate-500" />
              Gebruikersgegevens
            </h2>
            <UserEditForm user={user} canEdit={canEdit} />
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              Producten ({user.products.length})
            </h2>
            {user.products.length === 0 ? (
              <p className="text-slate-500 text-sm">Geen producten</p>
            ) : (
              <div className="space-y-2">
                {user.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/admin/products/${product.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-sm text-slate-500">{product.domain || product.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "active" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {product.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Support Tickets */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-slate-500" />
                Recente Tickets
              </h2>
              <Link href={`/admin/tickets?search=${user.email}`} className="text-sm text-indigo-600 hover:underline">
                Alle bekijken
              </Link>
            </div>
            {user.supportTickets.length === 0 ? (
              <p className="text-slate-500 text-sm">Geen tickets</p>
            ) : (
              <div className="space-y-2">
                {user.supportTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                  >
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">{ticket.ticketNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      ticket.status === "open" || ticket.status === "in_progress"
                        ? "bg-amber-100 text-amber-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {ticket.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Contactgegevens</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${user.email}`} className="text-indigo-600 hover:underline">
                  {user.email}
                </a>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <a href={`tel:${user.phone}`} className="text-slate-700">
                    {user.phone}
                  </a>
                </div>
              )}
              {user.companyName && (
                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{user.companyName}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700">
                  Lid sinds {new Date(user.createdAt).toLocaleDateString("nl-NL")}
                </span>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Abonnementen
            </h3>
            {user.subscriptions.length === 0 ? (
              <p className="text-slate-500 text-sm">Geen abonnementen</p>
            ) : (
              <div className="space-y-3">
                {user.subscriptions.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/admin/subscriptions/${sub.id}`}
                    className="block p-3 bg-slate-50 rounded-lg hover:bg-slate-100"
                  >
                    <p className="font-medium text-slate-900 text-sm">{sub.planName}</p>
                    <p className="text-xs text-slate-500">€{sub.monthlyPrice}/maand</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {sub.hoursUsed.toFixed(1)}/{sub.hoursIncluded}u
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        sub.status === "active" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/admin/subscriptions/new?userId=${user.id}`}
              className="mt-4 block w-full text-center py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
            >
              + Abonnement toevoegen
            </Link>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Recente Facturen
            </h3>
            {user.invoices.length === 0 ? (
              <p className="text-slate-500 text-sm">Geen facturen</p>
            ) : (
              <div className="space-y-2">
                {user.invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-700">{invoice.invoiceNumber}</span>
                    <span className={`font-medium ${
                      invoice.status === "paid" ? "text-emerald-600" : "text-slate-600"
                    }`}>
                      €{invoice.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const config = {
    super_admin: { label: "Super Admin", classes: "bg-purple-100 text-purple-700" },
    admin: { label: "Admin", classes: "bg-indigo-100 text-indigo-700" },
    customer: { label: "Klant", classes: "bg-slate-100 text-slate-700" },
  }[role] || { label: role, classes: "bg-slate-100 text-slate-700" };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${config.classes}`}>
      <Shield className="w-4 h-4" />
      {config.label}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
      isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
    }`}>
      {isActive ? "Actief" : "Inactief"}
    </span>
  );
}
