/**
 * RoTech AI Agents - Project Manager
 * Volledig project lifecycle management
 */

import {
  Project,
  ProjectSpecs,
  ProjectUpdate,
  ProjectStatus,
  ProjectPhase,
  ProjectType,
  Task,
  Deliverable,
  Milestone,
} from './types';
import { AgentLogger } from './logger';

// ============================================
// PROJECT PHASE TEMPLATES
// ============================================

const PHASE_TEMPLATES: Record<ProjectType, Omit<ProjectPhase, 'id' | 'startedAt' | 'completedAt'>[]> = {
  'starter-website': [
    {
      name: 'Intake & Planning',
      description: 'Requirements verzamelen en project plannen',
      status: 'pending',
      order: 1,
      estimatedDuration: 2,
      deliverables: [],
      tasks: [
        { id: 't1', title: 'Intake gesprek', description: 'Bespreken van wensen en requirements', status: 'pending', priority: 'high' },
        { id: 't2', title: 'Content verzamelen', description: 'Teksten en afbeeldingen verzamelen', status: 'pending', priority: 'high' },
        { id: 't3', title: 'Project planning maken', description: 'Tijdlijn en milestones definiëren', status: 'pending', priority: 'medium' },
      ],
    },
    {
      name: 'Design',
      description: 'Ontwerp van de website',
      status: 'pending',
      order: 2,
      estimatedDuration: 3,
      deliverables: [],
      tasks: [
        { id: 't4', title: 'Wireframe maken', description: 'Basis layout bepalen', status: 'pending', priority: 'high' },
        { id: 't5', title: 'Design uitwerken', description: 'Visueel ontwerp maken', status: 'pending', priority: 'high' },
        { id: 't6', title: 'Feedback verwerken', description: 'Revisies doorvoeren', status: 'pending', priority: 'medium' },
      ],
    },
    {
      name: 'Development',
      description: 'Bouwen van de website',
      status: 'pending',
      order: 3,
      estimatedDuration: 5,
      deliverables: [],
      tasks: [
        { id: 't7', title: 'Project setup', description: 'Next.js project opzetten', status: 'pending', priority: 'high' },
        { id: 't8', title: 'Componenten bouwen', description: 'UI componenten ontwikkelen', status: 'pending', priority: 'high' },
        { id: 't9', title: 'Content implementeren', description: 'Teksten en media toevoegen', status: 'pending', priority: 'medium' },
        { id: 't10', title: 'Contactformulier', description: 'Formulier met email integratie', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Testing & Review',
      description: 'Testen en klant review',
      status: 'pending',
      order: 4,
      estimatedDuration: 2,
      deliverables: [],
      tasks: [
        { id: 't11', title: 'Responsive testen', description: 'Alle breakpoints controleren', status: 'pending', priority: 'high' },
        { id: 't12', title: 'Performance check', description: 'Lighthouse audit', status: 'pending', priority: 'medium' },
        { id: 't13', title: 'Klant review', description: 'Feedback verzamelen', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Deployment',
      description: 'Live zetten en overdracht',
      status: 'pending',
      order: 5,
      estimatedDuration: 1,
      deliverables: [],
      tasks: [
        { id: 't14', title: 'Productie deployment', description: 'Website live zetten', status: 'pending', priority: 'critical' },
        { id: 't15', title: 'Domein koppelen', description: 'DNS configureren', status: 'pending', priority: 'high' },
        { id: 't16', title: 'Documentatie', description: 'Handleiding maken', status: 'pending', priority: 'medium' },
        { id: 't17', title: 'Overdracht', description: 'Klant informeren', status: 'pending', priority: 'high' },
      ],
    },
  ],
  'business-website': [
    {
      name: 'Discovery & Planning',
      description: 'Uitgebreide intake en project planning',
      status: 'pending',
      order: 1,
      estimatedDuration: 5,
      deliverables: [],
      tasks: [
        { id: 't1', title: 'Kickoff meeting', description: 'Project kickoff met stakeholders', status: 'pending', priority: 'high' },
        { id: 't2', title: 'Requirements document', description: 'Gedetailleerde specificaties', status: 'pending', priority: 'high' },
        { id: 't3', title: 'Content strategie', description: 'Content plan opstellen', status: 'pending', priority: 'high' },
        { id: 't4', title: 'Sitemap', description: 'Website structuur bepalen', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Design',
      description: 'UX/UI ontwerp',
      status: 'pending',
      order: 2,
      estimatedDuration: 7,
      deliverables: [],
      tasks: [
        { id: 't5', title: 'Wireframes', description: 'Alle pagina wireframes', status: 'pending', priority: 'high' },
        { id: 't6', title: 'Styleguide', description: 'Kleuren, fonts, componenten', status: 'pending', priority: 'medium' },
        { id: 't7', title: 'Homepage design', description: 'Uitgewerkt design homepage', status: 'pending', priority: 'high' },
        { id: 't8', title: 'Subpagina designs', description: 'Designs overige paginas', status: 'pending', priority: 'high' },
        { id: 't9', title: 'Design review', description: 'Klant feedback verwerken', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Development',
      description: 'Frontend en backend development',
      status: 'pending',
      order: 3,
      estimatedDuration: 10,
      deliverables: [],
      tasks: [
        { id: 't10', title: 'Project setup', description: 'Next.js met CMS', status: 'pending', priority: 'high' },
        { id: 't11', title: 'Component library', description: 'Herbruikbare componenten', status: 'pending', priority: 'high' },
        { id: 't12', title: 'Pagina development', description: 'Alle paginas bouwen', status: 'pending', priority: 'high' },
        { id: 't13', title: 'CMS integratie', description: 'Content management opzetten', status: 'pending', priority: 'high' },
        { id: 't14', title: 'Blog module', description: 'Blog functionaliteit', status: 'pending', priority: 'medium' },
        { id: 't15', title: 'SEO implementatie', description: 'Meta tags, schema, sitemap', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Content & Integratie',
      description: 'Content invoeren en integraties',
      status: 'pending',
      order: 4,
      estimatedDuration: 5,
      deliverables: [],
      tasks: [
        { id: 't16', title: 'Content invoer', description: 'Alle content toevoegen', status: 'pending', priority: 'high' },
        { id: 't17', title: 'Analytics setup', description: 'Google Analytics/Search Console', status: 'pending', priority: 'medium' },
        { id: 't18', title: 'Email integratie', description: 'Formulieren en notificaties', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Testing & QA',
      description: 'Uitgebreide testing',
      status: 'pending',
      order: 5,
      estimatedDuration: 3,
      deliverables: [],
      tasks: [
        { id: 't19', title: 'Functional testing', description: 'Alle functionaliteit testen', status: 'pending', priority: 'high' },
        { id: 't20', title: 'Cross-browser testing', description: 'Chrome, Firefox, Safari, Edge', status: 'pending', priority: 'medium' },
        { id: 't21', title: 'Performance testing', description: 'Lighthouse en Core Web Vitals', status: 'pending', priority: 'high' },
        { id: 't22', title: 'SEO audit', description: 'SEO checklist doorlopen', status: 'pending', priority: 'high' },
      ],
    },
    {
      name: 'Launch',
      description: 'Go-live en overdracht',
      status: 'pending',
      order: 6,
      estimatedDuration: 2,
      deliverables: [],
      tasks: [
        { id: 't23', title: 'Pre-launch check', description: 'Laatste controles', status: 'pending', priority: 'critical' },
        { id: 't24', title: 'Production deploy', description: 'Live deployment', status: 'pending', priority: 'critical' },
        { id: 't25', title: 'DNS setup', description: 'Domein configureren', status: 'pending', priority: 'high' },
        { id: 't26', title: 'Monitoring setup', description: 'Uptime en error tracking', status: 'pending', priority: 'medium' },
        { id: 't27', title: 'Documentatie', description: 'CMS handleiding', status: 'pending', priority: 'high' },
        { id: 't28', title: 'Overdracht meeting', description: 'Training en Q&A', status: 'pending', priority: 'high' },
      ],
    },
  ],
  // Simplified templates for other project types
  'webshop': [
    { name: 'Discovery', description: 'Requirements en product analyse', status: 'pending', order: 1, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Design', description: 'Shop design en UX', status: 'pending', order: 2, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Development', description: 'E-commerce development', status: 'pending', order: 3, estimatedDuration: 15, deliverables: [], tasks: [] },
    { name: 'Product Setup', description: 'Producten en betalingen', status: 'pending', order: 4, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Testing', description: 'Order flow testing', status: 'pending', order: 5, estimatedDuration: 4, deliverables: [], tasks: [] },
    { name: 'Launch', description: 'Go-live', status: 'pending', order: 6, estimatedDuration: 2, deliverables: [], tasks: [] },
  ],
  'maatwerk-webapp': [
    { name: 'Discovery', description: 'Requirements engineering', status: 'pending', order: 1, estimatedDuration: 10, deliverables: [], tasks: [] },
    { name: 'Architecture', description: 'Technische architectuur', status: 'pending', order: 2, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Design', description: 'UI/UX design', status: 'pending', order: 3, estimatedDuration: 10, deliverables: [], tasks: [] },
    { name: 'Sprint 1', description: 'Core functionaliteit', status: 'pending', order: 4, estimatedDuration: 14, deliverables: [], tasks: [] },
    { name: 'Sprint 2', description: 'Extended features', status: 'pending', order: 5, estimatedDuration: 14, deliverables: [], tasks: [] },
    { name: 'Sprint 3', description: 'Polish en integraties', status: 'pending', order: 6, estimatedDuration: 14, deliverables: [], tasks: [] },
    { name: 'Testing', description: 'UAT en QA', status: 'pending', order: 7, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Launch', description: 'Productie deployment', status: 'pending', order: 8, estimatedDuration: 3, deliverables: [], tasks: [] },
  ],
  'automatisering': [
    { name: 'Analyse', description: 'Proces analyse', status: 'pending', order: 1, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Design', description: 'Workflow design', status: 'pending', order: 2, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Implementatie', description: 'Workflows bouwen', status: 'pending', order: 3, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Testing', description: 'End-to-end testing', status: 'pending', order: 4, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Deployment', description: 'Live zetten en training', status: 'pending', order: 5, estimatedDuration: 2, deliverables: [], tasks: [] },
  ],
  'pwa': [
    { name: 'Planning', description: 'PWA features bepalen', status: 'pending', order: 1, estimatedDuration: 2, deliverables: [], tasks: [] },
    { name: 'Development', description: 'PWA implementatie', status: 'pending', order: 2, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Testing', description: 'Cross-device testing', status: 'pending', order: 3, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Deployment', description: 'Publicatie', status: 'pending', order: 4, estimatedDuration: 1, deliverables: [], tasks: [] },
  ],
  'api-integratie': [
    { name: 'Analyse', description: 'API requirements', status: 'pending', order: 1, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Design', description: 'Integratie design', status: 'pending', order: 2, estimatedDuration: 2, deliverables: [], tasks: [] },
    { name: 'Development', description: 'API koppeling bouwen', status: 'pending', order: 3, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Testing', description: 'Integratie testing', status: 'pending', order: 4, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Deployment', description: 'Live en documentatie', status: 'pending', order: 5, estimatedDuration: 1, deliverables: [], tasks: [] },
  ],
  'seo': [
    { name: 'Audit', description: 'SEO audit uitvoeren', status: 'pending', order: 1, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Strategie', description: 'SEO strategie bepalen', status: 'pending', order: 2, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Technisch', description: 'Technische optimalisatie', status: 'pending', order: 3, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Content', description: 'Content optimalisatie', status: 'pending', order: 4, estimatedDuration: 10, deliverables: [], tasks: [] },
    { name: 'Monitoring', description: 'Resultaten meten', status: 'pending', order: 5, estimatedDuration: 0, deliverables: [], tasks: [] },
  ],
  'onderhoud': [
    { name: 'Onboarding', description: 'Website overnemen', status: 'pending', order: 1, estimatedDuration: 2, deliverables: [], tasks: [] },
    { name: 'Monitoring Setup', description: 'Monitoring configureren', status: 'pending', order: 2, estimatedDuration: 1, deliverables: [], tasks: [] },
    { name: 'Ongoing', description: 'Doorlopend onderhoud', status: 'pending', order: 3, estimatedDuration: 0, deliverables: [], tasks: [] },
  ],
  'chatbot': [
    { name: 'Design', description: 'Chatbot personality en flows', status: 'pending', order: 1, estimatedDuration: 3, deliverables: [], tasks: [] },
    { name: 'Knowledge Base', description: 'Content opbouwen', status: 'pending', order: 2, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Development', description: 'Chatbot implementatie', status: 'pending', order: 3, estimatedDuration: 7, deliverables: [], tasks: [] },
    { name: 'Training', description: 'Bot trainen en testen', status: 'pending', order: 4, estimatedDuration: 5, deliverables: [], tasks: [] },
    { name: 'Deployment', description: 'Live zetten', status: 'pending', order: 5, estimatedDuration: 1, deliverables: [], tasks: [] },
  ],
};

// ============================================
// PROJECT STORAGE
// ============================================

class ProjectStorage {
  private projects: Map<string, Project> = new Map();

  save(project: Project): void {
    this.projects.set(project.id, project);
  }

  get(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getAll(): Project[] {
    return Array.from(this.projects.values());
  }

  getByClient(clientId: string): Project[] {
    return this.getAll().filter(p => p.clientId === clientId);
  }

  getByAgent(agentId: string): Project[] {
    return this.getAll().filter(p => p.agentId === agentId);
  }

  getByStatus(status: ProjectStatus): Project[] {
    return this.getAll().filter(p => p.status === status);
  }

  delete(id: string): boolean {
    return this.projects.delete(id);
  }

  getStats(): {
    total: number;
    byStatus: Record<ProjectStatus, number>;
    byType: Record<string, number>;
  } {
    const projects = this.getAll();
    const stats = {
      total: projects.length,
      byStatus: {} as Record<ProjectStatus, number>,
      byType: {} as Record<string, number>,
    };

    for (const project of projects) {
      stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1;
      stats.byType[project.type] = (stats.byType[project.type] || 0) + 1;
    }

    return stats;
  }
}

const globalProjectStorage = new ProjectStorage();

// ============================================
// PROJECT MANAGER CLASS
// ============================================

export class ProjectManager {
  private logger: AgentLogger;
  private agentId: string;

  constructor(logger: AgentLogger, agentId: string) {
    this.logger = logger;
    this.agentId = agentId;
  }

  // ============================================
  // PROJECT CRUD
  // ============================================

  async createProject(specs: ProjectSpecs): Promise<Project> {
    const startTime = Date.now();
    const projectId = this.generateProjectId();

    // Get phase template for this project type
    const phaseTemplates = PHASE_TEMPLATES[specs.type] || [];
    const phases: ProjectPhase[] = phaseTemplates.map((template, index) => ({
      ...template,
      id: `phase_${index + 1}`,
    }));

    // Calculate timeline
    const totalDays = phases.reduce((sum, p) => sum + p.estimatedDuration, 0);
    const startDate = new Date();
    const estimatedEndDate = new Date(startDate);
    estimatedEndDate.setDate(estimatedEndDate.getDate() + totalDays);

    const project: Project = {
      id: projectId,
      clientId: specs.clientId,
      agentId: this.agentId,
      name: specs.name,
      type: specs.type,
      status: 'intake',
      description: specs.description,
      phases,
      timeline: {
        startDate,
        estimatedEndDate: specs.deadline || estimatedEndDate,
        milestones: this.generateMilestones(phases, startDate),
      },
      budget: {
        estimated: specs.budget || 0,
        actual: 0,
        currency: 'EUR',
        breakdown: [],
      },
      documents: [],
      metadata: specs.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    globalProjectStorage.save(project);

    const duration = Date.now() - startTime;
    this.logger.projectCreated(projectId, specs.name, {
      type: specs.type,
      phases: phases.length,
      estimatedDays: totalDays,
    });
    this.logger.performance('project-creation', duration);

    return project;
  }

  async getProject(projectId: string): Promise<Project | null> {
    const project = globalProjectStorage.get(projectId);
    return project || null;
  }

  async updateProject(projectId: string, updates: ProjectUpdate): Promise<Project | null> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return null;
    }

    const updated: Project = {
      ...project,
      ...updates,
      status: updates.status || project.status,
      updatedAt: new Date(),
      metadata: { ...project.metadata, ...updates.metadata },
    };

    globalProjectStorage.save(updated);
    this.logger.projectUpdated(projectId, updates);

    return updated;
  }

  async archiveProject(projectId: string): Promise<boolean> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return false;
    }

    project.status = 'completed';
    project.completedAt = new Date();
    project.updatedAt = new Date();
    globalProjectStorage.save(project);

    this.logger.projectCompleted(projectId, Date.now() - project.createdAt.getTime());
    return true;
  }

  // ============================================
  // PHASE MANAGEMENT
  // ============================================

  async startPhase(projectId: string, phaseId: string): Promise<boolean> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return false;
    }

    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) {
      return false;
    }

    // Complete previous phases if any
    for (const p of project.phases) {
      if (p.order < phase.order && p.status !== 'completed') {
        p.status = 'completed';
        p.completedAt = new Date();
      }
    }

    phase.status = 'in-progress';
    phase.startedAt = new Date();

    // Update project status
    project.status = this.getProjectStatusFromPhase(phase.name);
    project.updatedAt = new Date();

    globalProjectStorage.save(project);
    this.logger.phaseStarted(projectId, phase.name);

    return true;
  }

  async completePhase(
    projectId: string,
    phaseId: string,
    deliverables: Deliverable[] = []
  ): Promise<boolean> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return false;
    }

    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) {
      return false;
    }

    const startTime = phase.startedAt?.getTime() || Date.now();
    phase.status = 'completed';
    phase.completedAt = new Date();
    phase.deliverables = deliverables;

    // Mark all tasks as completed
    for (const task of phase.tasks) {
      if (task.status !== 'completed') {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    }

    // Check if all phases are completed
    const allCompleted = project.phases.every(p => p.status === 'completed');
    if (allCompleted) {
      project.status = 'completed';
      project.completedAt = new Date();
    }

    project.updatedAt = new Date();
    globalProjectStorage.save(project);

    const duration = Date.now() - startTime;
    this.logger.phaseCompleted(projectId, phase.name, duration);

    return true;
  }

  // ============================================
  // TASK MANAGEMENT
  // ============================================

  async updateTask(
    projectId: string,
    phaseId: string,
    taskId: string,
    updates: Partial<Task>
  ): Promise<boolean> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return false;
    }

    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) {
      return false;
    }

    const taskIndex = phase.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return false;
    }

    phase.tasks[taskIndex] = { ...phase.tasks[taskIndex], ...updates };

    if (updates.status === 'completed') {
      phase.tasks[taskIndex].completedAt = new Date();
    }

    project.updatedAt = new Date();
    globalProjectStorage.save(project);

    return true;
  }

  async addTask(projectId: string, phaseId: string, task: Omit<Task, 'id'>): Promise<Task | null> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return null;
    }

    const phase = project.phases.find(p => p.id === phaseId);
    if (!phase) {
      return null;
    }

    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    phase.tasks.push(newTask);
    project.updatedAt = new Date();
    globalProjectStorage.save(project);

    return newTask;
  }

  // ============================================
  // PROGRESS & MONITORING
  // ============================================

  async getProgress(projectId: string): Promise<ProgressReport> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const totalPhases = project.phases.length;
    const completedPhases = project.phases.filter(p => p.status === 'completed').length;
    const currentPhase = project.phases.find(p => p.status === 'in-progress');

    const totalTasks = project.phases.reduce((sum, p) => sum + p.tasks.length, 0);
    const completedTasks = project.phases.reduce(
      (sum, p) => sum + p.tasks.filter(t => t.status === 'completed').length,
      0
    );

    const phaseProgress = (completedPhases / totalPhases) * 100;
    const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const overallProgress = (phaseProgress + taskProgress) / 2;

    // Calculate if on track
    const now = new Date();
    const expectedProgress = this.calculateExpectedProgress(project, now);
    const isOnTrack = overallProgress >= expectedProgress - 10;

    return {
      projectId,
      projectName: project.name,
      status: project.status,
      overallProgress: Math.round(overallProgress),
      phaseProgress: Math.round(phaseProgress),
      taskProgress: Math.round(taskProgress),
      currentPhase: currentPhase?.name || 'Geen actieve fase',
      completedPhases,
      totalPhases,
      completedTasks,
      totalTasks,
      isOnTrack,
      daysRemaining: this.calculateDaysRemaining(project),
      estimatedCompletion: project.timeline.estimatedEndDate,
    };
  }

  async getHealth(projectId: string): Promise<HealthReport> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for overdue tasks
    const now = new Date();
    for (const phase of project.phases) {
      for (const task of phase.tasks) {
        if (task.dueDate && task.status !== 'completed' && task.dueDate < now) {
          issues.push(`Overdue task: ${task.title}`);
        }
      }
    }

    // Check for blocked items
    const blockedTasks = project.phases.flatMap(p => p.tasks).filter(t => t.status === 'blocked');
    for (const task of blockedTasks) {
      warnings.push(`Blocked task: ${task.title}`);
    }

    // Check timeline
    const progress = await this.getProgress(projectId);
    if (!progress.isOnTrack) {
      warnings.push('Project is behind schedule');
    }

    // Check budget
    if (project.budget.actual > project.budget.estimated * 0.9) {
      warnings.push('Budget is 90% consumed');
    }

    const status: 'healthy' | 'warning' | 'critical' = 
      issues.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'healthy';

    return {
      projectId,
      status,
      issues,
      warnings,
      lastUpdated: project.updatedAt,
      metrics: {
        progress: progress.overallProgress,
        tasksCompleted: progress.completedTasks,
        tasksTotal: progress.totalTasks,
        daysRemaining: progress.daysRemaining,
      },
    };
  }

  // ============================================
  // TIMELINE & PREDICTIONS
  // ============================================

  async estimateCompletion(projectId: string): Promise<Date> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const progress = await this.getProgress(projectId);
    
    if (progress.overallProgress >= 100) {
      return project.completedAt || new Date();
    }

    // Calculate based on current velocity
    const elapsed = Date.now() - project.createdAt.getTime();
    const elapsedDays = elapsed / (1000 * 60 * 60 * 24);
    const velocityPerDay = progress.overallProgress / Math.max(1, elapsedDays);
    const remainingProgress = 100 - progress.overallProgress;
    const estimatedDaysRemaining = remainingProgress / Math.max(0.1, velocityPerDay);

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + Math.ceil(estimatedDaysRemaining));

    return estimatedDate;
  }

  async detectDelays(projectId: string): Promise<Delay[]> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return [];
    }

    const delays: Delay[] = [];
    const now = new Date();

    for (const phase of project.phases) {
      // Check if phase is overdue
      if (phase.status === 'in-progress' && phase.startedAt) {
        const expectedEnd = new Date(phase.startedAt);
        expectedEnd.setDate(expectedEnd.getDate() + phase.estimatedDuration);

        if (now > expectedEnd) {
          const delayDays = Math.ceil((now.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60 * 24));
          delays.push({
            type: 'phase-delay',
            phase: phase.name,
            expectedDate: expectedEnd,
            actualDate: now,
            delayDays,
            impact: 'Vertraging in projectoplevering',
          });
        }
      }
    }

    return delays;
  }

  // ============================================
  // DOCUMENTS
  // ============================================

  async addDocument(
    projectId: string,
    document: Omit<Project['documents'][0], 'id' | 'createdAt' | 'version'>
  ): Promise<boolean> {
    const project = globalProjectStorage.get(projectId);
    if (!project) {
      return false;
    }

    const existingDoc = project.documents.find(d => d.name === document.name);
    const version = existingDoc ? existingDoc.version + 1 : 1;

    project.documents.push({
      ...document,
      id: `doc_${Date.now()}`,
      createdAt: new Date(),
      version,
    });

    project.updatedAt = new Date();
    globalProjectStorage.save(project);

    return true;
  }

  // ============================================
  // QUERIES
  // ============================================

  async getActiveProjects(): Promise<Project[]> {
    return globalProjectStorage.getAll().filter(p =>
      !['completed', 'cancelled'].includes(p.status)
    );
  }

  async getProjectsByAgent(agentId: string): Promise<Project[]> {
    return globalProjectStorage.getByAgent(agentId);
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    return globalProjectStorage.getByClient(clientId);
  }

  async getProjectStats(): Promise<ReturnType<ProjectStorage['getStats']>> {
    return globalProjectStorage.getStats();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateProjectId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMilestones(phases: ProjectPhase[], startDate: Date): Milestone[] {
    const milestones: Milestone[] = [];
    let currentDate = new Date(startDate);

    for (const phase of phases) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + phase.estimatedDuration);

      milestones.push({
        id: `milestone_${phase.id}`,
        name: `${phase.name} voltooid`,
        date: new Date(currentDate),
        completed: false,
      });
    }

    return milestones;
  }

  private getProjectStatusFromPhase(phaseName: string): ProjectStatus {
    const phaseMap: Record<string, ProjectStatus> = {
      'intake': 'intake',
      'discovery': 'planning',
      'planning': 'planning',
      'design': 'design',
      'development': 'development',
      'sprint': 'development',
      'testing': 'testing',
      'qa': 'testing',
      'review': 'review',
      'launch': 'deployment',
      'deployment': 'deployment',
    };

    const lowerPhase = phaseName.toLowerCase();
    for (const [key, status] of Object.entries(phaseMap)) {
      if (lowerPhase.includes(key)) {
        return status;
      }
    }

    return 'development';
  }

  private calculateExpectedProgress(project: Project, now: Date): number {
    const totalDuration = project.timeline.estimatedEndDate.getTime() - project.timeline.startDate.getTime();
    const elapsed = now.getTime() - project.timeline.startDate.getTime();
    return Math.min(100, (elapsed / totalDuration) * 100);
  }

  private calculateDaysRemaining(project: Project): number {
    const now = new Date();
    const diff = project.timeline.estimatedEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

// ============================================
// TYPES
// ============================================

export interface ProgressReport {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  overallProgress: number;
  phaseProgress: number;
  taskProgress: number;
  currentPhase: string;
  completedPhases: number;
  totalPhases: number;
  completedTasks: number;
  totalTasks: number;
  isOnTrack: boolean;
  daysRemaining: number;
  estimatedCompletion: Date;
}

export interface HealthReport {
  projectId: string;
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  warnings: string[];
  lastUpdated: Date;
  metrics: {
    progress: number;
    tasksCompleted: number;
    tasksTotal: number;
    daysRemaining: number;
  };
}

export interface Delay {
  type: 'phase-delay' | 'task-delay' | 'dependency-delay';
  phase?: string;
  task?: string;
  expectedDate: Date;
  actualDate: Date;
  delayDays: number;
  impact: string;
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createProjectManager(logger: AgentLogger, agentId: string): ProjectManager {
  return new ProjectManager(logger, agentId);
}

// ============================================
// GLOBAL ACCESS
// ============================================

export function getGlobalProjectStorage(): ProjectStorage {
  return globalProjectStorage;
}
