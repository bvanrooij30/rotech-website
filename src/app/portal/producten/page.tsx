import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  Globe,
  ExternalLink,
  Calendar,
  Shield,
  ArrowRight,
  Plus,
} from "lucide-react";

export const metadata = {
  title: "Mijn Producten",
};

export default async function ProductsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/portal/login");
  }

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: "active" },
        take: 1,
      },
      statusUpdates: {
        orderBy: { createdAt: "desc" },
        take: 3,
        where: { isPublic: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "development":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "maintenance":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "archived":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
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
      webapp: "Web Applicatie",
      api: "API / Integratie",
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Mijn Producten</h1>
        <p className="text-slate-600">
          Bekijk je websites, webshops en applicaties die wij voor je hebben gebouwd.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                      {product.type === "website" || product.type === "webshop" ? (
                        <Globe className="w-7 h-7 text-indigo-600" />
                      ) : (
                        <Package className="w-7 h-7 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(product.status)}`}>
                          {getStatusLabel(product.status)}
                        </span>
                      </div>
                      <p className="text-slate-500 mb-2">{getTypeLabel(product.type)}</p>
                      {product.domain && (
                        <a
                          href={`https://${product.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        >
                          {product.domain}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {product.subscriptions.length > 0 && (
                      <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        Onderhoud actief
                      </span>
                    )}
                    <Link
                      href={`/portal/producten/${product.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200"
                    >
                      Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-sm text-slate-500">
                  {product.launchDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Live sinds {formatDate(product.launchDate)}</span>
                    </div>
                  )}
                  {product.hostingProvider && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Hosting: {product.hostingProvider}</span>
                    </div>
                  )}
                </div>

                {/* Recent Status Updates */}
                {product.statusUpdates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-400 uppercase mb-2">
                      Recente updates
                    </p>
                    <div className="space-y-2">
                      {product.statusUpdates.map((update) => (
                        <div key={update.id} className="flex items-start gap-2 text-sm">
                          <span className="text-slate-400">
                            {formatDate(update.createdAt)}:
                          </span>
                          <span className="text-slate-700">{update.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Geen producten gevonden</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Je hebt nog geen websites of applicaties bij ons. 
            Vraag een offerte aan om te beginnen!
          </p>
          <Link
            href="/offerte"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" /> Vraag een offerte aan
          </Link>
        </div>
      )}
    </div>
  );
}
