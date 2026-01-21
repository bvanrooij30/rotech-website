"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";

interface AdminTicketStatusFormProps {
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
}

const statuses = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In behandeling" },
  { value: "waiting_customer", label: "Wacht op klant" },
  { value: "resolved", label: "Opgelost" },
  { value: "closed", label: "Gesloten" },
];

const priorities = [
  { value: "low", label: "Laag" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "Hoog" },
  { value: "urgent", label: "Urgent" },
];

export default function AdminTicketStatusForm({ 
  ticketId, 
  currentStatus, 
  currentPriority 
}: AdminTicketStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          priority,
          resolution: status === "resolved" ? resolution : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is een fout opgetreden");
      }

      setSuccess(true);
      router.refresh();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = status !== currentStatus || priority !== currentPriority;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Status bijgewerkt
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Prioriteit</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {priorities.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {status === "resolved" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Oplossing</label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Beschrijf hoe het probleem is opgelost..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !hasChanges}
        className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Opslaan...
          </>
        ) : (
          "Opslaan"
        )}
      </button>
    </form>
  );
}
