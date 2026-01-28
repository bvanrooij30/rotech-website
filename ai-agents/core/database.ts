/**
 * RoTech AI Agents - Database Service
 * Prisma-based persistence for all agent data
 * 
 * Dit zorgt ervoor dat agent data PERSISTENT is
 */

import { PrismaClient } from '@prisma/client';
import { createLogger, AgentLogger } from './logger';
import { AgentType, LogLevel } from './types';

// ============================================
// PRISMA CLIENT SINGLETON
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================
// DATABASE SERVICE
// ============================================

export class AgentDatabase {
  private logger: AgentLogger;

  constructor(agentId: string, agentType: AgentType) {
    this.logger = createLogger(agentId, agentType, { prefix: 'Database' });
  }

  // ============================================
  // LEADS
  // ============================================

  async createLead(data: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    source: string;
    interest: string;
    message?: string;
    budget?: string;
    timeline?: string;
    score?: number;
    recommendation?: string;
    reasoning?: string;
    suggestedPackage?: string;
    estimatedValue?: number;
  }) {
    this.logger.info('Creating lead', { company: data.companyName });
    
    return prisma.aILead.create({
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        website: data.website,
        source: data.source,
        interest: data.interest,
        message: data.message,
        budget: data.budget,
        timeline: data.timeline,
        score: data.score || 50,
        recommendation: data.recommendation || 'warm',
        reasoning: data.reasoning,
        suggestedPackage: data.suggestedPackage,
        estimatedValue: data.estimatedValue,
      },
    });
  }

  async updateLead(id: string, data: Partial<{
    score: number;
    recommendation: string;
    reasoning: string;
    suggestedPackage: string;
    estimatedValue: number;
    status: string;
    assignedTo: string;
    notes: string;
    nextFollowUp: Date;
    lastContact: Date;
  }>) {
    return prisma.aILead.update({
      where: { id },
      data,
    });
  }

  async getLeads(filter?: {
    status?: string;
    minScore?: number;
    source?: string;
    limit?: number;
  }) {
    return prisma.aILead.findMany({
      where: {
        status: filter?.status,
        score: filter?.minScore ? { gte: filter.minScore } : undefined,
        source: filter?.source,
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 100,
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async getLeadById(id: string) {
    return prisma.aILead.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async addLeadActivity(leadId: string, data: {
    type: string;
    title: string;
    details?: string;
    agentId: string;
  }) {
    return prisma.leadActivity.create({
      data: {
        leadId,
        ...data,
      },
    });
  }

  // ============================================
  // CAMPAIGNS
  // ============================================

  async createCampaign(data: {
    name: string;
    type: string;
    targetAudience?: string;
    targetSegment?: string;
    budgetAllocated?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    return prisma.aICampaign.create({
      data,
    });
  }

  async updateCampaign(id: string, data: Partial<{
    status: string;
    budgetSpent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    leads: number;
    revenue: number;
  }>) {
    return prisma.aICampaign.update({
      where: { id },
      data,
    });
  }

  async getCampaigns(status?: string) {
    return prisma.aICampaign.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================
  // SCHEDULED TASKS
  // ============================================

  async createTask(data: {
    type: string;
    agentId: string;
    priority?: number;
    title: string;
    description?: string;
    data?: object;
    scheduledFor: Date;
    deadline?: Date;
    estimatedMinutes?: number;
    dependencies?: string[];
    isRecurring?: boolean;
    cronSchedule?: string;
  }) {
    return prisma.aIScheduledTask.create({
      data: {
        type: data.type,
        agentId: data.agentId,
        priority: data.priority || 3,
        title: data.title,
        description: data.description,
        data: data.data ? JSON.stringify(data.data) : null,
        scheduledFor: data.scheduledFor,
        deadline: data.deadline,
        estimatedMinutes: data.estimatedMinutes,
        dependencies: data.dependencies ? JSON.stringify(data.dependencies) : null,
        isRecurring: data.isRecurring || false,
        cronSchedule: data.cronSchedule,
      },
    });
  }

  async updateTaskStatus(id: string, status: string, result?: object, errorMessage?: string) {
    const now = new Date();
    return prisma.aIScheduledTask.update({
      where: { id },
      data: {
        status,
        startedAt: status === 'running' ? now : undefined,
        completedAt: ['completed', 'failed'].includes(status) ? now : undefined,
        result: result ? JSON.stringify(result) : undefined,
        errorMessage,
      },
    });
  }

  async getTasksDue(limit?: number) {
    const now = new Date();
    return prisma.aIScheduledTask.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: { lte: now },
      },
      orderBy: [
        { priority: 'asc' },
        { scheduledFor: 'asc' },
      ],
      take: limit || 50,
    });
  }

  async getTasksByAgent(agentId: string, status?: string) {
    return prisma.aIScheduledTask.findMany({
      where: {
        agentId,
        status: status || undefined,
      },
      orderBy: { scheduledFor: 'desc' },
    });
  }

  // ============================================
  // DECISIONS
  // ============================================

  async logDecision(data: {
    agentId: string;
    type: string;
    decision: string;
    reasoning: string;
    impact: string;
    reversible?: boolean;
  }) {
    return prisma.aIDecision.create({
      data: {
        agentId: data.agentId,
        type: data.type,
        decision: data.decision,
        reasoning: data.reasoning,
        impact: data.impact,
        reversible: data.reversible ?? true,
      },
    });
  }

  async updateDecisionOutcome(id: string, wasSuccessful: boolean, feedback?: string) {
    return prisma.aIDecision.update({
      where: { id },
      data: {
        wasSuccessful,
        feedback,
        status: 'executed',
        executedAt: new Date(),
      },
    });
  }

  async getRecentDecisions(agentId?: string, limit?: number) {
    return prisma.aIDecision.findMany({
      where: agentId ? { agentId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit || 50,
    });
  }

  // ============================================
  // ALERTS
  // ============================================

  async createAlert(data: {
    level: string;
    source: string;
    title: string;
    message: string;
  }) {
    return prisma.aIAlert.create({
      data,
    });
  }

  async acknowledgeAlert(id: string, acknowledgedBy: string) {
    return prisma.aIAlert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
    });
  }

  async resolveAlert(id: string, resolution: string) {
    return prisma.aIAlert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  async getActiveAlerts() {
    return prisma.aIAlert.findMany({
      where: { resolved: false },
      orderBy: [
        { level: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // ============================================
  // DAILY BRIEFINGS
  // ============================================

  async saveDailyBriefing(data: {
    date: Date;
    healthScore: number;
    healthStatus: string;
    highlights: string[];
    concerns: string[];
    metrics: object;
    tasksCompleted: number;
    tasksScheduled: number;
    tasksOverdue: number;
    projectsActive: number;
    projectsAtRisk: number;
    newLeads: number;
    activeCampaigns: number;
    recommendations: Array<{ priority: string; title: string; description: string }>;
    actionItems: Array<{ id: string; title: string; status: string }>;
  }) {
    // Set date to start of day for uniqueness
    const dateOnly = new Date(data.date);
    dateOnly.setHours(0, 0, 0, 0);

    return prisma.aIDailyBriefing.upsert({
      where: { date: dateOnly },
      update: {
        healthScore: data.healthScore,
        healthStatus: data.healthStatus,
        highlights: JSON.stringify(data.highlights),
        concerns: JSON.stringify(data.concerns),
        metrics: JSON.stringify(data.metrics),
        tasksCompleted: data.tasksCompleted,
        tasksScheduled: data.tasksScheduled,
        tasksOverdue: data.tasksOverdue,
        projectsActive: data.projectsActive,
        projectsAtRisk: data.projectsAtRisk,
        newLeads: data.newLeads,
        activeCampaigns: data.activeCampaigns,
        recommendations: JSON.stringify(data.recommendations),
        actionItems: JSON.stringify(data.actionItems),
      },
      create: {
        date: dateOnly,
        healthScore: data.healthScore,
        healthStatus: data.healthStatus,
        highlights: JSON.stringify(data.highlights),
        concerns: JSON.stringify(data.concerns),
        metrics: JSON.stringify(data.metrics),
        tasksCompleted: data.tasksCompleted,
        tasksScheduled: data.tasksScheduled,
        tasksOverdue: data.tasksOverdue,
        projectsActive: data.projectsActive,
        projectsAtRisk: data.projectsAtRisk,
        newLeads: data.newLeads,
        activeCampaigns: data.activeCampaigns,
        recommendations: JSON.stringify(data.recommendations),
        actionItems: JSON.stringify(data.actionItems),
      },
    });
  }

  async getLatestBriefing() {
    return prisma.aIDailyBriefing.findFirst({
      orderBy: { date: 'desc' },
    });
  }

  async getBriefingByDate(date: Date) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return prisma.aIDailyBriefing.findUnique({
      where: { date: dateOnly },
    });
  }

  // ============================================
  // AGENT METRICS
  // ============================================

  async recordAgentMetrics(data: {
    agentId: string;
    tasksCompleted?: number;
    avgResponseTimeMs?: number;
    errorCount?: number;
    successRate?: number;
    promptsGenerated?: number;
    tokensUsed?: number;
    aiCostCents?: number;
    reportsGenerated?: number;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.aIAgentMetrics.upsert({
      where: {
        agentId_date: {
          agentId: data.agentId,
          date: today,
        },
      },
      update: {
        tasksCompleted: data.tasksCompleted ? { increment: data.tasksCompleted } : undefined,
        avgResponseTimeMs: data.avgResponseTimeMs,
        errorCount: data.errorCount ? { increment: data.errorCount } : undefined,
        successRate: data.successRate,
        promptsGenerated: data.promptsGenerated ? { increment: data.promptsGenerated } : undefined,
        tokensUsed: data.tokensUsed ? { increment: data.tokensUsed } : undefined,
        aiCostCents: data.aiCostCents ? { increment: data.aiCostCents } : undefined,
        reportsGenerated: data.reportsGenerated ? { increment: data.reportsGenerated } : undefined,
      },
      create: {
        agentId: data.agentId,
        date: today,
        tasksCompleted: data.tasksCompleted || 0,
        avgResponseTimeMs: data.avgResponseTimeMs || 0,
        errorCount: data.errorCount || 0,
        successRate: data.successRate || 100,
        promptsGenerated: data.promptsGenerated || 0,
        tokensUsed: data.tokensUsed || 0,
        aiCostCents: data.aiCostCents || 0,
        reportsGenerated: data.reportsGenerated || 0,
      },
    });
  }

  async getAgentMetricsHistory(agentId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return prisma.aIAgentMetrics.findMany({
      where: {
        agentId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ============================================
  // LOGS
  // ============================================

  async saveLog(data: {
    agentId: string;
    agentType: string;
    level: string;
    message: string;
    data?: object;
    projectId?: string;
  }) {
    return prisma.agentLog.create({
      data: {
        agentId: data.agentId,
        agentType: data.agentType,
        level: data.level,
        message: data.message,
        data: data.data ? JSON.stringify(data.data) : null,
        projectId: data.projectId,
      },
    });
  }

  async queryLogs(filter?: {
    agentId?: string;
    level?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    return prisma.agentLog.findMany({
      where: {
        agentId: filter?.agentId,
        level: filter?.level,
        createdAt: {
          gte: filter?.startDate,
          lte: filter?.endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter?.limit || 100,
    });
  }
}

// ============================================
// FACTORY
// ============================================

export function createAgentDatabase(agentId: string, agentType: AgentType): AgentDatabase {
  return new AgentDatabase(agentId, agentType);
}

// Global database instance
let globalDb: AgentDatabase | null = null;

export function getGlobalDatabase(): AgentDatabase {
  if (!globalDb) {
    globalDb = new AgentDatabase('global', 'intake');
  }
  return globalDb;
}
