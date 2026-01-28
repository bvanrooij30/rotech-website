"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Star,
  Clock,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  MessageCircle,
  FileText,
} from "lucide-react";

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  source: string;
  interest: string;
  score: number;
  status: string;
  createdAt: string;
  notes: string[];
}

interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  avgScore: number;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "Nieuw" },
  contacted: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Gecontacteerd" },
  qualified: { bg: "bg-green-100", text: "text-green-700", label: "Gekwalificeerd" },
  proposal: { bg: "bg-purple-100", text: "text-purple-700", label: "Offerte" },
  won: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Gewonnen" },
  lost: { bg: "bg-red-100", text: "text-red-700", label: "Verloren" },
};

const sourceIcons: Record<string, React.ReactNode> = {
  linkedin: <div className="w-5 h-5 bg-blue-600 text-white rounded text-xs flex items-center justify-center font-bold">in</div>,
  google: <div className="w-5 h-5 bg-red-500 text-white rounded text-xs flex items-center justify-center font-bold">G</div>,
  website: <div className="w-5 h-5 bg-indigo-500 text-white rounded text-xs flex items-center justify-center font-bold">W</div>,
  referral: <Users className="w-5 h-5 text-green-500" />,
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ai-agents/leads");
      const result = await response.json();
      
      if (result.success) {
        setLeads(result.data.leads);
        setStats(result.data.stats);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Kon leads niet laden");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Leads laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/portal/ai-agents"
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar AI Agents
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Lead Management
          </h1>
          <p className="text-slate-600 mt-1">
            Beheerd door Marketing Agent
          </p>
        </div>
        <button
          onClick={fetchLeads}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" />
          Vernieuwen
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-600">Totaal</div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <div className="text-sm text-blue-600">Nieuw</div>
            <div className="text-2xl font-bold text-blue-700">{stats.new}</div>
          </div>
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
            <div className="text-sm text-yellow-600">Gecontacteerd</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.contacted}</div>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <div className="text-sm text-green-600">Gekwalificeerd</div>
            <div className="text-2xl font-bold text-green-700">{stats.qualified}</div>
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
            <div className="text-sm text-purple-600">Offerte</div>
            <div className="text-2xl font-bold text-purple-700">{stats.proposal}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Zoek op bedrijf, naam of email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter(null)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !statusFilter
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Alle
            </button>
            {Object.entries(statusColors).map(([status, config]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? `${config.bg} ${config.text}`
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Geen leads gevonden
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {sourceIcons[lead.source] || <Building2 className="w-5 h-5 text-slate-400" />}
                    <div>
                      <div className="font-medium text-slate-900">{lead.companyName}</div>
                      <div className="text-sm text-slate-600">{lead.contactName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                      Score: {lead.score}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]?.bg} ${statusColors[lead.status]?.text}`}>
                      {statusColors[lead.status]?.label || lead.status}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${selectedLead?.id === lead.id ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedLead?.id === lead.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <a href={`mailto:${lead.email}`} className="text-indigo-600 hover:underline">
                            {lead.email}
                          </a>
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <a href={`tel:${lead.phone}`} className="text-indigo-600 hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">
                            {new Date(lead.createdAt).toLocaleDateString("nl-NL")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700 mb-2">Interesse:</div>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          {lead.interest}
                        </p>
                      </div>
                    </div>

                    {lead.notes.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-slate-700 mb-2">Notities:</div>
                        <ul className="space-y-1">
                          {lead.notes.map((note, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200">
                        <Mail className="w-4 h-4" />
                        Email Sturen
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                        <Phone className="w-4 h-4" />
                        Bellen
                      </button>
                      <button className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                        <FileText className="w-4 h-4" />
                        Offerte Maken
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          AI Inzichten
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium">Best Presterende Bron</div>
            <div className="opacity-90 mt-1">LinkedIn levert de hoogste kwaliteit leads (avg score: 82)</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium">Aanbeveling</div>
            <div className="opacity-90 mt-1">Focus op referral programma - 100% conversie rate</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="font-medium">Hot Lead Alert</div>
            <div className="opacity-90 mt-1">Fitness Studio Veldhoven - Score 90, klaar voor offerte</div>
          </div>
        </div>
      </div>
    </div>
  );
}
