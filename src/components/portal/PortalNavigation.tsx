"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CreditCard,
  Package,
  MessageCircle,
  Settings,
  FileText,
  HelpCircle,
  Users,
  LifeBuoy,
  BarChart3,
  Activity,
  ScrollText,
  Shield,
  Zap,
  Euro,
} from "lucide-react";

// Admin beheer menu
const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Gebruikers", href: "/admin/users", icon: Users },
  { label: "Abonnementen", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Producten", href: "/admin/products", icon: Package },
  { label: "Support Tickets", href: "/admin/tickets", icon: LifeBuoy },
  { label: "Facturen", href: "/admin/invoices", icon: FileText },
  { label: "Billing", href: "/admin/billing", icon: Euro },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Audit Log", href: "/admin/audit", icon: Activity },
  { label: "API & Webhooks", href: "/admin/api", icon: Zap },
  { label: "Instellingen", href: "/admin/settings", icon: Settings },
];

// Klant portal menu
const customerNavItems = [
  { label: "Dashboard", href: "/portal", icon: LayoutDashboard },
  { label: "Mijn Abonnement", href: "/portal/abonnement", icon: CreditCard },
  { label: "Mijn Producten", href: "/portal/producten", icon: Package },
  { label: "Support", href: "/portal/support", icon: MessageCircle },
  { label: "Facturen", href: "/portal/facturen", icon: FileText },
  { label: "Instellingen", href: "/portal/instellingen", icon: Settings },
];

export default function PortalNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  return (
    <nav className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Admin badge */}
      {isAdmin && (
        <div className="flex items-center gap-2 px-4 mb-4 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-sm font-bold text-slate-900">Admin Beheer</span>
            <p className="text-xs text-slate-500">Volledig beheerpaneel</p>
          </div>
        </div>
      )}

      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/portal" && item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Quick link voor admin naar klantportaal of andersom */}
      <div className="mt-6 pt-4 border-t border-slate-200 space-y-1">
        {isAdmin && (
          <Link
            href="/portal"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          >
            <ScrollText className="w-5 h-5" />
            Klantportaal weergave
          </Link>
        )}
        <Link
          href="/veelgestelde-vragen"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50"
        >
          <HelpCircle className="w-5 h-5" />
          Hulp nodig?
        </Link>
      </div>
    </nav>
  );
}
