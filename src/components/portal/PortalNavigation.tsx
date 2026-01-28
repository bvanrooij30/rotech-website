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
  Bot,
  Crown,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    href: "/portal",
    icon: LayoutDashboard,
  },
  {
    label: "Mijn Abonnement",
    href: "/portal/abonnement",
    icon: CreditCard,
  },
  {
    label: "Mijn Producten",
    href: "/portal/producten",
    icon: Package,
  },
  {
    label: "Support",
    href: "/portal/support",
    icon: MessageCircle,
  },
  {
    label: "Facturen",
    href: "/portal/facturen",
    icon: FileText,
  },
  {
    label: "Instellingen",
    href: "/portal/instellingen",
    icon: Settings,
  },
];

// Admin-only navigation items
const adminNavItems = [
  {
    label: "AI Agent Team",
    href: "/portal/ai-agents",
    icon: Bot,
    badge: "NEW",
  },
];

export default function PortalNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="bg-white rounded-xl border border-slate-200 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/portal" && pathname.startsWith(item.href));
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
      
      {/* Admin Section - AI Agent Team */}
      {isAdmin && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2 px-4 mb-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Admin
            </span>
          </div>
          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || 
                pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-slate-200">
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
