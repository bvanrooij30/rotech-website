"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Package, 
  LifeBuoy, 
  FileText, 
  Settings, 
  Shield, 
  Activity,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Zap
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import type { AdminUser } from "@/lib/admin";

interface AdminSidebarProps {
  admin: AdminUser;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Gebruikers", href: "/admin/users", icon: Users },
  { name: "Abonnementen", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Producten", href: "/admin/products", icon: Package },
  { name: "Support Tickets", href: "/admin/tickets", icon: LifeBuoy },
  { name: "Facturen", href: "/admin/invoices", icon: FileText },
  { name: "API & Webhooks", href: "/admin/api", icon: Zap },
  { name: "Audit Log", href: "/admin/audit", icon: Activity },
  { name: "Instellingen", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = admin.role === "super_admin";

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-400" />
          <span className="text-white font-bold">Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold">RoTech Admin</h1>
                <p className="text-xs text-slate-400">
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? "bg-indigo-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {admin.email}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="mt-2 space-y-1">
              <Link
                href="/portal"
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <Package className="w-4 h-4" />
                Naar Portaal
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/portal/login" })}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" />
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
