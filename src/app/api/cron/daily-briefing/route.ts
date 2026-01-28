/**
 * Cron Job: Daily Briefing
 * Schedule: 8:00 AM every day
 * 
 * Genereert de dagelijkse briefing via de Master Agent
 */

import { NextRequest, NextResponse } from 'next/server';

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
    
    // Import agents
    const { masterAgent } = await import('@/ai-agents');
    const { prisma } = await import('@/ai-agents/core/database');

    // Generate daily briefing
    const briefing = await masterAgent.generateDailyBriefing();
    
    // Save to database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.aIDailyBriefing.upsert({
      where: { date: today },
      update: {
        healthScore: briefing.healthScore,
        healthStatus: briefing.healthStatus,
        highlights: JSON.stringify(briefing.highlights),
        concerns: JSON.stringify(briefing.concerns),
        metrics: JSON.stringify(briefing.metrics),
        tasksCompleted: briefing.tasksSummary.completed,
        tasksScheduled: briefing.tasksSummary.scheduled,
        tasksOverdue: briefing.tasksSummary.overdue,
        projectsActive: briefing.projectsSummary.active,
        projectsAtRisk: briefing.projectsSummary.atRisk,
        newLeads: briefing.marketingSummary.newLeads,
        activeCampaigns: briefing.marketingSummary.activeCampaigns,
        recommendations: JSON.stringify(briefing.recommendations),
        actionItems: JSON.stringify(briefing.actionItems),
      },
      create: {
        date: today,
        healthScore: briefing.healthScore,
        healthStatus: briefing.healthStatus,
        highlights: JSON.stringify(briefing.highlights),
        concerns: JSON.stringify(briefing.concerns),
        metrics: JSON.stringify(briefing.metrics),
        tasksCompleted: briefing.tasksSummary.completed,
        tasksScheduled: briefing.tasksSummary.scheduled,
        tasksOverdue: briefing.tasksSummary.overdue,
        projectsActive: briefing.projectsSummary.active,
        projectsAtRisk: briefing.projectsSummary.atRisk,
        newLeads: briefing.marketingSummary.newLeads,
        activeCampaigns: briefing.marketingSummary.activeCampaigns,
        recommendations: JSON.stringify(briefing.recommendations),
        actionItems: JSON.stringify(briefing.actionItems),
      },
    });

    console.log(`[CRON] Daily briefing generated in ${Date.now() - startTime}ms`);
    console.log(`[CRON] Health: ${briefing.healthStatus}, Score: ${briefing.healthScore}`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      briefing: {
        healthScore: briefing.healthScore,
        healthStatus: briefing.healthStatus,
        highlights: briefing.highlights.length,
        recommendations: briefing.recommendations.length,
      },
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
