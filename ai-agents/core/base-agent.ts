/**
 * RoTech AI Agents - Base Agent Class
 * Abstract base class voor alle specialized agents
 */

import {
  AgentType,
  AgentStatus,
  AgentInfo,
  AgentMetrics,
  AgentRequest,
  AgentResponse,
  AgentConfig,
  HealthStatus,
  Project,
  ProjectSpecs,
  ProjectUpdate,
  PromptContext,
  ReportType,
  ReportData,
  LogLevel,
  EventPayload,
  EventHandler,
  AgentEvent,
} from './types';
import { AgentLogger, createLogger } from './logger';
import { AgentErrorHandler, createErrorHandler, retry } from './error-handler';
import { PDFGenerator, createPDFGenerator, PDFDocument } from './pdf-generator';
import { PromptEngine, createPromptEngine } from './prompt-engine';
import { ProjectManager, createProjectManager, ProgressReport } from './project-manager';
import { AIProvider, createAIProvider } from './ai-provider';

// ============================================
// BASE AGENT ABSTRACT CLASS
// ============================================

export abstract class BaseAgent {
  // ============================================
  // ABSTRACT PROPERTIES (must be implemented)
  // ============================================

  abstract readonly agentId: string;
  abstract readonly agentName: string;
  abstract readonly agentType: AgentType;
  abstract readonly version: string;
  abstract readonly description: string;

  // ============================================
  // CORE SERVICES
  // ============================================

  protected logger: AgentLogger;
  protected errorHandler: AgentErrorHandler;
  protected pdfGenerator: PDFGenerator;
  protected promptEngine: PromptEngine;
  protected projectManager: ProjectManager;
  protected aiProvider: AIProvider;

  // ============================================
  // STATE
  // ============================================

  protected status: AgentStatus = 'idle';
  protected metrics: AgentMetrics = {
    projectsCompleted: 0,
    avgResponseTime: 0,
    errorRate: 0,
    successRate: 100,
    promptsGenerated: 0,
    reportsGenerated: 0,
  };
  protected startTime: Date | null = null;
  protected lastActive: Date = new Date();
  protected activeProjects: Map<string, Project> = new Map();
  protected eventHandlers: Map<AgentEvent, EventHandler[]> = new Map();
  protected config: AgentConfig;

  // ============================================
  // CONSTRUCTOR
  // ============================================

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      enabled: true,
      logLevel: 'info',
      maxConcurrentProjects: 10,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    // Initialize will be called after subclass sets agentId/agentType
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  protected initializeServices(): void {
    this.logger = createLogger(this.agentId, this.agentType, {
      level: this.config.logLevel,
      prefix: this.agentName,
    });

    this.errorHandler = createErrorHandler(this.logger);
    this.pdfGenerator = createPDFGenerator(this.logger);
    this.promptEngine = createPromptEngine(this.logger);
    this.projectManager = createProjectManager(this.logger, this.agentId);
    this.aiProvider = createAIProvider(this.agentId, this.agentType);
  }

  async initialize(): Promise<void> {
    this.initializeServices();
    this.logger.info(`${this.agentName} initializing...`, {
      version: this.version,
      config: this.config,
    });

    await this.onInitialize();

    this.logger.info(`${this.agentName} initialized successfully`);
  }

  // Override in subclass for custom initialization
  protected async onInitialize(): Promise<void> {
    // Default: no additional initialization
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  async start(): Promise<void> {
    if (this.status !== 'idle' && this.status !== 'offline') {
      this.logger.warn('Agent already running or in error state', { status: this.status });
      return;
    }

    this.status = 'idle';
    this.startTime = new Date();
    this.logger.info(`${this.agentName} started`);

    await this.onStart();
    this.emit('agent:started', {});
  }

  protected async onStart(): Promise<void> {
    // Override in subclass
  }

  async stop(): Promise<void> {
    this.status = 'offline';
    this.logger.info(`${this.agentName} stopped`);

    await this.onStop();
    this.emit('agent:stopped', {});
  }

  protected async onStop(): Promise<void> {
    // Override in subclass
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<HealthStatus> {
    const uptime = this.startTime
      ? Math.floor((Date.now() - this.startTime.getTime()) / 1000)
      : 0;

    const components = await this.checkComponents();
    const issues: string[] = [];

    // Check for unhealthy components
    for (const component of components) {
      if (component.status === 'unhealthy') {
        issues.push(`${component.name}: ${component.message || 'Unhealthy'}`);
      }
    }

    // Check error rate
    if (this.metrics.errorRate > 10) {
      issues.push(`High error rate: ${this.metrics.errorRate}%`);
    }

    const status: HealthStatus['status'] = 
      issues.length > 0 ? 'degraded' :
      this.status === 'error' ? 'unhealthy' : 'healthy';

    return {
      status,
      uptime,
      lastCheck: new Date(),
      components,
      issues: issues.length > 0 ? issues : undefined,
    };
  }

  protected async checkComponents(): Promise<HealthStatus['components']> {
    return [
      {
        name: 'Logger',
        status: 'healthy',
      },
      {
        name: 'ErrorHandler',
        status: 'healthy',
      },
      {
        name: 'PDFGenerator',
        status: 'healthy',
      },
      {
        name: 'PromptEngine',
        status: 'healthy',
      },
      {
        name: 'ProjectManager',
        status: 'healthy',
      },
    ];
  }

  // ============================================
  // REQUEST PROCESSING
  // ============================================

  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();
    this.status = 'busy';
    this.lastActive = new Date();

    this.logger.info('Processing request', {
      requestId: request.id,
      type: request.type,
      action: request.action,
    });

    try {
      // Apply timeout
      const timeoutMs = request.timeout || this.config.timeout;
      const result = await this.withTimeout(
        this.handleRequest(request),
        timeoutMs
      );

      const processingTime = Date.now() - startTime;
      this.updateMetrics(true, processingTime);

      this.status = 'idle';

      return {
        requestId: request.id,
        success: true,
        data: result,
        metadata: {
          processingTime,
          agentId: this.agentId,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.updateMetrics(false, processingTime);

      // Handle error
      await this.errorHandler.recover(error as Error, {
        agentId: this.agentId,
        agentType: this.agentType,
        operation: request.action,
        input: request.data,
        timestamp: new Date(),
      });

      this.status = 'idle';
      this.emit('agent:error', { error, request });

      return {
        requestId: request.id,
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: (error as Error).message,
          details: error,
        },
        metadata: {
          processingTime,
          agentId: this.agentId,
          timestamp: new Date(),
        },
      };
    }
  }

  // Override in subclass to handle specific request types
  protected async handleRequest(request: AgentRequest): Promise<unknown> {
    switch (request.type) {
      case 'project':
        return this.handleProjectRequest(request);
      case 'prompt':
        return this.handlePromptRequest(request);
      case 'report':
        return this.handleReportRequest(request);
      case 'analysis':
        return this.handleAnalysisRequest(request);
      case 'action':
        return this.handleActionRequest(request);
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  protected async handleProjectRequest(request: AgentRequest): Promise<unknown> {
    const { action, data } = request;

    switch (action) {
      case 'create':
        return this.createProject(data as ProjectSpecs);
      case 'update':
        return this.updateProject(data.projectId, data.updates);
      case 'status':
        return this.getProjectStatus(data.projectId);
      case 'progress':
        return this.getProjectProgress(data.projectId);
      default:
        throw new Error(`Unknown project action: ${action}`);
    }
  }

  protected async handlePromptRequest(request: AgentRequest): Promise<unknown> {
    const { action, data } = request;

    switch (action) {
      case 'generate':
        return this.generatePrompt(data.context);
      case 'optimize':
        return this.promptEngine.optimizePrompt(data.prompt);
      case 'evaluate':
        return this.promptEngine.evaluatePrompt(data.prompt);
      default:
        throw new Error(`Unknown prompt action: ${action}`);
    }
  }

  protected async handleReportRequest(request: AgentRequest): Promise<unknown> {
    const { action, data } = request;

    switch (action) {
      case 'generate':
        return this.createReport(data);
      case 'progress':
        return this.generateProgressReport(data.projectId);
      default:
        throw new Error(`Unknown report action: ${action}`);
    }
  }

  protected async handleAnalysisRequest(request: AgentRequest): Promise<unknown> {
    // Override in specialized agents
    throw new Error('Analysis not implemented for this agent');
  }

  protected async handleActionRequest(request: AgentRequest): Promise<unknown> {
    // Override in specialized agents
    throw new Error('Action not implemented for this agent');
  }

  // ============================================
  // PROJECT MANAGEMENT
  // ============================================

  async createProject(specs: ProjectSpecs): Promise<Project> {
    const project = await this.projectManager.createProject(specs);
    this.activeProjects.set(project.id, project);
    this.emit('project:created', { project });
    return project;
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project | null> {
    const project = await this.projectManager.updateProject(projectId, updates);
    if (project) {
      this.activeProjects.set(project.id, project);
      this.emit('project:updated', { project, updates });
    }
    return project;
  }

  async getProjectStatus(projectId: string): Promise<Project | null> {
    return this.projectManager.getProject(projectId);
  }

  async getProjectProgress(projectId: string): Promise<ProgressReport> {
    return this.projectManager.getProgress(projectId);
  }

  async completeProject(projectId: string): Promise<boolean> {
    const success = await this.projectManager.archiveProject(projectId);
    if (success) {
      this.activeProjects.delete(projectId);
      this.metrics.projectsCompleted++;
      this.emit('project:completed', { projectId });
    }
    return success;
  }

  // ============================================
  // PROMPT GENERATION
  // ============================================

  async generatePrompt(context: PromptContext): Promise<string> {
    // Get specialized template for this agent type
    const templates = this.promptEngine.getTemplatesByAgent(this.agentType);
    
    if (templates.length === 0) {
      // Use AI-powered generation
      return this.generateAIPrompt(context);
    }

    // Select best template based on context
    const template = this.selectBestTemplate(templates, context);
    const basePrompt = this.promptEngine.generate(template.id, context);
    
    // Enhance with AI if complex
    if (context.additionalContext && Object.keys(context.additionalContext).length > 3) {
      const enhanced = await this.enhancePromptWithAI(basePrompt, context);
      this.metrics.promptsGenerated++;
      this.emit('prompt:generated', { templateId: template.id, context, enhanced: true });
      return enhanced;
    }
    
    this.metrics.promptsGenerated++;
    this.emit('prompt:generated', { templateId: template.id, context });
    
    return basePrompt;
  }

  /**
   * Generate prompt using REAL AI
   * Dit maakt de agent intelligent
   */
  protected async generateAIPrompt(context: PromptContext): Promise<string> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.buildContextPrompt(context);
    
    const response = await this.aiProvider.generateText(userPrompt, {
      systemPrompt,
      temperature: 0.7,
    });
    
    this.metrics.promptsGenerated++;
    return response;
  }

  /**
   * Get the system prompt for this agent
   * Override in subclass for specialized behavior
   */
  protected getSystemPrompt(): string {
    return `Je bent ${this.agentName}, een AI agent voor Ro-Tech Development.
Je taak: ${this.description}

Ro-Tech Development is een web development bureau in Veldhoven, Nederland.
Eigenaar: Bart van Rooij
Doelgroep: MKB en ZZP in Nederland
Tone of voice: Professioneel maar toegankelijk, Brabantse no-nonsense

Je geeft altijd concrete, actionable antwoorden.`;
  }

  /**
   * Build a prompt from context
   */
  protected buildContextPrompt(context: PromptContext): string {
    let prompt = '';
    
    if (context.projectType) {
      prompt += `Project type: ${context.projectType}\n`;
    }
    
    if (context.clientInfo) {
      prompt += `Klant: ${context.clientInfo.companyName} (${context.clientInfo.contactName})\n`;
    }
    
    if (context.requirements && context.requirements.length > 0) {
      prompt += `Requirements:\n${context.requirements.map(r => `- ${r}`).join('\n')}\n`;
    }
    
    if (context.constraints && context.constraints.length > 0) {
      prompt += `Constraints:\n${context.constraints.map(c => `- ${c}`).join('\n')}\n`;
    }
    
    if (context.additionalContext) {
      prompt += `\nAanvullende context:\n${JSON.stringify(context.additionalContext, null, 2)}\n`;
    }
    
    if (context.previousOutput) {
      prompt += `\nVorige output (ter referentie):\n${context.previousOutput}\n`;
    }
    
    return prompt;
  }

  /**
   * Enhance a basic prompt with AI
   */
  protected async enhancePromptWithAI(basePrompt: string, context: PromptContext): Promise<string> {
    const enhancePrompt = `Verbeter en verfijn de volgende prompt voor betere resultaten:

${basePrompt}

Context: ${JSON.stringify(context.additionalContext)}

Geef een verbeterde versie die specifieker en effectiever is.`;

    return this.aiProvider.generateText(enhancePrompt, {
      systemPrompt: 'Je bent een prompt engineering expert. Verbeter prompts voor betere AI output.',
    });
  }

  // Legacy method for backwards compatibility
  protected async generateCustomPrompt(context: PromptContext): Promise<string> {
    return this.generateAIPrompt(context);
  }

  protected getDefaultPromptTemplate(): string {
    return `# ${this.agentName} - Opdracht

## Context
{{context}}

## Requirements
{{requirements}}

## Opdracht
{{task}}

## Output Format
Lever een gestructureerd resultaat in Markdown formaat.`;
  }

  protected selectBestTemplate(
    templates: ReturnType<PromptEngine['getTemplatesByAgent']>,
    context: PromptContext
  ): ReturnType<PromptEngine['getTemplatesByAgent']>[0] {
    // Simple selection: highest quality score
    return templates.sort((a, b) => b.qualityScore - a.qualityScore)[0];
  }

  // ============================================
  // REPORT GENERATION
  // ============================================

  async createReport(data: ReportData): Promise<PDFDocument> {
    const reportType = this.getReportType(data);
    const report = await this.pdfGenerator.generate(reportType, data);
    
    this.metrics.reportsGenerated++;
    this.emit('report:generated', { reportId: report.id, type: reportType });
    
    return report;
  }

  protected getReportType(data: ReportData): ReportType {
    // Override in subclass for specialized report types
    return 'custom';
  }

  async generateProgressReport(projectId: string): Promise<PDFDocument> {
    const project = await this.projectManager.getProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return this.pdfGenerator.generateProgressReport(project);
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  protected async handleError(error: Error, operation: string): Promise<void> {
    const diagnosis = await this.errorHandler.diagnose(error, {
      agentId: this.agentId,
      agentType: this.agentType,
      operation,
      timestamp: new Date(),
    });

    this.logger.error(`Error in ${operation}`, error, { diagnosis });

    if (this.errorHandler.shouldEscalate(error)) {
      await this.errorHandler.escalateToHuman(error, {
        agentId: this.agentId,
        agentType: this.agentType,
        operation,
        timestamp: new Date(),
      });
    }
  }

  protected async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    return retry(operation, {
      maxAttempts: this.config.retryAttempts,
      baseDelay: this.config.retryDelay,
      exponential: true,
      onRetry: (attempt, error) => {
        this.logger.warn(`Retry attempt ${attempt} for ${operationName}`, {
          error: error.message,
        });
      },
    });
  }

  // ============================================
  // EVENTS
  // ============================================

  on(event: AgentEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: AgentEvent, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  protected emit(event: AgentEvent, data: Record<string, unknown>): void {
    const payload: EventPayload = {
      event,
      agentId: this.agentId,
      timestamp: new Date(),
      data,
    };

    const handlers = this.eventHandlers.get(event) || [];
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (error) {
        this.logger.error('Event handler error', error as Error, { event });
      }
    }
  }

  // ============================================
  // METRICS
  // ============================================

  protected updateMetrics(success: boolean, responseTime: number): void {
    // Update success/error rate
    const total = this.metrics.projectsCompleted + 1;
    if (success) {
      this.metrics.successRate = ((this.metrics.successRate * total) + 100) / (total + 1);
    } else {
      this.metrics.errorRate = ((this.metrics.errorRate * total) + 100) / (total + 1);
    }

    // Update average response time
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * total + responseTime) / (total + 1);
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  getInfo(): AgentInfo {
    return {
      id: this.agentId,
      name: this.agentName,
      type: this.agentType,
      version: this.version,
      status: this.status,
      lastActive: this.lastActive,
      activeProjects: this.activeProjects.size,
      metrics: this.getMetrics(),
    };
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  protected async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  protected generateId(prefix: string = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // ABSTRACT METHODS (must be implemented)
  // ============================================

  /**
   * Get specialized prompts for this agent type
   */
  abstract getSpecializedPrompts(): Promise<string[]>;

  /**
   * Execute agent-specific workflow
   */
  abstract executeWorkflow(workflowId: string, data: Record<string, unknown>): Promise<unknown>;

  /**
   * Get agent-specific capabilities
   */
  abstract getCapabilities(): string[];
}

// ============================================
// AGENT REGISTRY
// ============================================

class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  register(agent: BaseAgent): void {
    this.agents.set(agent.agentId, agent);
  }

  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  get(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  getByType(agentType: AgentType): BaseAgent[] {
    return Array.from(this.agents.values()).filter(a => a.agentType === agentType);
  }

  getAll(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getAllInfo(): AgentInfo[] {
    return this.getAll().map(a => a.getInfo());
  }
}

export const agentRegistry = new AgentRegistry();

// ============================================
// EXPORT FACTORY
// ============================================

export function registerAgent(agent: BaseAgent): void {
  agentRegistry.register(agent);
}

export function getAgent(agentId: string): BaseAgent | undefined {
  return agentRegistry.get(agentId);
}

export function getAllAgents(): BaseAgent[] {
  return agentRegistry.getAll();
}
