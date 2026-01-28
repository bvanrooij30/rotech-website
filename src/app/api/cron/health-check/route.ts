/**
 * Cron Job: Health Check
 * Schedule: Every 5 minutes
 * 
 * Dit is de autonome health check die het systeem live houdt
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const startTime = Date.now();

    // Import dynamically to avoid issues with server components
    const { orchestratorAgent } = await import('@/ai-agents');
    
    // Run health check
    const healthReport = await orchestratorAgent.performHealthCheck();
    
    // Log the result
    console.log(`[CRON] Health check completed in ${Date.now() - startTime}ms`);
    console.log(`[CRON] System health: ${healthReport.overallHealth} (${healthReport.overallScore}/100)`);

    // If critical issues, log them
    const criticalIssues = healthReport.issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      console.error(`[CRON] Critical issues detected: ${criticalIssues.length}`);
      criticalIssues.forEach(issue => {
        console.error(`  - ${issue.title}: ${issue.description}`);
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      health: {
        status: healthReport.overallHealth,
        score: healthReport.overallScore,
        agents: healthReport.agents,
        issues: criticalIssues.length,
      },
    });
  } catch (error) {
    console.error('[CRON] Health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
