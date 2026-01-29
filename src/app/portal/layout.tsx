import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PortalNavigation from "@/components/portal/PortalNavigation";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | Klantenportaal - RoTech Development",
    default: "Klantenportaal - RoTech Development",
  },
  description: "Beheer je projecten, abonnementen en support tickets in het RoTech klantenportaal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Check if on login/register page
  const isAuthPage = false; // This will be handled per-page
  
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-indigo-600">RoTech</span>
                <span className="text-sm text-slate-500">Klantenportaal</span>
              </Link>
              
              {session?.user && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">
                    Welkom, {session.user.name}
                  </span>
                  <form action="/api/auth/signout" method="POST">
                    <button
                      type="submit"
                      className="text-sm text-slate-500 hover:text-slate-700"
                    >
                      Uitloggen
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {session?.user ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Navigation */}
              <aside className="lg:w-64 shrink-0">
                <PortalNavigation />
              </aside>
              
              {/* Main Content */}
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>
          ) : (
            <main className="max-w-md mx-auto">
              {children}
            </main>
          )}
        </div>
      </div>
    </SessionProvider>
  );
}
