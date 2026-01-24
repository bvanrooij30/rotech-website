"use client";

import { useState } from "react";
import {
  CreditCard,
  XCircle,
  RotateCcw,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SubscriptionActionsProps {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
  status: string;
}

export function SubscriptionActions({
  subscriptionId,
  cancelAtPeriodEnd,
  status,
}: SubscriptionActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [localCancelAtPeriodEnd, setLocalCancelAtPeriodEnd] = useState(cancelAtPeriodEnd);

  const handleAction = async (action: string) => {
    setIsLoading(action);
    setMessage(null);

    try {
      const response = await fetch("/api/portal/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Er is een fout opgetreden");
      }

      if (action === "billing-portal" && data.portalUrl) {
        window.location.href = data.portalUrl;
        return;
      }

      // Update local state
      if (action === "cancel") {
        setLocalCancelAtPeriodEnd(true);
        setShowCancelConfirm(false);
      } else if (action === "resume") {
        setLocalCancelAtPeriodEnd(false);
      }

      setMessage({ type: "success", text: data.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Er is een fout opgetreden",
      });
    } finally {
      setIsLoading(null);
    }
  };

  if (status !== "active" && status !== "past_due") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <p className={message.type === "success" ? "text-emerald-800" : "text-red-800"}>
            {message.text}
          </p>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <h4 className="font-bold text-amber-900 mb-2">Weet je het zeker?</h4>
          <p className="text-sm text-amber-800 mb-4">
            Je abonnement wordt beëindigd aan het einde van de huidige facturatieperiode.
            Je behoudt toegang tot alle functies tot die datum.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Annuleren
            </button>
            <button
              onClick={() => handleAction("cancel")}
              disabled={isLoading === "cancel"}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading === "cancel" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Ja, opzeggen
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Billing Portal */}
        <button
          onClick={() => handleAction("billing-portal")}
          disabled={isLoading === "billing-portal"}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
        >
          {isLoading === "billing-portal" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Betaalgegevens beheren
          <ExternalLink className="w-3 h-3" />
        </button>

        {/* Cancel or Resume */}
        {localCancelAtPeriodEnd ? (
          <button
            onClick={() => handleAction("resume")}
            disabled={isLoading === "resume"}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
          >
            {isLoading === "resume" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Opzegging ongedaan maken
          </button>
        ) : (
          !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              <XCircle className="w-4 h-4" />
              Abonnement opzeggen
            </button>
          )
        )}
      </div>
    </div>
  );
}
