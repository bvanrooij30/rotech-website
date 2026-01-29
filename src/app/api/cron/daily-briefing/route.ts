/**
 * Cron Job: Daily Briefing
 * Schedule: 8:00 AM every day
 * 
 * Generates daily business briefing
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();
    
    // Gather metrics from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get counts
    const [
      totalUsers,
      totalTickets,
      openTickets,
      totalLeads,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.aILead.count().catch(() => 0),
    ]);

    // Generate simple briefing
    const healthScore = openTickets === 0 ? 100 : Math.max(60, 100 - (openTickets * 5));
    const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'attention' : 'critical';

    const briefing = {
      date: today.toISOString(),
      healthScore,
      healthStatus,
      metrics: {
        totalUsers,
        totalTickets,
        openTickets,
        totalLeads,
      },
      highlights: [
        `${totalUsers} actieve gebruikers`,
        `${openTickets} openstaande tickets`,
        `${totalLeads} leads in pipeline`,
      ],
      recommendations: openTickets > 5 
        ? ['Hoge ticket load - overweeg prioritering'] 
        : [],
    };

    // Try to save briefing to database
    try {
      await prisma.aIDailyBriefing.upsert({
        where: { date: today },
        update: {
          healthScore: briefing.healthScore,
          healthStatus: briefing.healthStatus,
          highlights: JSON.stringify(briefing.highlights),
          concerns: JSON.stringify([]),
          metrics: JSON.stringify(briefing.metrics),
          tasksCompleted: 0,
          tasksScheduled: 0,
          tasksOverdue: openTickets,
          projectsActive: 0,
          projectsAtRisk: 0,
          newLeads: totalLeads,
          activeCampaigns: 0,
          recommendations: JSON.stringify(briefing.recommendations),
          actionItems: JSON.stringify([]),
        },
        create: {
          date: today,
          healthScore: briefing.healthScore,
          healthStatus: briefing.healthStatus,
          highlights: JSON.stringify(briefing.highlights),
          concerns: JSON.stringify([]),
          metrics: JSON.stringify(briefing.metrics),
          tasksCompleted: 0,
          tasksScheduled: 0,
          tasksOverdue: openTickets,
          projectsActive: 0,
          projectsAtRisk: 0,
          newLeads: totalLeads,
          activeCampaigns: 0,
          recommendations: JSON.stringify(briefing.recommendations),
          actionItems: JSON.stringify([]),
        },
      });
    } catch {
      // Table might not exist, that's ok
      console.log('[CRON] Could not save briefing to database');
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON] Daily briefing generated in ${duration}ms`);
    console.log(`[CRON] Health: ${briefing.healthStatus}, Score: ${briefing.healthScore}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      briefing,
    });
  } catch (error) {
    console.error('[CRON] Daily briefing failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
