"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreVertical, 
  Edit, 
  Pause,
  Play,
  XCircle,
  Clock,
  RefreshCw,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface SubscriptionActionsMenuProps {
  subscriptionId: string;
  status: string;
  planName: string;
}

export default function SubscriptionActionsMenu({ 
  subscriptionId, 
  status, 
  planName 
}: SubscriptionActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (action: string, additionalData?: Record<string, unknown>) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...additionalData }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || "Er is een fout opgetreden");
      }
    } catch (error) {
      alert("Er is een fout opgetreden");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleAddUsage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await handleAction("add_usage", {
      description: formData.get("description"),
      hours: formData.get("hours"),
      category: formData.get("category"),
    });
    
    setShowUsageModal(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 hover:bg-slate-100 rounded-lg"
          disabled={loading}
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
            <Link
              href={`/admin/subscriptions/${subscriptionId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Edit className="w-4 h-4" />
              Bewerken
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                setShowUsageModal(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Clock className="w-4 h-4" />
              Uren Toevoegen
            </button>

            <button
              onClick={() => handleAction("reset_hours")}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Uren
            </button>

            <hr className="my-1 border-slate-200" />

            {status === "active" && (
              <button
                onClick={() => handleAction("pause")}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-600 hover:bg-slate-50"
              >
                <Pause className="w-4 h-4" />
                Pauzeren
              </button>
            )}

            {status === "paused" && (
              <button
                onClick={() => handleAction("resume")}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-600 hover:bg-slate-50"
              >
                <Play className="w-4 h-4" />
                Hervatten
              </button>
            )}

            {status !== "cancelled" && (
              <button
                onClick={() => {
                  if (confirm(`Weet je zeker dat je ${planName} wilt annuleren?`)) {
                    handleAction("cancel");
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4" />
                Annuleren
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Usage Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Uren Toevoegen
            </h3>
            <form onSubmit={handleAddUsage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Beschrijving
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Bijv. Security update geïnstalleerd"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Uren
                  </label>
                  <input
                    type="number"
                    name="hours"
                    step="0.25"
                    min="0.25"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Categorie
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="update">Update</option>
                    <option value="bugfix">Bugfix</option>
                    <option value="feature">Feature</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
