/**
 * RoTech AI Agents - Master Agent
 * De hoofdagent die het volledige autonome systeem aanstuurt
 * 
 * Dit is de "CEO" van alle agents - coördineert, delegeert en rapporteert
 */

import {
  BaseAgent,
  registerAgent,
  AgentType,
  getAllAgents,
  getGlobalProjectStorage,
  PromptContext,
} from '../../core';

import { orchestratorAgent, OrchestratorAgent } from './orchestrator-agent';
import { optimizerAgent, OptimizerAgent } from './optimizer-agent';
import { marketingAgent, MarketingAgent } from './marketing-agent';
import { schedulerAgent, SchedulerAgent } from './scheduler-agent';

// ============================================
// MASTER TYPES
// ============================================

interface SystemStatus {
  timestamp: Date;
  mode: 'autonomous' | 'supervised' | 'maintenance' | 'emergency';
  health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  activeAgents: number;
  totalAgents: number;
  pendingTasks: number;
  activeProjects: number;
  alerts: Alert[];
  metrics: SystemMetrics;
}

interface SystemMetrics {
  uptime: number; // hours
  tasksCompletedToday: number;
  averageResponseTime: number;
  successRate: number;
  activeLeads: number;
  revenuePipeline: number;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

interface DailyBriefing {
  date: string;
  summary: {
    health: string;
    highlights: string[];
    concerns: string[];
    metrics: SystemMetrics;
  };
  tasks: {
    completed: number;
    scheduled: number;
    overdue: number;
  };
  projects: {
    active: number;
    completedThisWeek: number;
    atRisk: number;
  };
  marketing: {
    newLeads: number;
    activeCampaigns: number;
    topPerformingChannel: string;
  };
  recommendations: string[];
  actionItems: ActionItem[];
}

interface ActionItem {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  assignedAgent: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

interface AutonomousDecision {
  id: string;
  timestamp: Date;
  type: 'task-assignment' | 'resource-allocation' | 'escalation' | 'optimization' | 'recovery';
  decision: string;
  reasoning: string;
  impact: string;
  reversible: boolean;
  status: 'pending' | 'executed' | 'reverted';
}

// ============================================
// MASTER AGENT CLASS
// ============================================

export class MasterAgent extends BaseAgent {
  readonly agentId = 'master-agent';
  readonly agentName = 'Master Agent';
  readonly agentType: AgentType = 'intake'; // System level
  readonly version = '1.0.0';
  readonly description = 'Hoofdagent die het volledige autonome systeem aanstuurt';

  private mode: SystemStatus['mode'] = 'autonomous';
  private alerts: Map<string, Alert> = new Map();
  private decisions: Map<string, AutonomousDecision> = new Map();
  private masterStartTime: Date = new Date();
  private masterInterval: NodeJS.Timeout | null = null;

  // Sub-agents (when initialized)
  private orchestrator: OrchestratorAgent | null = null;
  private optimizer: OptimizerAgent | null = null;
  private marketing: MarketingAgent | null = null;
  private scheduler: SchedulerAgent | null = null;

  constructor() {
    super();
    this.initializeServices();
  }

  protected async onInitialize(): Promise<void> {
    this.logger.info('Master Agent initializing - I am the CEO of all agents');
    
    // Link to sub-agents
    this.orchestrator = orchestratorAgent;
    this.optimizer = optimizerAgent;
    this.marketing = marketingAgent;
    this.scheduler = schedulerAgent;
  }

  protected async onStart(): Promise<void> {
    this.startMasterLoop();
    this.logger.info('Master Agent started - autonomous system is online');
    
    // Initial system status
    await this.broadcastSystemStatus();
  }

  protected async onStop(): Promise<void> {
    if (this.masterInterval) {
      clearInterval(this.masterInterval);
    }
    this.logger.info('Master Agent stopped');
  }

  // ============================================
  // MASTER CONTROL LOOP
  // ============================================

  private startMasterLoop(intervalMinutes: number = 15): void {
    this.masterInterval = setInterval(async () => {
      await this.runMasterCycle();
    }, intervalMinutes * 60 * 1000);

    // Initial run
    this.runMasterCycle();
  }

  async runMasterCycle(): Promise<void> {
    this.logger.info('Running master control cycle');
    const startTime = Date.now();

    try {
      // 1. Get system status
      const status = await this.getSystemStatus();

      // 2. Make autonomous decisions
      await this.makeAutonomousDecisions(status);

      // 3. Handle alerts
      await this.handleAlerts();

      // 4. Coordinate agents
      await this.coordinateAgents();

      // 5. Update metrics
      await this.updateMasterMetrics();

      // 6. Check for human intervention needs
      await this.checkForHumanIntervention(status);

      const duration = Date.now() - startTime;
      this.logger.performance('master-cycle', duration);
    } catch (error) {
      this.logger.error('Master cycle failed', error as Error);
      await this.handleCriticalError(error as Error);
    }
  }

  // ============================================
  // SYSTEM STATUS
  // ============================================

  async getSystemStatus(): Promise<SystemStatus> {
    const agents = getAllAgents();
    const storage = getGlobalProjectStorage();
    const projects = storage.getAll();
    const scheduledTasks = this.scheduler?.getScheduledTasks() || [];

    const activeAgents = agents.filter(a => a.getInfo().status === 'online').length;
    const activeProjects = projects.filter(p => 
      !['completed', 'cancelled'].includes(p.status)
    ).length;
    const pendingTasks = scheduledTasks.filter(t => 
      t.status === 'scheduled' || t.status === 'queued'
    ).length;

    // Calculate health
    const health = await this.calculateSystemHealth();

    // Get alerts
    const activeAlerts = Array.from(this.alerts.values()).filter(a => !a.resolvedAt);

    // Calculate metrics
    const uptimeHours = (new Date().getTime() - this.masterStartTime.getTime()) / (1000 * 60 * 60);
    const tasksCompletedToday = scheduledTasks.filter(t => {
      if (!t.completedAt) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(t.completedAt) >= today;
    }).length;

    const leads = this.marketing?.getLeads() || [];
    const activeLeads = leads.filter(l => l.status !== 'won' && l.status !== 'lost').length;

    return {
      timestamp: new Date(),
      mode: this.mode,
      health,
      activeAgents,
      totalAgents: agents.length,
      pendingTasks,
      activeProjects,
      alerts: activeAlerts,
      metrics: {
        uptime: Math.round(uptimeHours * 10) / 10,
        tasksCompletedToday,
        averageResponseTime: this.calculateAverageResponseTime(agents),
        successRate: this.calculateSuccessRate(agents),
        activeLeads,
        revenuePipeline: this.calculateRevenuePipeline(leads),
      },
    };
  }

  private async calculateSystemHealth(): Promise<SystemStatus['health']> {
    if (!this.orchestrator) return 'fair';
    
    try {
      const healthReport = await this.orchestrator.performHealthCheck();
      return healthReport.overallHealth;
    } catch {
      return 'fair';
    }
  }

  private calculateAverageResponseTime(agents: any[]): number {
    const times = agents.map(a => a.getInfo().metrics.avgResponseTime).filter(t => t > 0);
    return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  }

  private calculateSuccessRate(agents: any[]): number {
    const rates = agents.map(a => a.getInfo().metrics.successRate).filter(r => r > 0);
    return rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 100;
  }

  private calculateRevenuePipeline(leads: any[]): number {
    // Estimate based on lead quality
    const qualifiedLeads = leads.filter(l => l.score >= 70);
    const avgDealSize = 2500; // Average project value
    const conversionRate = 0.25;
    return Math.round(qualifiedLeads.length * avgDealSize * conversionRate);
  }

  // ============================================
  // AUTONOMOUS DECISIONS
  // ============================================

  private async makeAutonomousDecisions(status: SystemStatus): Promise<void> {
    // Decision 1: Handle low health
    if (status.health === 'poor' || status.health === 'critical') {
      await this.makeDecision({
        type: 'recovery',
        decision: 'Activeer recovery modus',
        reasoning: `Systeem health is ${status.health}`,
        impact: 'Pauzeer niet-kritieke taken, focus op herstel',
        reversible: true,
      });
    }

    // Decision 2: Scale marketing if low leads
    if (status.metrics.activeLeads < 5) {
      await this.makeDecision({
        type: 'resource-allocation',
        decision: 'Verhoog marketing activiteit',
        reasoning: 'Weinig actieve leads in pipeline',
        impact: 'Marketing agent krijgt meer resources',
        reversible: true,
      });
    }

    // Decision 3: Load balance if overloaded
    const workloads = this.scheduler?.getWorkloads() || [];
    const overloadedAgents = workloads.filter(w => w.availability === 'overloaded');
    if (overloadedAgents.length > 0) {
      await this.makeDecision({
        type: 'task-assignment',
        decision: 'Herverdeel taken van overbelaste agents',
        reasoning: `${overloadedAgents.length} agent(s) zijn overbelast`,
        impact: 'Betere verdeling van werkdruk',
        reversible: true,
      });
    }

    // Decision 4: Escalate critical alerts
    const criticalAlerts = status.alerts.filter(a => a.level === 'critical' && !a.acknowledged);
    if (criticalAlerts.length > 0) {
      await this.makeDecision({
        type: 'escalation',
        decision: 'Escaleer kritieke alerts naar menselijke review',
        reasoning: `${criticalAlerts.length} onafgehandelde kritieke alert(s)`,
        impact: 'Notificatie naar beheerder',
        reversible: false,
      });
    }
  }

  private async makeDecision(params: Omit<AutonomousDecision, 'id' | 'timestamp' | 'status'>): Promise<AutonomousDecision> {
    const decision: AutonomousDecision = {
      id: this.generateId('decision'),
      timestamp: new Date(),
      ...params,
      status: 'pending',
    };

    this.decisions.set(decision.id, decision);
    this.logger.info('Autonomous decision made', {
      id: decision.id,
      type: decision.type,
      decision: decision.decision,
    });

    // Execute low-risk decisions automatically
    if (params.reversible && params.type !== 'escalation') {
      await this.executeDecision(decision);
    }

    return decision;
  }

  private async executeDecision(decision: AutonomousDecision): Promise<void> {
    this.logger.info('Executing decision', { id: decision.id });

    try {
      switch (decision.type) {
        case 'recovery':
          this.mode = 'maintenance';
          await this.optimizer?.performSelfHealing();
          this.mode = 'autonomous';
          break;

        case 'resource-allocation':
          await this.marketing?.runMarketingAutomation();
          break;

        case 'task-assignment':
          // Scheduler handles this automatically
          break;

        case 'escalation':
          await this.sendHumanNotification(decision);
          break;
      }

      decision.status = 'executed';
      this.decisions.set(decision.id, decision);
    } catch (error) {
      this.logger.error('Decision execution failed', error as Error, { decisionId: decision.id });
      decision.status = 'pending'; // Will retry
    }
  }

  // ============================================
  // ALERT MANAGEMENT
  // ============================================

  addAlert(level: Alert['level'], source: string, title: string, message: string): Alert {
    const alert: Alert = {
      id: this.generateId('alert'),
      level,
      source,
      title,
      message,
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.set(alert.id, alert);

    if (level === 'critical' || level === 'error') {
      this.logger.error('Alert raised', undefined, { alert });
    } else {
      this.logger.warn('Alert raised', { alert });
    }

    return alert;
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    this.alerts.set(alertId, alert);
    return true;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date();
    this.alerts.set(alertId, alert);
    return true;
  }

  private async handleAlerts(): Promise<void> {
    const unresolvedAlerts = Array.from(this.alerts.values())
      .filter(a => !a.resolvedAt);

    for (const alert of unresolvedAlerts) {
      // Auto-resolve info alerts after 24 hours
      if (alert.level === 'info') {
        const age = new Date().getTime() - alert.timestamp.getTime();
        if (age > 24 * 60 * 60 * 1000) {
          this.resolveAlert(alert.id);
        }
      }

      // Escalate unacknowledged critical alerts
      if (alert.level === 'critical' && !alert.acknowledged) {
        const age = new Date().getTime() - alert.timestamp.getTime();
        if (age > 15 * 60 * 1000) { // 15 minutes
          await this.sendHumanNotification({
            type: 'escalation',
            decision: 'Critical alert requires attention',
            reasoning: alert.message,
            impact: 'System may be affected',
            reversible: false,
          } as any);
        }
      }
    }
  }

  // ============================================
  // AGENT COORDINATION
  // ============================================

  private async coordinateAgents(): Promise<void> {
    // Ensure all system agents are running
    const agents = getAllAgents();
    const systemAgentIds = ['orchestrator-agent', 'optimizer-agent', 'marketing-agent', 'scheduler-agent'];

    for (const agentId of systemAgentIds) {
      const agent = agents.find(a => a.agentId === agentId);
      if (agent) {
        const info = agent.getInfo();
        if (info.status !== 'online') {
          this.logger.warn('System agent offline, restarting', { agentId });
          await agent.start();
        }
      }
    }
  }

  private async updateMasterMetrics(): Promise<void> {
    // Metrics are calculated on-demand in getSystemStatus
  }

  private async checkForHumanIntervention(status: SystemStatus): Promise<void> {
    // Check if human intervention is needed
    const needsHuman = 
      status.health === 'critical' ||
      status.alerts.filter(a => a.level === 'critical').length > 3 ||
      status.mode === 'emergency';

    if (needsHuman) {
      await this.sendHumanNotification({
        type: 'escalation',
        decision: 'Human intervention required',
        reasoning: `System health: ${status.health}, Critical alerts: ${status.alerts.filter(a => a.level === 'critical').length}`,
        impact: 'System needs manual review',
        reversible: false,
      } as any);
    }
  }

  private async handleCriticalError(error: Error): Promise<void> {
    this.mode = 'emergency';
    
    this.addAlert('critical', 'master-agent', 'Critical system error', error.message);
    
    // Try to recover
    try {
      await this.optimizer?.performSelfHealing();
      this.mode = 'autonomous';
    } catch {
      // Stay in emergency mode
    }
  }

  private async sendHumanNotification(context: any): Promise<void> {
    // In production, this would send email/SMS/Slack notification
    this.logger.critical('HUMAN NOTIFICATION REQUIRED', undefined, context);
  }

  private async broadcastSystemStatus(): Promise<void> {
    const status = await this.getSystemStatus();
    this.logger.info('System status broadcast', {
      mode: status.mode,
      health: status.health,
      activeAgents: status.activeAgents,
      pendingTasks: status.pendingTasks,
    });
  }

  // ============================================
  // DAILY BRIEFING
  // ============================================

  async generateDailyBriefing(): Promise<DailyBriefing> {
    const status = await this.getSystemStatus();
    const storage = getGlobalProjectStorage();
    const projects = storage.getAll();
    const tasks = this.scheduler?.getScheduledTasks() || [];
    const leads = this.marketing?.getLeads() || [];
    const campaigns = this.marketing?.getCampaigns() || [];

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const highlights: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];
    const actionItems: ActionItem[] = [];

    // Analyze highlights
    if (status.metrics.successRate >= 95) {
      highlights.push(`Uitstekende success rate: ${status.metrics.successRate}%`);
    }
    if (status.metrics.tasksCompletedToday > 10) {
      highlights.push(`${status.metrics.tasksCompletedToday} taken vandaag afgerond`);
    }
    if (leads.filter(l => l.status === 'new').length > 0) {
      highlights.push(`${leads.filter(l => l.status === 'new').length} nieuwe leads`);
    }

    // Analyze concerns
    if (status.health === 'poor' || status.health === 'critical') {
      concerns.push(`Systeem health is ${status.health}`);
    }
    if (status.alerts.filter(a => a.level === 'critical').length > 0) {
      concerns.push(`${status.alerts.filter(a => a.level === 'critical').length} kritieke alerts`);
    }
    if (status.metrics.activeLeads < 3) {
      concerns.push('Weinig actieve leads in pipeline');
    }

    // Generate recommendations
    if (status.metrics.activeLeads < 5) {
      recommendations.push('Verhoog marketing activiteit om meer leads te genereren');
      actionItems.push({
        priority: 2,
        title: 'Marketing campagne starten',
        description: 'Start een nieuwe content campagne om leads te genereren',
        assignedAgent: 'marketing-agent',
        status: 'pending',
      });
    }

    const overdueTaskCount = tasks.filter(t => 
      t.deadline && new Date(t.deadline) < today && t.status !== 'completed'
    ).length;

    if (overdueTaskCount > 0) {
      recommendations.push(`${overdueTaskCount} taken zijn overdue - prioriteer deze`);
      actionItems.push({
        priority: 1,
        title: 'Overdue taken afhandelen',
        description: `${overdueTaskCount} taken moeten worden afgerond`,
        assignedAgent: 'scheduler-agent',
        status: 'pending',
      });
    }

    // Completed projects this week
    const completedThisWeek = projects.filter(p => 
      p.status === 'completed' && p.timeline?.actualEndDate && 
      new Date(p.timeline.actualEndDate) >= weekAgo
    ).length;

    // At risk projects
    const atRisk = projects.filter(p => {
      if (p.status === 'completed' || p.status === 'cancelled') return false;
      if (!p.timeline?.estimatedEndDate) return false;
      return new Date(p.timeline.estimatedEndDate) < today;
    }).length;

    // Top performing channel
    const leadsBySource = new Map<string, number>();
    for (const lead of leads) {
      leadsBySource.set(lead.source, (leadsBySource.get(lead.source) || 0) + 1);
    }
    const topChannel = Array.from(leadsBySource.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      date: today.toISOString().split('T')[0],
      summary: {
        health: status.health,
        highlights,
        concerns,
        metrics: status.metrics,
      },
      tasks: {
        completed: status.metrics.tasksCompletedToday,
        scheduled: tasks.filter(t => t.status === 'scheduled').length,
        overdue: overdueTaskCount,
      },
      projects: {
        active: status.activeProjects,
        completedThisWeek,
        atRisk,
      },
      marketing: {
        newLeads: leads.filter(l => {
          const leadDate = new Date(l.createdAt);
          today.setHours(0, 0, 0, 0);
          return leadDate >= today;
        }).length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        topPerformingChannel: topChannel,
      },
      recommendations,
      actionItems,
    };
  }

  // ============================================
  // ABSTRACT IMPLEMENTATIONS
  // ============================================

  async getSpecializedPrompts(): Promise<string[]> {
    return [
      'system-coordination',
      'daily-briefing',
      'decision-making',
      'alert-handling',
    ];
  }

  async executeWorkflow(
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    switch (workflowId) {
      case 'get-status':
        return this.getSystemStatus();
      case 'run-cycle':
        return this.runMasterCycle();
      case 'daily-briefing':
        return this.generateDailyBriefing();
      case 'add-alert':
        return this.addAlert(
          data.level as Alert['level'],
          data.source as string,
          data.title as string,
          data.message as string
        );
      case 'set-mode':
        this.mode = data.mode as SystemStatus['mode'];
        return { mode: this.mode };
      default:
        throw new Error(`Unknown workflow: ${workflowId}`);
    }
  }

  getCapabilities(): string[] {
    return [
      'Volledige systeem coördinatie',
      'Autonome besluitvorming',
      'Alert management',
      'Agent coördinatie',
      'Dagelijkse briefings',
      'Escalatie naar mens',
      'Recovery management',
      'Mode switching (autonomous/supervised/maintenance/emergency)',
    ];
  }

  getMode(): SystemStatus['mode'] {
    return this.mode;
  }

  setMode(mode: SystemStatus['mode']): void {
    this.mode = mode;
    this.logger.info('Mode changed', { mode });
  }

  getDecisions(): AutonomousDecision[] {
    return Array.from(this.decisions.values());
  }

  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }
}

// ============================================
// FACTORY & REGISTRATION
// ============================================

export function createMasterAgent(): MasterAgent {
  const agent = new MasterAgent();
  registerAgent(agent);
  return agent;
}

const masterAgent = createMasterAgent();
export { masterAgent };
