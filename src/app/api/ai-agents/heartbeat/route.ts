/**
 * AI Agent Heartbeat API
 * POST /api/ai-agents/heartbeat - Record agent heartbeat
 * GET /api/ai-agents/heartbeat - Get all heartbeats
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import {
  recordHeartbeat,
  getAllHeartbeats,
  getHeartbeat,
  isAgentResponsive,
  AGENT_REGISTRY,
} from '@/lib/ai-agents/heartbeat';

// Validation schema
const heartbeatSchema = z.object({
  agentId: z.string(),
  status: z.enum(['online', 'offline', 'degraded', 'starting', 'error']),
  metrics: z.object({
    tasksCompleted: z.number().optional(),
    errorCount: z.number().optional(),
    version: z.string().optional(),
    lastError: z.string().optional(),
  }).optional(),
});

/**
 * POST - Record heartbeat from an agent
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request
    const body = await request.json();
    const result = heartbeatSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid heartbeat data', details: result.error.issues },
        { status: 400 }
      );
    }

    const { agentId, status, metrics } = result.data;

    // Verify agent exists in registry
    const allAgents = [...AGENT_REGISTRY.system, ...AGENT_REGISTRY.service];
    const agent = allAgents.find(a => a.id === agentId);
    
    if (!agent) {
      return NextResponse.json(
        { error: `Unknown agent: ${agentId}` },
        { status: 404 }
      );
    }

    // Record heartbeat
    await recordHeartbeat(agentId, status, metrics);

    return NextResponse.json({
      success: true,
      agentId,
      status,
      recorded: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record heartbeat' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get all heartbeats (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const heartbeats = getAllHeartbeats();
    const allAgents = [...AGENT_REGISTRY.system, ...AGENT_REGISTRY.service];

    // Create complete status for all agents
    const agentStatuses = allAgents.map(agent => {
      const heartbeat = getHeartbeat(agent.id);
      const responsive = isAgentResponsive(agent.id);

      return {
        agentId: agent.id,
        name: agent.name,
        role: agent.role,
        critical: agent.critical,
        hasHeartbeat: !!heartbeat,
        isResponsive: responsive,
        status: heartbeat?.status ?? 'unknown',
        lastHeartbeat: heartbeat?.lastHeartbeat ?? null,
        uptimeSeconds: heartbeat?.uptimeSeconds ?? 0,
        tasksCompleted: heartbeat?.tasksCompleted ?? 0,
        errorCount: heartbeat?.errorCount ?? 0,
      };
    });

    const onlineCount = agentStatuses.filter(a => a.isResponsive).length;
    const criticalOnline = agentStatuses.filter(a => a.critical && a.isResponsive).length;
    const criticalTotal = agentStatuses.filter(a => a.critical).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: agentStatuses.length,
        online: onlineCount,
        offline: agentStatuses.length - onlineCount,
        criticalAgentsOnline: `${criticalOnline}/${criticalTotal}`,
        healthScore: Math.round((onlineCount / agentStatuses.length) * 100),
      },
      agents: agentStatuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get heartbeats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get heartbeats' },
      { status: 500 }
    );
  }
}
