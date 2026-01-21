import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Facturen",
};

export default async function InvoicesPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/portal/login");
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "open":
        return "bg-blue-100 text-blue-700";
      case "draft":
        return "bg-slate-100 text-slate-600";
      case "void":
        return "bg-red-100 text-red-600";
      case "uncollectible":
        return "bg-red-100 text-red-600";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "Betaald",
      open: "Open",
      draft: "Concept",
      void: "Vervallen",
      uncollectible: "Oninbaar",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "open":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const openInvoices = invoices.filter(i => i.status === "open");
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalPaid = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalOpen = openInvoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Facturen</h1>
        <p className="text-slate-600">Bekijk en download je facturen.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-slate-900">{invoices.length}</p>
          <p className="text-sm text-slate-500">Totaal facturen</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-blue-600">{openInvoices.length}</p>
          <p className="text-sm text-slate-500">Open</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-slate-500">Totaal betaald</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-2xl font-bold text-amber-600">{formatCurrency(totalOpen)}</p>
          <p className="text-sm text-slate-500">Openstaand</p>
        </div>
      </div>

      {/* Open Invoices Alert */}
      {openInvoices.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Openstaande facturen</p>
            <p className="text-sm text-amber-700">
              Je hebt {openInvoices.length} openstaande factu{openInvoices.length === 1 ? "ur" : "ren"}{" "}
              met een totaalbedrag van {formatCurrency(totalOpen)}.
            </p>
          </div>
        </div>
      )}

      {/* Invoices List */}
      {invoices.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left text-sm font-medium text-slate-600 px-5 py-3">
                    Factuurnummer
                  </th>
                  <th className="text-left text-sm font-medium text-slate-600 px-5 py-3">
                    Datum
                  </th>
                  <th className="text-left text-sm font-medium text-slate-600 px-5 py-3">
                    Beschrijving
                  </th>
                  <th className="text-right text-sm font-medium text-slate-600 px-5 py-3">
                    Bedrag
                  </th>
                  <th className="text-center text-sm font-medium text-slate-600 px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-sm font-medium text-slate-600 px-5 py-3">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-slate-900">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {invoice.description || "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-medium text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        incl. {formatCurrency(invoice.tax)} BTW
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.pdfUrl && (
                          <a
                            href={invoice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </a>
                        )}
                        {invoice.status === "open" && invoice.stripeInvoiceId && (
                          <a
                            href={`https://invoice.stripe.com/i/${invoice.stripeInvoiceId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Betalen
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Geen facturen</h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Je hebt nog geen facturen. Zodra je een project start of abonnement afsluit, 
            verschijnen je facturen hier.
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-3">Betalingsinformatie</h2>
        <p className="text-sm text-slate-600 mb-4">
          Facturen kunnen worden betaald via iDEAL, creditcard of bankoverschrijving. 
          Bij openstaande facturen ontvang je een betaallink per e-mail.
        </p>
        <p className="text-sm text-slate-600">
          Vragen over een factuur?{" "}
          <Link href="/portal/support/nieuw" className="text-indigo-600 hover:underline">
            Maak een support ticket aan
          </Link>{" "}
          of neem contact op via{" "}
          <a href="mailto:contact@ro-techdevelopment.dev" className="text-indigo-600 hover:underline">
            contact@ro-techdevelopment.dev
          </a>
        </p>
      </div>
    </div>
  );
}
