/**
 * AI Agents Health Check API
 * GET /api/ai-agents/health - Perform system health check
 * POST /api/ai-agents/health - Run fallback controller
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  performSystemHealthCheck,
  runFallbackController,
  initializeAgents,
  getAllHeartbeats,
} from '@/lib/ai-agents/heartbeat';

// Initialize flag
let initialized = false;

/**
 * GET - Perform health check
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize if needed
    if (!initialized) {
      await initializeAgents();
      initialized = true;
    }

    const healthReport = await performSystemHealthCheck();
    const heartbeats = getAllHeartbeats();

    return NextResponse.json({
      success: true,
      health: healthReport,
      heartbeats: heartbeats.map(h => ({
        agentId: h.agentId,
        status: h.status,
        lastHeartbeat: h.lastHeartbeat,
        uptimeSeconds: h.uptimeSeconds,
        tasksCompleted: h.tasksCompleted,
        errorCount: h.errorCount,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}

/**
 * POST - Run fallback controller to recover failed agents
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize if needed
    if (!initialized) {
      await initializeAgents();
      initialized = true;
    }

    // Run fallback controller
    const result = await runFallbackController();

    return NextResponse.json({
      success: true,
      recovered: result.recovered,
      failed: result.failed,
      message: result.recovered.length > 0
        ? `${result.recovered.length} agent(s) recovered`
        : 'No agents needed recovery',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Fallback controller error:', error);
    return NextResponse.json(
      { success: false, error: 'Fallback controller failed' },
      { status: 500 }
    );
  }
}
