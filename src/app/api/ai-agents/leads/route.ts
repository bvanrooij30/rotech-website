/**
 * AI Agents API - Leads Endpoint
 * GET /api/ai-agents/leads - Get marketing leads
 * POST /api/ai-agents/leads - Create new lead
 * 
 * Dit haalt ECHTE data uit de database
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/ai-agents/core/database';
import { z } from 'zod';

// Schema for creating a new lead
const createLeadSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  source: z.string().min(1),
  interest: z.string().min(1),
  message: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

async function getLeadsFromDatabase() {
  // Get all leads from database
  const leads = await prisma.aILead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  });
  
  return leads.map(lead => ({
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    interest: lead.interest,
    score: lead.score,
    status: lead.status,
    createdAt: lead.createdAt.toISOString(),
    notes: lead.notes ? JSON.parse(lead.notes) : [],
  }));
}

// Fallback demo data if database is empty
function getDemoLeadsData() {
  const now = new Date();
  
  return [
    {
      id: 'lead-001',
      companyName: 'Bakkerij Van Dijk',
      contactName: 'Peter van Dijk',
      email: 'peter@bakkerijvandijk.nl',
      phone: '06-12345678',
      source: 'linkedin',
      interest: 'Webshop voor online bestellingen',
      score: 85,
      status: 'qualified',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Wil graag voor het seizoen live', 'Budget rond €4000'],
    },
    {
      id: 'lead-002',
      companyName: 'Schildersbedrijf De Kleur',
      contactName: 'Mark Jansen',
      email: 'info@dekleur.nl',
      source: 'google',
      interest: 'Nieuwe bedrijfswebsite',
      score: 72,
      status: 'new',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: [],
    },
    {
      id: 'lead-003',
      companyName: 'Fitness Studio Veldhoven',
      contactName: 'Lisa Peters',
      email: 'lisa@fitnessstudio-veldhoven.nl',
      phone: '06-98765432',
      source: 'referral',
      interest: 'Website met lesrooster en booking systeem',
      score: 90,
      status: 'proposal',
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Enthousiast over PWA mogelijkheid', 'Wil ook app-achtige ervaring'],
    },
    {
      id: 'lead-004',
      companyName: 'Accountancy Firm Brabant',
      contactName: 'Johan de Vries',
      email: 'j.devries@afbrabant.nl',
      source: 'linkedin',
      interest: 'Klantenportaal ontwikkeling',
      score: 95,
      status: 'qualified',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Maatwerk project', 'Moet integreren met Exact Online'],
    },
    {
      id: 'lead-005',
      companyName: 'Hoveniersbedrijf Groen',
      contactName: 'Kees Groen',
      email: 'kees@hoveniersgroen.nl',
      source: 'google',
      interest: 'SEO verbetering bestaande website',
      score: 65,
      status: 'contacted',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Heeft al website maar is niet vindbaar'],
    },
    {
      id: 'lead-006',
      companyName: 'Restaurant Het Smakelijk',
      contactName: 'Anna Smit',
      email: 'anna@hetsmakelijk.nl',
      phone: '040-1234567',
      source: 'website',
      interest: 'Online reserveringssysteem',
      score: 78,
      status: 'new',
      createdAt: now.toISOString(),
      notes: [],
    },
    {
      id: 'lead-007',
      companyName: 'Autogarage Snelservice',
      contactName: 'Tom Bakker',
      email: 'tom@snelservice.nl',
      source: 'linkedin',
      interest: 'Website vernieuwen + online afspraken',
      score: 70,
      status: 'contacted',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Interesse in automatisering werkplaatsplanning'],
    },
    {
      id: 'lead-008',
      companyName: 'Tandartspraktijk Smile',
      contactName: 'Dr. M. van den Berg',
      email: 'info@tandarts-smile.nl',
      source: 'referral',
      interest: 'Moderne website met online afspraken',
      score: 82,
      status: 'qualified',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Doorverwijzing van Fitness Studio', 'Wil graag professionele uitstraling'],
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Try to get leads from database, fall back to demo data
    let leads = await getLeadsFromDatabase();
    
    // If no leads in database, use demo data
    if (leads.length === 0) {
      leads = getDemoLeadsData();
    }
    
    // Calculate stats
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      proposal: leads.filter(l => l.status === 'proposal').length,
      avgScore: leads.length > 0 
        ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        leads,
        stats,
      },
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new lead
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createLeadSchema.parse(body);

    // Create lead in database
    const lead = await prisma.aILead.create({
      data: {
        companyName: validated.companyName,
        contactName: validated.contactName,
        email: validated.email,
        phone: validated.phone,
        website: validated.website,
        source: validated.source,
        interest: validated.interest,
        message: validated.message,
        budget: validated.budget,
        timeline: validated.timeline,
        score: 50, // Will be updated by AI scoring
        status: 'new',
      },
    });

    // Log the lead creation
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'created',
        title: 'Lead aangemaakt',
        details: `Lead van ${validated.source}`,
        agentId: 'intake-agent',
      },
    });

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
