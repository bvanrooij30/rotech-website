/**
 * Cron Job: Scheduler Cycle
 * Schedule: Every minute
 * 
 * Voert de scheduler cycle uit voor taakverwerking
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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
    
    const { schedulerAgent } = await import('@/ai-agents');
    const { prisma } = await import('@/ai-agents/core/database');

    // Get tasks due from database
    const tasksDue = await prisma.aIScheduledTask.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: { lte: new Date() },
      },
      orderBy: [
        { priority: 'asc' },
        { scheduledFor: 'asc' },
      ],
      take: 10, // Process max 10 tasks per cycle
    });

    let tasksProcessed = 0;

    for (const task of tasksDue) {
      try {
        // Mark as running
        await prisma.aIScheduledTask.update({
          where: { id: task.id },
          data: { 
            status: 'running',
            startedAt: new Date(),
          },
        });

        // Execute task based on type
        // In production, this would call the appropriate agent
        
        // Mark as completed
        await prisma.aIScheduledTask.update({
          where: { id: task.id },
          data: { 
            status: 'completed',
            completedAt: new Date(),
          },
        });

        tasksProcessed++;
      } catch (taskError) {
        await prisma.aIScheduledTask.update({
          where: { id: task.id },
          data: { 
            status: 'failed',
            completedAt: new Date(),
            errorMessage: taskError instanceof Error ? taskError.message : 'Unknown error',
          },
        });
      }
    }

    // Also run in-memory scheduler cycle
    await schedulerAgent.runSchedulerCycle();

    const duration = Date.now() - startTime;
    console.log(`[CRON] Scheduler cycle: ${tasksProcessed}/${tasksDue.length} tasks in ${duration}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      tasks: {
        due: tasksDue.length,
        processed: tasksProcessed,
      },
    });
  } catch (error) {
    console.error('[CRON] Scheduler cycle failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
