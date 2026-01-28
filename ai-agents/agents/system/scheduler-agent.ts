/**
 * RoTech AI Agents - Scheduler Agent
 * Automatische taakplanning, prioritering en load balancing
 * 
 * Zorgt dat alle werk optimaal verdeeld wordt over agents
 */

import {
  BaseAgent,
  registerAgent,
  AgentType,
  getAllAgents,
  getGlobalProjectStorage,
  Project,
} from '../../core';

// ============================================
// SCHEDULER TYPES
// ============================================

interface ScheduledTask {
  id: string;
  type: 'project' | 'maintenance' | 'marketing' | 'optimization' | 'report' | 'custom';
  agentId: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  title: string;
  description: string;
  scheduledFor: Date;
  deadline?: Date;
  status: 'scheduled' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  estimatedDuration: number; // minutes
  actualDuration?: number;
  dependencies?: string[]; // task IDs
  data?: Record<string, unknown>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: unknown;
}

interface AgentWorkload {
  agentId: string;
  agentName: string;
  currentTasks: number;
  queuedTasks: number;
  completedToday: number;
  avgTaskDuration: number;
  availability: 'available' | 'busy' | 'overloaded' | 'offline';
  nextAvailableSlot: Date;
}

interface ScheduleOptimization {
  id: string;
  type: 'reorder' | 'reassign' | 'parallelize' | 'delay';
  title: string;
  reason: string;
  impact: string;
  tasksAffected: string[];
  status: 'pending' | 'applied' | 'rejected';
}

interface RecurringTask {
  id: string;
  taskTemplate: Omit<ScheduledTask, 'id' | 'scheduledFor' | 'status' | 'createdAt'>;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'cron';
    time?: string; // HH:MM
    dayOfWeek?: number; // 0-6
    dayOfMonth?: number;
    cronExpression?: string;
  };
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

// ============================================
// SCHEDULER AGENT CLASS
// ============================================

export class SchedulerAgent extends BaseAgent {
  readonly agentId = 'scheduler-agent';
  readonly agentName = 'Scheduler Agent';
  readonly agentType: AgentType = 'automatisering';
  readonly version = '1.0.0';
  readonly description = 'Automatische taakplanning, prioritering en load balancing';

  private tasks: Map<string, ScheduledTask> = new Map();
  private recurringTasks: Map<string, RecurringTask> = new Map();
  private taskQueue: string[] = []; // Task IDs in priority order
  private workloads: Map<string, AgentWorkload> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeServices();
    this.initializeRecurringTasks();
  }

  private initializeRecurringTasks(): void {
    // Daily health check
    this.createRecurringTask({
      taskTemplate: {
        type: 'maintenance',
        agentId: 'orchestrator-agent',
        priority: 2,
        title: 'Dagelijkse system health check',
        description: 'Controleer alle agents en systeem status',
        estimatedDuration: 5,
      },
      schedule: { type: 'daily', time: '08:00' },
    });

    // Daily optimization cycle
    this.createRecurringTask({
      taskTemplate: {
        type: 'optimization',
        agentId: 'optimizer-agent',
        priority: 3,
        title: 'Dagelijkse optimalisatie cyclus',
        description: 'Analyseer en optimaliseer systeem prestaties',
        estimatedDuration: 15,
      },
      schedule: { type: 'daily', time: '06:00' },
    });

    // Weekly marketing report
    this.createRecurringTask({
      taskTemplate: {
        type: 'marketing',
        agentId: 'marketing-agent',
        priority: 3,
        title: 'Wekelijks marketing rapport',
        description: 'Genereer marketing performance rapport',
        estimatedDuration: 10,
      },
      schedule: { type: 'weekly', dayOfWeek: 1, time: '09:00' },
    });

    // Daily backup check
    this.createRecurringTask({
      taskTemplate: {
        type: 'maintenance',
        agentId: 'onderhoud-agent',
        priority: 1,
        title: 'Backup verificatie',
        description: 'Controleer alle website backups',
        estimatedDuration: 10,
      },
      schedule: { type: 'daily', time: '02:00' },
    });
  }

  protected async onStart(): Promise<void> {
    this.startScheduler();
  }

  protected async onStop(): Promise<void> {
    this.stopScheduler();
  }

  // ============================================
  // SCHEDULER LOOP
  // ============================================

  startScheduler(intervalSeconds: number = 60): void {
    this.logger.info('Starting scheduler', { intervalSeconds });

    this.schedulerInterval = setInterval(async () => {
      await this.runSchedulerCycle();
    }, intervalSeconds * 1000);

    // Initial run
    this.runSchedulerCycle();
  }

  stopScheduler(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  async runSchedulerCycle(): Promise<void> {
    const startTime = Date.now();

    try {
      // 1. Check recurring tasks
      await this.checkRecurringTasks();

      // 2. Update workloads
      await this.updateWorkloads();

      // 3. Process task queue
      await this.processQueue();

      // 4. Check for optimizations
      await this.checkForOptimizations();

      // 5. Handle overdue tasks
      await this.handleOverdueTasks();

      const duration = Date.now() - startTime;
      this.logger.performance('scheduler-cycle', duration);
    } catch (error) {
      this.logger.error('Scheduler cycle failed', error as Error);
    }
  }

  // ============================================
  // TASK SCHEDULING
  // ============================================

  async scheduleTask(
    task: Omit<ScheduledTask, 'id' | 'status' | 'createdAt'>
  ): Promise<ScheduledTask> {
    const fullTask: ScheduledTask = {
      ...task,
      id: this.generateId('task'),
      status: 'scheduled',
      createdAt: new Date(),
    };

    this.tasks.set(fullTask.id, fullTask);
    this.addToQueue(fullTask);

    this.logger.info('Task scheduled', {
      id: fullTask.id,
      title: fullTask.title,
      agentId: fullTask.agentId,
      scheduledFor: fullTask.scheduledFor,
    });

    return fullTask;
  }

  async scheduleProjectTask(
    projectId: string,
    phaseId: string,
    taskTitle: string,
    agentId: string,
    priority: ScheduledTask['priority'] = 3
  ): Promise<ScheduledTask> {
    return this.scheduleTask({
      type: 'project',
      agentId,
      priority,
      title: taskTitle,
      description: `Project: ${projectId}, Phase: ${phaseId}`,
      scheduledFor: new Date(),
      estimatedDuration: 60,
      data: { projectId, phaseId },
    });
  }

  private addToQueue(task: ScheduledTask): void {
    // Insert based on priority and scheduled time
    const insertIndex = this.taskQueue.findIndex(id => {
      const existingTask = this.tasks.get(id);
      if (!existingTask) return false;
      
      // Higher priority first
      if (task.priority < existingTask.priority) return true;
      if (task.priority > existingTask.priority) return false;
      
      // Earlier scheduled time first
      return task.scheduledFor < existingTask.scheduledFor;
    });

    if (insertIndex === -1) {
      this.taskQueue.push(task.id);
    } else {
      this.taskQueue.splice(insertIndex, 0, task.id);
    }
  }

  private async processQueue(): Promise<void> {
    const now = new Date();
    const tasksToRun: ScheduledTask[] = [];

    // Find tasks that are ready to run
    for (const taskId of this.taskQueue) {
      const task = this.tasks.get(taskId);
      if (!task) continue;

      if (task.status === 'scheduled' && task.scheduledFor <= now) {
        // Check dependencies
        if (this.areDependenciesMet(task)) {
          // Check agent availability
          const workload = this.workloads.get(task.agentId);
          if (workload && workload.availability !== 'overloaded') {
            tasksToRun.push(task);
          }
        }
      }
    }

    // Execute ready tasks
    for (const task of tasksToRun) {
      await this.executeTask(task);
    }
  }

  private areDependenciesMet(task: ScheduledTask): boolean {
    if (!task.dependencies || task.dependencies.length === 0) return true;

    return task.dependencies.every(depId => {
      const dep = this.tasks.get(depId);
      return dep && dep.status === 'completed';
    });
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    this.logger.info('Executing task', { id: task.id, title: task.title });

    task.status = 'running';
    task.startedAt = new Date();
    this.tasks.set(task.id, task);

    try {
      // Get the target agent
      const agents = getAllAgents();
      const agent = agents.find(a => a.agentId === task.agentId);

      if (!agent) {
        throw new Error(`Agent not found: ${task.agentId}`);
      }

      // Execute based on task type
      let result: unknown;
      switch (task.type) {
        case 'maintenance':
          result = await agent.executeWorkflow('health-check', task.data || {});
          break;
        case 'optimization':
          result = await agent.executeWorkflow('run-cycle', task.data || {});
          break;
        case 'marketing':
          result = await agent.executeWorkflow('run-automation', task.data || {});
          break;
        case 'report':
          result = await agent.executeWorkflow('generate-report', task.data || {});
          break;
        default:
          result = await agent.executeWorkflow(task.type, task.data || {});
      }

      task.status = 'completed';
      task.completedAt = new Date();
      task.actualDuration = Math.round((task.completedAt.getTime() - task.startedAt!.getTime()) / 60000);
      task.result = result;

      // Remove from queue
      this.taskQueue = this.taskQueue.filter(id => id !== task.id);

      this.logger.info('Task completed', {
        id: task.id,
        duration: task.actualDuration,
      });
    } catch (error) {
      task.status = 'failed';
      task.completedAt = new Date();
      
      this.logger.error('Task failed', error as Error, { taskId: task.id });
    }

    this.tasks.set(task.id, task);
  }

  // ============================================
  // RECURRING TASKS
  // ============================================

  createRecurringTask(config: {
    taskTemplate: RecurringTask['taskTemplate'];
    schedule: RecurringTask['schedule'];
  }): RecurringTask {
    const recurring: RecurringTask = {
      id: this.generateId('recurring'),
      taskTemplate: config.taskTemplate,
      schedule: config.schedule,
      enabled: true,
      nextRun: this.calculateNextRun(config.schedule),
    };

    this.recurringTasks.set(recurring.id, recurring);
    return recurring;
  }

  private calculateNextRun(schedule: RecurringTask['schedule']): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule.type) {
      case 'daily':
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
        } else {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        if (schedule.dayOfWeek !== undefined) {
          const daysUntil = (schedule.dayOfWeek - now.getDay() + 7) % 7 || 7;
          next.setDate(next.getDate() + daysUntil);
        }
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;

      case 'monthly':
        if (schedule.dayOfMonth) {
          next.setMonth(next.getMonth() + 1);
          next.setDate(schedule.dayOfMonth);
        }
        if (schedule.time) {
          const [hours, minutes] = schedule.time.split(':').map(Number);
          next.setHours(hours, minutes, 0, 0);
        }
        break;
    }

    return next;
  }

  private async checkRecurringTasks(): Promise<void> {
    const now = new Date();

    for (const [id, recurring] of this.recurringTasks) {
      if (!recurring.enabled) continue;

      if (recurring.nextRun <= now) {
        // Schedule the task
        await this.scheduleTask({
          ...recurring.taskTemplate,
          scheduledFor: new Date(),
        });

        // Update next run
        recurring.lastRun = now;
        recurring.nextRun = this.calculateNextRun(recurring.schedule);
        this.recurringTasks.set(id, recurring);

        this.logger.info('Recurring task triggered', {
          id: recurring.id,
          title: recurring.taskTemplate.title,
          nextRun: recurring.nextRun,
        });
      }
    }
  }

  // ============================================
  // WORKLOAD MANAGEMENT
  // ============================================

  private async updateWorkloads(): Promise<void> {
    const agents = getAllAgents();

    for (const agent of agents) {
      const info = agent.getInfo();
      const agentTasks = Array.from(this.tasks.values()).filter(t => t.agentId === agent.agentId);
      
      const currentTasks = agentTasks.filter(t => t.status === 'running').length;
      const queuedTasks = agentTasks.filter(t => t.status === 'scheduled' || t.status === 'queued').length;
      const completedToday = agentTasks.filter(t => {
        if (!t.completedAt) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return t.completedAt >= today;
      }).length;

      const avgDuration = agentTasks
        .filter(t => t.actualDuration)
        .reduce((sum, t) => sum + (t.actualDuration || 0), 0) / Math.max(1, agentTasks.filter(t => t.actualDuration).length);

      let availability: AgentWorkload['availability'] = 'available';
      if (info.status === 'offline') availability = 'offline';
      else if (currentTasks >= 3) availability = 'overloaded';
      else if (currentTasks > 0) availability = 'busy';

      const nextAvailable = new Date();
      if (availability === 'busy' || availability === 'overloaded') {
        nextAvailable.setMinutes(nextAvailable.getMinutes() + avgDuration * currentTasks);
      }

      this.workloads.set(agent.agentId, {
        agentId: agent.agentId,
        agentName: info.name,
        currentTasks,
        queuedTasks,
        completedToday,
        avgTaskDuration: avgDuration,
        availability,
        nextAvailableSlot: nextAvailable,
      });
    }
  }

  async getOptimalAgent(taskType: ScheduledTask['type']): Promise<string | null> {
    const agentTypeMap: Record<string, string[]> = {
      project: ['intake-agent', 'starter-website-agent', 'business-website-agent'],
      maintenance: ['onderhoud-agent'],
      marketing: ['marketing-agent'],
      optimization: ['optimizer-agent'],
      report: ['orchestrator-agent'],
    };

    const preferredAgents = agentTypeMap[taskType] || [];
    
    // Find available agent with lowest workload
    let bestAgent: string | null = null;
    let lowestWorkload = Infinity;

    for (const agentId of preferredAgents) {
      const workload = this.workloads.get(agentId);
      if (workload && workload.availability !== 'offline' && workload.availability !== 'overloaded') {
        const totalLoad = workload.currentTasks + workload.queuedTasks;
        if (totalLoad < lowestWorkload) {
          lowestWorkload = totalLoad;
          bestAgent = agentId;
        }
      }
    }

    return bestAgent;
  }

  // ============================================
  // OPTIMIZATION
  // ============================================

  private async checkForOptimizations(): Promise<ScheduleOptimization[]> {
    const optimizations: ScheduleOptimization[] = [];

    // Check for overloaded agents
    for (const [agentId, workload] of this.workloads) {
      if (workload.availability === 'overloaded') {
        // Find tasks that can be reassigned
        const reassignableTasks = Array.from(this.tasks.values())
          .filter(t => t.agentId === agentId && t.status === 'scheduled');

        if (reassignableTasks.length > 0) {
          const optimalAgent = await this.getOptimalAgent(reassignableTasks[0].type);
          if (optimalAgent && optimalAgent !== agentId) {
            optimizations.push({
              id: this.generateId('opt'),
              type: 'reassign',
              title: `Herverdeeld taken van ${workload.agentName}`,
              reason: 'Agent is overbelast',
              impact: 'Snellere verwerking van taken',
              tasksAffected: reassignableTasks.map(t => t.id),
              status: 'pending',
            });
          }
        }
      }
    }

    // Check for tasks that can be parallelized
    const independentTasks = Array.from(this.tasks.values())
      .filter(t => t.status === 'scheduled' && (!t.dependencies || t.dependencies.length === 0));

    if (independentTasks.length > 3) {
      optimizations.push({
        id: this.generateId('opt'),
        type: 'parallelize',
        title: 'Parallel uitvoeren van onafhankelijke taken',
        reason: `${independentTasks.length} taken hebben geen dependencies`,
        impact: 'Snellere totale doorlooptijd',
        tasksAffected: independentTasks.map(t => t.id),
        status: 'pending',
      });
    }

    return optimizations;
  }

  private async handleOverdueTasks(): Promise<void> {
    const now = new Date();
    
    for (const task of this.tasks.values()) {
      if (task.deadline && task.deadline < now && task.status !== 'completed' && task.status !== 'failed') {
        // Increase priority
        if (task.priority > 1) {
          task.priority = 1;
          this.tasks.set(task.id, task);
          
          // Reorder queue
          this.taskQueue = this.taskQueue.filter(id => id !== task.id);
          this.addToQueue(task);

          this.logger.warn('Overdue task prioritized', {
            id: task.id,
            title: task.title,
            deadline: task.deadline,
          });
        }
      }
    }
  }

  // ============================================
  // ABSTRACT IMPLEMENTATIONS
  // ============================================

  async getSpecializedPrompts(): Promise<string[]> {
    return [
      'task-prioritization',
      'workload-analysis',
      'schedule-optimization',
    ];
  }

  async executeWorkflow(
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    switch (workflowId) {
      case 'schedule-task':
        return this.scheduleTask(data as any);
      case 'run-cycle':
        return this.runSchedulerCycle();
      case 'get-workloads':
        return Array.from(this.workloads.values());
      case 'get-queue':
        return this.taskQueue.map(id => this.tasks.get(id));
      default:
        throw new Error(`Unknown workflow: ${workflowId}`);
    }
  }

  getCapabilities(): string[] {
    return [
      'Automatische taakplanning',
      'Prioriteit-gebaseerde queue',
      'Recurring tasks',
      'Load balancing',
      'Dependency management',
      'Overdue handling',
      'Workload monitoring',
      'Schedule optimalisatie',
    ];
  }

  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  getRecurringTasks(): RecurringTask[] {
    return Array.from(this.recurringTasks.values());
  }

  getWorkloads(): AgentWorkload[] {
    return Array.from(this.workloads.values());
  }
}

// ============================================
// FACTORY & REGISTRATION
// ============================================

export function createSchedulerAgent(): SchedulerAgent {
  const agent = new SchedulerAgent();
  registerAgent(agent);
  return agent;
}

const schedulerAgent = createSchedulerAgent();
export { schedulerAgent };
