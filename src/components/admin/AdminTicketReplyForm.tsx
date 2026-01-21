"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

interface AdminTicketReplyFormProps {
  ticketId: string;
  adminName: string;
}

export default function AdminTicketReplyForm({ ticketId, adminName }: AdminTicketReplyFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, senderName: adminName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is een fout opgetreden");
      }

      setMessage("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er is een fout opgetreden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-4">
      <h3 className="font-bold text-slate-900 mb-4">Reageren als Support</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Typ je reactie naar de klant..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          disabled={loading}
        />
        
        <div className="flex items-center justify-between gap-3 mt-4">
          <p className="text-sm text-slate-500">
            Wordt verzonden als: <strong>{adminName}</strong>
          </p>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Versturen...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Versturen
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
