/**
 * API Route: /api/leads
 * Haalt leads data op uit de CSV/JSON bestanden
 * 
 * ⚠️ ALLEEN TOEGANKELIJK OP LOCALHOST
 * Deze route is geblokkeerd in productie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';

// Check of request van localhost komt
async function isLocalhost(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const headersList = await headers();
  const host = headersList.get('host') || '';
  
  const localhostPatterns = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
  return localhostPatterns.some(pattern => host.includes(pattern));
}

export interface Lead {
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

export interface EmailStats {
  total_sent: number;
  total_responses: number;
  total_unsubscribes: number;
  daily_counts: Record<string, number>;
  hourly_counts: Record<string, number>;
}

export interface LeadsResponse {
  leads: Lead[];
  stats: {
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
  };
  emailStats: EmailStats | null;
  files: string[];
  lastUpdated: string;
}

// Parse CSV naar JSON
function parseCSV(content: string): Lead[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(';').map(h => h.trim());
  const leads: Lead[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');
    const lead: Record<string, string | number | boolean> = {};
    
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      if (header === 'lead_score' || header === 'rating' || header === 'total_reviews') {
        lead[header] = parseFloat(value) || 0;
      } else if (header === 'has_website' || header === 'has_email') {
        lead[header] = value.toLowerCase() === 'ja' || value.toLowerCase() === 'yes' || value === 'true' || value === '1';
      } else {
        lead[header] = value;
      }
    });
    
    // Genereer ID
    lead.id = `lead-${i}-${Date.now()}`;
    
    if (lead.name) {
      leads.push(lead as unknown as Lead);
    }
  }
  
  return leads;
}

export async function GET(request: NextRequest) {
  // Blokkeer in productie
  const isLocal = await isLocalhost();
  if (!isLocal) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }
  
  try {
    const outputDir = path.join(process.cwd(), 'tools', 'lead-finder', 'output');
    const emailOutreachDir = path.join(outputDir, 'email_outreach');
    
    // Lees alle CSV bestanden
    let files: string[] = [];
    try {
      const allFiles = await fs.readdir(outputDir);
      files = allFiles.filter(f => f.endsWith('.csv')).sort().reverse();
    } catch {
      // Directory bestaat niet
    }
    
    // Zoek naar specifiek bestand of meest recente
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file');
    
    let leads: Lead[] = [];
    let selectedFile = fileName || files[0];
    
    if (selectedFile) {
      try {
        const filePath = path.join(outputDir, selectedFile);
        const content = await fs.readFile(filePath, 'utf-8');
        leads = parseCSV(content);
      } catch {
        // Bestand niet gevonden
      }
    }
    
    // Laad email stats
    let emailStats: EmailStats | null = null;
    try {
      const statsPath = path.join(emailOutreachDir, 'stats.json');
      const statsContent = await fs.readFile(statsPath, 'utf-8');
      emailStats = JSON.parse(statsContent);
    } catch {
      // Geen email stats
    }
    
    // Bereken statistieken
    const stats = {
      total: leads.length,
      hot: leads.filter(l => l.lead_priority === 'HOT').length,
      warm: leads.filter(l => l.lead_priority === 'WARM').length,
      medium: leads.filter(l => l.lead_priority === 'MEDIUM').length,
      low: leads.filter(l => l.lead_priority === 'LOW').length,
      withEmail: leads.filter(l => l.has_email || l.email).length,
      withoutWebsite: leads.filter(l => !l.has_website).length,
      withPhone: leads.filter(l => l.phone).length,
      avgScore: leads.length > 0 
        ? Math.round(leads.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leads.length) 
        : 0,
      cityCounts: leads.reduce((acc, l) => {
        const city = l.city || 'Onbekend';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      categoryCounts: leads.reduce((acc, l) => {
        const cats = (l.categories || '').split(',').map(c => c.trim()).filter(Boolean);
        cats.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
    };
    
    const response: LeadsResponse = {
      leads,
      stats,
      emailStats,
      files,
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error loading leads:', error);
    return NextResponse.json(
      { error: 'Kon leads niet laden', details: String(error) },
      { status: 500 }
    );
  }
}
