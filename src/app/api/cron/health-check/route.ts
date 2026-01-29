/**
 * Cron Job: Health Check
 * Schedule: Every 5 minutes
 * 
 * Performs system health checks
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    // Perform basic health checks
    const checks = {
      database: false,
      users: 0,
      tickets: 0,
    };

    // Check database connection
    try {
      const userCount = await prisma.user.count();
      const ticketCount = await prisma.supportTicket.count();
      checks.database = true;
      checks.users = userCount;
      checks.tickets = ticketCount;
    } catch (dbError) {
      console.error('[CRON] Database check failed:', dbError);
    }

    const duration = Date.now() - startTime;
    const overallHealth = checks.database ? 'healthy' : 'degraded';
    const overallScore = checks.database ? 100 : 50;

    console.log(`[CRON] Health check completed in ${duration}ms`);
    console.log(`[CRON] System health: ${overallHealth} (${overallScore}/100)`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      health: {
        status: overallHealth,
        score: overallScore,
        checks,
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
