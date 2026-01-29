import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { 
  FileText, 
  Download, 
  Euro, 
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter
} from "lucide-react";

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requireAdmin();
  
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const statusFilter = params.status || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = statusFilter ? { status: statusFilter } : {};

  const [invoices, total, stats] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true, companyName: true } },
      },
    }),
    prisma.invoice.count({ where }),
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    paid: { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
    open: { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-4 h-4" /> },
    draft: { bg: "bg-slate-100", text: "text-slate-700", icon: <FileText className="w-4 h-4" /> },
    void: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-4 h-4" /> },
    uncollectible: { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="w-4 h-4" /> },
  };

  const totalPaid = stats.find(s => s.status === "paid")?._sum.amount || 0;
  const totalOpen = stats.find(s => s.status === "open")?._sum.amount || 0;

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facturen</h1>
          <p className="text-slate-600">{total} facturen in totaal</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-600">Totaal Facturen</div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="text-sm text-green-600">Betaald</div>
          <div className="text-2xl font-bold text-green-700">€{totalPaid.toLocaleString("nl-NL")}</div>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-sm text-yellow-600">Openstaand</div>
          <div className="text-2xl font-bold text-yellow-700">€{totalOpen.toLocaleString("nl-NL")}</div>
        </div>
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
          <div className="text-sm text-indigo-600">Deze Maand</div>
          <div className="text-2xl font-bold text-indigo-700">€{(totalPaid + totalOpen).toLocaleString("nl-NL")}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form className="flex flex-col sm:flex-row gap-4">
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="open">Open</option>
            <option value="paid">Betaald</option>
            <option value="void">Vervallen</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filteren
          </button>
        </form>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Factuurnummer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Klant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Bedrag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Datum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  Geen facturen gevonden
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{invoice.user.name}</div>
                    <div className="text-sm text-slate-500">{invoice.user.companyName || invoice.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">€{invoice.amount.toLocaleString("nl-NL")}</div>
                    <div className="text-sm text-slate-500">incl. €{invoice.tax.toLocaleString("nl-NL")} BTW</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]?.bg} ${statusColors[invoice.status]?.text}`}>
                      {statusColors[invoice.status]?.icon}
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.createdAt).toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {invoice.pdfUrl && (
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Pagina {page} van {totalPages}
          </div>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/invoices?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Vorige
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/invoices?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Volgende
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
