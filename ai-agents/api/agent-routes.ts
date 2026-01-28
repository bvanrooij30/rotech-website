/**
 * RoTech AI Agents - API Routes
 * REST API voor portal integratie
 */

import {
  agentRegistry,
  getAllAgents,
  getAgent,
  AgentInfo,
  AgentRequest,
  AgentResponse,
  APIResponse,
  PaginatedResponse,
  LogEntry,
  queryAllLogs,
  getLogStats,
  getGlobalProjectStorage,
  Project,
} from '../core';
import { HealthReport, ProgressReport } from '../core/project-manager';

// ============================================
// API HANDLERS
// ============================================

/**
 * Get all registered agents with their status
 */
export async function handleGetAgents(): Promise<APIResponse<AgentInfo[]>> {
  try {
    const agents = getAllAgents();
    const agentInfos = agents.map(agent => agent.getInfo());

    return {
      success: true,
      data: agentInfos,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get single agent details
 */
export async function handleGetAgent(agentId: string): Promise<APIResponse<AgentInfo>> {
  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    return {
      success: true,
      data: agent.getInfo(),
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get agent health status
 */
export async function handleGetAgentHealth(agentId: string): Promise<APIResponse<HealthReport>> {
  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    const health = await agent.healthCheck();

    return {
      success: true,
      data: health as unknown as HealthReport,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Send request to agent
 */
export async function handleAgentRequest(
  agentId: string,
  request: Omit<AgentRequest, 'id' | 'timestamp'>
): Promise<APIResponse<AgentResponse>> {
  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    const fullRequest: AgentRequest = {
      ...request,
      id: generateRequestId(),
      timestamp: new Date(),
    };

    const response = await agent.processRequest(fullRequest);

    return {
      success: true,
      data: response,
      metadata: {
        timestamp: new Date(),
        requestId: fullRequest.id,
        processingTime: response.metadata.processingTime,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Execute agent workflow
 */
export async function handleExecuteWorkflow(
  agentId: string,
  workflowId: string,
  data: Record<string, unknown>
): Promise<APIResponse<unknown>> {
  const startTime = Date.now();

  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    const result = await agent.executeWorkflow(workflowId, data);

    return {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get agent capabilities
 */
export async function handleGetCapabilities(agentId: string): Promise<APIResponse<string[]>> {
  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    const capabilities = agent.getCapabilities();

    return {
      success: true,
      data: capabilities,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

// ============================================
// PROJECT API HANDLERS
// ============================================

/**
 * Get all projects
 */
export async function handleGetProjects(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<APIResponse<PaginatedResponse<Project>>> {
  try {
    const storage = getGlobalProjectStorage();
    let projects = storage.getAll();

    // Filter by status if provided
    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    // Sort by updated date (most recent first)
    projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Paginate
    const total = projects.length;
    const start = (page - 1) * pageSize;
    const items = projects.slice(start, start + pageSize);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get project by ID
 */
export async function handleGetProject(projectId: string): Promise<APIResponse<Project>> {
  try {
    const storage = getGlobalProjectStorage();
    const project = storage.get(projectId);

    if (!project) {
      return {
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: `Project not found: ${projectId}`,
        },
      };
    }

    return {
      success: true,
      data: project,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get project progress
 */
export async function handleGetProjectProgress(
  agentId: string,
  projectId: string
): Promise<APIResponse<ProgressReport>> {
  try {
    const agent = getAgent(agentId);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent not found: ${agentId}`,
        },
      };
    }

    const progress = await agent.getProjectProgress(projectId);

    return {
      success: true,
      data: progress,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

// ============================================
// LOGS API HANDLERS
// ============================================

/**
 * Get logs with filtering
 */
export async function handleGetLogs(
  filter: {
    agentId?: string;
    projectId?: string;
    level?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<APIResponse<PaginatedResponse<LogEntry>>> {
  try {
    const logs = queryAllLogs({
      agentId: filter.agentId,
      projectId: filter.projectId,
      level: filter.level as LogEntry['level'],
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      search: filter.search,
      limit: filter.limit || 100,
      offset: filter.offset || 0,
    });

    return {
      success: true,
      data: {
        items: logs,
        total: logs.length,
        page: Math.floor((filter.offset || 0) / (filter.limit || 100)) + 1,
        pageSize: filter.limit || 100,
        hasMore: logs.length === (filter.limit || 100),
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

/**
 * Get log statistics
 */
export async function handleGetLogStats(): Promise<APIResponse<ReturnType<typeof getLogStats>>> {
  try {
    const stats = getLogStats();

    return {
      success: true,
      data: stats,
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

// ============================================
// DASHBOARD API HANDLERS
// ============================================

/**
 * Get dashboard overview
 */
export async function handleGetDashboard(): Promise<APIResponse<{
  agents: {
    total: number;
    active: number;
    idle: number;
    error: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  logs: {
    total: number;
    errors: number;
    warnings: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: Date;
    agentId: string;
  }>;
}>> {
  try {
    const agents = getAllAgents();
    const storage = getGlobalProjectStorage();
    const projects = storage.getAll();
    const stats = getLogStats();
    const recentLogs = queryAllLogs({ limit: 10 });

    const agentStats = {
      total: agents.length,
      active: agents.filter(a => a.getInfo().status === 'busy').length,
      idle: agents.filter(a => a.getInfo().status === 'idle').length,
      error: agents.filter(a => a.getInfo().status === 'error').length,
    };

    const projectStats = {
      total: projects.length,
      active: projects.filter(p => !['completed', 'cancelled', 'on-hold'].includes(p.status)).length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
    };

    const logStats = {
      total: stats.total,
      errors: stats.byLevel['error'] || 0,
      warnings: stats.byLevel['warn'] || 0,
    };

    const recentActivity = recentLogs.map(log => ({
      type: log.level,
      message: log.message,
      timestamp: log.timestamp,
      agentId: log.agentId,
    }));

    return {
      success: true,
      data: {
        agents: agentStats,
        projects: projectStats,
        logs: logStats,
        recentActivity,
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        processingTime: 0,
      },
    };
  } catch (error) {
    return createErrorResponse(error as Error);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createErrorResponse(error: Error): APIResponse<never> {
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
  };
}

// ============================================
// EXPRESS/NEXT.JS ROUTE HANDLERS
// ============================================

/**
 * Create Next.js API route handlers
 * Usage in /api/ai-agents/[...path]/route.ts
 */
export function createNextRouteHandlers() {
  return {
    // GET /api/ai-agents
    async GET(request: Request) {
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/ai-agents', '');

      if (path === '' || path === '/') {
        const result = await handleGetAgents();
        return Response.json(result);
      }

      if (path === '/dashboard') {
        const result = await handleGetDashboard();
        return Response.json(result);
      }

      if (path === '/logs') {
        const params = Object.fromEntries(url.searchParams);
        const result = await handleGetLogs(params);
        return Response.json(result);
      }

      if (path === '/logs/stats') {
        const result = await handleGetLogStats();
        return Response.json(result);
      }

      if (path === '/projects') {
        const page = parseInt(url.searchParams.get('page') || '1');
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
        const status = url.searchParams.get('status') || undefined;
        const result = await handleGetProjects(page, pageSize, status);
        return Response.json(result);
      }

      // /agents/:agentId
      const agentMatch = path.match(/^\/([^/]+)$/);
      if (agentMatch) {
        const result = await handleGetAgent(agentMatch[1]);
        return Response.json(result);
      }

      // /agents/:agentId/health
      const healthMatch = path.match(/^\/([^/]+)\/health$/);
      if (healthMatch) {
        const result = await handleGetAgentHealth(healthMatch[1]);
        return Response.json(result);
      }

      // /agents/:agentId/capabilities
      const capMatch = path.match(/^\/([^/]+)\/capabilities$/);
      if (capMatch) {
        const result = await handleGetCapabilities(capMatch[1]);
        return Response.json(result);
      }

      // /projects/:projectId
      const projectMatch = path.match(/^\/projects\/([^/]+)$/);
      if (projectMatch) {
        const result = await handleGetProject(projectMatch[1]);
        return Response.json(result);
      }

      return Response.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
      }, { status: 404 });
    },

    // POST /api/ai-agents/:agentId/request
    async POST(request: Request) {
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/ai-agents', '');
      const body = await request.json();

      // /agents/:agentId/request
      const requestMatch = path.match(/^\/([^/]+)\/request$/);
      if (requestMatch) {
        const result = await handleAgentRequest(requestMatch[1], body);
        return Response.json(result);
      }

      // /agents/:agentId/workflow/:workflowId
      const workflowMatch = path.match(/^\/([^/]+)\/workflow\/([^/]+)$/);
      if (workflowMatch) {
        const result = await handleExecuteWorkflow(workflowMatch[1], workflowMatch[2], body);
        return Response.json(result);
      }

      return Response.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
      }, { status: 404 });
    },
  };
}
