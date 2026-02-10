import { Metadata } from "next";
import { auth } from "@/lib/auth";
import PortalNavigation from "@/components/portal/PortalNavigation";

// Force dynamic rendering - auth() uses headers/cookies
export const dynamic = "force-dynamic";

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
  let session = null;
  
  try {
    session = await auth();
  } catch {
    // Auth configuration error - continue without session
  }
  
  return (
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
  );
}
