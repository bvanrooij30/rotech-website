/**
 * AI Agents API - Main Status Endpoint
 * GET /api/ai-agents - Get REAL system status
 * 
 * Dit haalt ECHTE data uit de database en heartbeat systeem
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { 
  getRealAgentData, 
  initializeAgents, 
  getAllHeartbeats 
} from '@/lib/ai-agents/heartbeat';

// Initialize agents on first request
let initialized = false;

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can access
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Initialize agents on first request
    if (!initialized) {
      await initializeAgents();
      initialized = true;
    }

    // Get REAL agent data from heartbeat system
    const data = await getRealAgentData();
    const heartbeats = getAllHeartbeats();

    return NextResponse.json({
      success: true,
      data,
      // Include raw heartbeat data for transparency
      _debug: {
        heartbeatCount: heartbeats.length,
        lastUpdate: new Date().toISOString(),
        dataSource: 'heartbeat-system',
        isRealData: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI Agents API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
