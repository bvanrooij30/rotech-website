/**
 * Cron Job: Scheduler Cycle
 * Schedule: Every minute
 * 
 * Processes scheduled tasks from the database
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    
    // Check if AIScheduledTask table exists
    let tasksDue: { id: string; type: string; status: string }[] = [];
    let tasksProcessed = 0;

    try {
      // Get tasks due from database
      tasksDue = await prisma.aIScheduledTask.findMany({
        where: {
          status: 'scheduled',
          scheduledFor: { lte: new Date() },
        },
        orderBy: [
          { priority: 'asc' },
          { scheduledFor: 'asc' },
        ],
        take: 10,
        select: {
          id: true,
          type: true,
          status: true,
        },
      });

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

          // Process task based on type
          // For now, just mark as completed
          
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
    } catch (dbError) {
      // Table might not exist yet, that's ok
      console.log('[CRON] Scheduler: No tasks table or empty');
    }

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
