'use client';

/**
 * Lead Dashboard - Visueel overzicht van alle gescrapede leads
 * 
 * Features:
 * - Real-time statistieken
 * - Interactieve leads tabel met filters
 * - City & category breakdown
 * - Email campagne status
 */

import { useState, useEffect, useMemo } from 'react';

// Types
interface Lead {
  id: string;
  lead_priority: string;
  lead_score: number;
  name: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  has_website: boolean;
  has_email: boolean;
  rating: number;
  total_reviews: number;
  social_facebook: string;
  social_instagram: string;
  social_linkedin: string;
  categories: string;
  address: string;
  notes: string;
  google_maps_url: string;
  found_date: string;
}

interface Stats {
  total: number;
  hot: number;
  warm: number;
  medium: number;
  low: number;
  withEmail: number;
  withoutWebsite: number;
  withPhone: number;
  avgScore: number;
  cityCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
}

interface EmailStats {
  total_sent: number;
  total_responses: number;
  total_unsubscribes: number;
}

interface LeadsData {
  leads: Lead[];
  stats: Stats;
  emailStats: EmailStats | null;
  files: string[];
  lastUpdated: string;
}

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    HOT: 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30',
    WARM: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30',
    MEDIUM: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30',
    LOW: 'bg-slate-600 text-slate-200',
  };
  
  const icons: Record<string, string> = {
    HOT: '🔥',
    WARM: '🌡️',
    MEDIUM: '📊',
    LOW: '📉',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[priority] || styles.LOW}`}>
      <span>{icons[priority] || '📉'}</span>
      {priority}
    </span>
  );
}

// Stat card component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  gradient,
  trend
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: string;
  gradient: string;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-sm hover:border-slate-700 transition-all duration-300 group">
      <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div className="text-4xl font-bold text-white mb-1">{value}</div>
        <div className="text-slate-400 text-sm">{title}</div>
        {subtitle && <div className="text-slate-500 text-xs mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function LeadDashboard() {
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<'lead_score' | 'name' | 'city' | 'found_date'>('lead_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const url = selectedFile ? `/api/leads?file=${encodeURIComponent(selectedFile)}` : '/api/leads';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Kon data niet laden');
        const result = await response.json();
        setData(result);
        if (!selectedFile && result.files[0]) {
          setSelectedFile(result.files[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Onbekende fout');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedFile]);
  
  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    if (!data?.leads) return [];
    
    const filtered = data.leads.filter(lead => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          lead.name?.toLowerCase().includes(query) ||
          lead.city?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.categories?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && lead.lead_priority !== priorityFilter) return false;
      
      // City filter
      if (cityFilter !== 'all' && lead.city !== cityFilter) return false;
      
      // Email filter
      if (emailFilter === 'with' && !lead.email && !lead.has_email) return false;
      if (emailFilter === 'without' && (lead.email || lead.has_email)) return false;
      
      // Website filter
      if (websiteFilter === 'with' && !lead.has_website && !lead.website) return false;
      if (websiteFilter === 'without' && (lead.has_website || lead.website)) return false;
      
      return true;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'lead_score':
          comparison = (a.lead_score || 0) - (b.lead_score || 0);
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
        case 'found_date':
          comparison = (a.found_date || '').localeCompare(b.found_date || '');
          break;
      }
      return sortDir === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [data?.leads, searchQuery, priorityFilter, cityFilter, emailFilter, websiteFilter, sortBy, sortDir]);
  
  // Paginated leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);
  
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  
  // Get unique cities for filter
  const cities = useMemo(() => {
    if (!data?.stats.cityCounts) return [];
    return Object.entries(data.stats.cityCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => city);
  }, [data?.stats.cityCounts]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Leads laden...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
          <span className="text-4xl mb-4 block">❌</span>
          <h2 className="text-xl font-bold text-red-400 mb-2">Fout bij laden</h2>
          <p className="text-slate-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!data || data.leads.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-12 max-w-lg">
          <span className="text-6xl mb-6 block">📭</span>
          <h2 className="text-2xl font-bold text-white mb-3">Nog geen leads</h2>
          <p className="text-slate-400 mb-6">
            Run eerst de lead finder om leads te verzamelen:
          </p>
          <code className="block bg-slate-800 text-emerald-400 p-4 rounded-lg text-sm font-mono">
            python apify_quick_start.py
          </code>
          <p className="text-slate-500 text-sm mt-4">
            📁 tools/lead-finder/
          </p>
        </div>
      </div>
    );
  }
  
  const stats = data.stats;
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                R
              </div>
              <div>
                <h1 className="text-xl font-bold">Lead Dashboard</h1>
                <p className="text-slate-400 text-sm">RoTech Development</p>
              </div>
            </div>
            
            {/* File selector */}
            <div className="flex items-center gap-4">
              <select
                value={selectedFile}
                onChange={(e) => setSelectedFile(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {data.files.map(file => (
                  <option key={file} value={file}>{file}</option>
                ))}
              </select>
              
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                title="Vernieuwen"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon="🎯"
            title="Totaal Leads"
            value={stats.total}
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
          <StatCard
            icon="🔥"
            title="HOT Leads"
            value={stats.hot}
            subtitle="Perfecte prospects"
            gradient="bg-gradient-to-br from-orange-500 to-red-600"
          />
          <StatCard
            icon="🌡️"
            title="WARM Leads"
            value={stats.warm}
            gradient="bg-gradient-to-br from-yellow-500 to-orange-500"
          />
          <StatCard
            icon="📧"
            title="Met Email"
            value={stats.withEmail}
            subtitle={`${stats.total > 0 ? Math.round(stats.withEmail / stats.total * 100) : 0}% van totaal`}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            icon="❌"
            title="Geen Website"
            value={stats.withoutWebsite}
            subtitle="Beste targets"
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
          />
          <StatCard
            icon="📈"
            title="Gem. Score"
            value={stats.avgScore}
            subtitle="van 100"
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
          />
        </div>
        
        {/* Email Campaign Stats (if available) */}
        {data.emailStats && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📬</span> Email Campagne Status
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">{data.emailStats.total_sent}</div>
                <div className="text-slate-400 text-sm">Emails verstuurd</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-400">{data.emailStats.total_responses}</div>
                <div className="text-slate-400 text-sm">Responses ontvangen</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-500">{data.emailStats.total_unsubscribes}</div>
                <div className="text-slate-400 text-sm">Uitgeschreven</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters & Search */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  placeholder="Zoek op naam, stad, email, telefoon..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Alle prioriteiten</option>
              <option value="HOT">🔥 HOT</option>
              <option value="WARM">🌡️ WARM</option>
              <option value="MEDIUM">📊 MEDIUM</option>
              <option value="LOW">📉 LOW</option>
            </select>
            
            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Alle steden</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            {/* Email Filter */}
            <select
              value={emailFilter}
              onChange={(e) => { setEmailFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Email: Alle</option>
              <option value="with">📧 Met email</option>
              <option value="without">❌ Zonder email</option>
            </select>
            
            {/* Website Filter */}
            <select
              value={websiteFilter}
              onChange={(e) => { setWebsiteFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Website: Alle</option>
              <option value="with">🌐 Met website</option>
              <option value="without">❌ Zonder website</option>
            </select>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-slate-400">
            {filteredLeads.length} van {stats.total} leads gevonden
          </div>
        </div>
        
        {/* Leads Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">Prioriteit</th>
                  <th 
                    className="text-left p-4 text-slate-400 font-medium text-sm cursor-pointer hover:text-white transition"
                    onClick={() => { setSortBy('lead_score'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}
                  >
                    Score {sortBy === 'lead_score' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-left p-4 text-slate-400 font-medium text-sm cursor-pointer hover:text-white transition"
                    onClick={() => { setSortBy('name'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}
                  >
                    Bedrijf {sortBy === 'name' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="text-left p-4 text-slate-400 font-medium text-sm cursor-pointer hover:text-white transition"
                    onClick={() => { setSortBy('city'); setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }}
                  >
                    Stad {sortBy === 'city' && (sortDir === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">Contact</th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">Website</th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">Rating</th>
                  <th className="text-left p-4 text-slate-400 font-medium text-sm">Acties</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((lead, index) => (
                  <tr 
                    key={lead.id || index}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition"
                  >
                    <td className="p-4">
                      <PriorityBadge priority={lead.lead_priority} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                          {lead.lead_score}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-slate-500 text-sm truncate max-w-xs">{lead.categories}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="text-slate-300">{lead.city || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {lead.phone && (
                          <a 
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-2 text-slate-300 hover:text-white transition text-sm"
                          >
                            <span>📞</span> {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a 
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition text-sm"
                          >
                            <span>📧</span> {lead.email}
                          </a>
                        )}
                        {!lead.phone && !lead.email && (
                          <span className="text-slate-600 text-sm">Geen contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {lead.website ? (
                        <a 
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 transition text-sm flex items-center gap-1"
                        >
                          🌐 Bekijk
                        </a>
                      ) : (
                        <span className="text-rose-400 text-sm font-medium">❌ Geen website</span>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.rating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white font-medium">{lead.rating}</span>
                          <span className="text-slate-500 text-sm">({lead.total_reviews})</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {lead.google_maps_url && (
                          <a
                            href={lead.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm"
                            title="Google Maps"
                          >
                            🗺️
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition text-sm"
                            title="WhatsApp"
                          >
                            💬
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-800">
              <div className="text-sm text-slate-400">
                Pagina {currentPage} van {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Vorige
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* City & Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Top Cities */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📍</span> Top Steden
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.cityCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([city, count]) => (
                  <div key={city} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300">{city}</span>
                        <span className="text-slate-500 text-sm">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Top Categories */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📁</span> Top Categorieën
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-300 truncate">{category}</span>
                        <span className="text-slate-500 text-sm">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>💡</span> Lead Finder Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-medium text-orange-400 mb-2">🔥 HOT Leads</div>
              <p className="text-slate-400">Bedrijven zonder website - perfecte prospects voor een eerste website!</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-medium text-emerald-400 mb-2">📧 Email Outreach</div>
              <p className="text-slate-400">Filter op &quot;Met email&quot; voor leads die je direct kunt benaderen.</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-medium text-indigo-400 mb-2">🎯 Lead Score</div>
              <p className="text-slate-400">Hoger = beter. Score is gebaseerd op website status, contact info, en reviews.</p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between text-sm text-slate-500">
          <div>
            Laatst bijgewerkt: {new Date(data.lastUpdated).toLocaleString('nl-NL')}
          </div>
          <div>
            RoTech Development • Interne Tool
          </div>
        </div>
      </footer>
    </div>
  );
}
