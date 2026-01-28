/**
 * RoTech AI Agents - Core Types
 * Gedeelde TypeScript types voor alle agents
 */

// ============================================
// AGENT TYPES
// ============================================

export type AgentType = 
  | 'intake'
  | 'starter-website'
  | 'business-website'
  | 'webshop'
  | 'maatwerk'
  | 'automatisering'
  | 'pwa'
  | 'api-integratie'
  | 'seo'
  | 'onderhoud'
  | 'chatbot';

export type AgentStatus = 'idle' | 'busy' | 'error' | 'maintenance' | 'offline';

export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  version: string;
  status: AgentStatus;
  lastActive: Date;
  activeProjects: number;
  metrics: AgentMetrics;
}

export interface AgentMetrics {
  projectsCompleted: number;
  avgResponseTime: number;
  errorRate: number;
  successRate: number;
  promptsGenerated: number;
  reportsGenerated: number;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 
  | 'intake'
  | 'planning'
  | 'design'
  | 'development'
  | 'review'
  | 'testing'
  | 'deployment'
  | 'completed'
  | 'on-hold'
  | 'cancelled';

export type ProjectType = 
  | 'starter-website'
  | 'business-website'
  | 'webshop'
  | 'maatwerk-webapp'
  | 'automatisering'
  | 'pwa'
  | 'api-integratie'
  | 'seo'
  | 'onderhoud'
  | 'chatbot';

export interface Project {
  id: string;
  clientId: string;
  agentId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  phases: ProjectPhase[];
  timeline: ProjectTimeline;
  budget: ProjectBudget;
  documents: ProjectDocument[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  order: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration: number; // in days
  deliverables: Deliverable[];
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  type: 'document' | 'code' | 'design' | 'report' | 'other';
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  url?: string;
  createdAt: Date;
}

export interface ProjectTimeline {
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  completed: boolean;
  description?: string;
}

export interface ProjectBudget {
  estimated: number;
  actual: number;
  currency: 'EUR';
  breakdown: BudgetItem[];
}

export interface BudgetItem {
  category: string;
  estimated: number;
  actual: number;
  description?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'proposal' | 'contract' | 'specification' | 'report' | 'invoice' | 'other';
  url: string;
  createdAt: Date;
  version: number;
}

export interface ProjectSpecs {
  clientId: string;
  name: string;
  type: ProjectType;
  description: string;
  requirements: string[];
  features: string[];
  budget?: number;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

export interface ProjectUpdate {
  status?: ProjectStatus;
  currentPhase?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// LOGGING TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  agentId: string;
  agentType: AgentType;
  projectId?: string;
  message: string;
  data?: Record<string, unknown>;
  stack?: string;
  tags?: string[];
}

export interface LogFilter {
  agentId?: string;
  projectId?: string;
  level?: LogLevel | LogLevel[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// ERROR TYPES
// ============================================

export type ErrorCategory = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'database'
  | 'external-api'
  | 'timeout'
  | 'rate-limit'
  | 'configuration'
  | 'unknown';

export interface ErrorContext {
  agentId: string;
  agentType: AgentType;
  projectId?: string;
  operation: string;
  input?: unknown;
  timestamp: Date;
  userId?: string;
}

export interface DiagnosisReport {
  errorCategory: ErrorCategory;
  rootCause: string;
  affectedComponents: string[];
  suggestedFixes: FixSuggestion[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  requiresHumanIntervention: boolean;
}

export interface FixSuggestion {
  id: string;
  description: string;
  steps: string[];
  confidence: number; // 0-1
  automated: boolean;
}

export interface RecoveryResult {
  success: boolean;
  action: string;
  message: string;
  data?: unknown;
}

// ============================================
// PROMPT TYPES
// ============================================

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  agentType: AgentType;
  basePrompt: string;
  variables: PromptVariable[];
  examples: PromptExample[];
  qualityScore: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PromptCategory = 
  | 'project-planning'
  | 'content-generation'
  | 'code-generation'
  | 'documentation'
  | 'communication'
  | 'analysis'
  | 'troubleshooting'
  | 'optimization';

export interface PromptVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  validation?: string; // regex pattern
}

export interface PromptExample {
  input: Record<string, unknown>;
  output: string;
  quality: number; // 1-10
}

export interface PromptContext {
  projectId?: string;
  projectType?: ProjectType;
  clientInfo?: ClientInfo;
  requirements?: string[];
  constraints?: string[];
  previousOutput?: string;
  additionalContext?: Record<string, unknown>;
}

export interface PromptQuality {
  score: number; // 1-10
  clarity: number;
  specificity: number;
  completeness: number;
  suggestions: string[];
}

export interface OptimizedPrompt {
  original: string;
  optimized: string;
  improvements: string[];
  qualityImprovement: number;
}

export interface PromptResult {
  promptId: string;
  success: boolean;
  output: string;
  quality: number;
  feedback?: string;
  timestamp: Date;
}

// ============================================
// PDF TYPES
// ============================================

export type ReportType = 
  | 'project-proposal'
  | 'project-progress'
  | 'project-completion'
  | 'seo-audit'
  | 'security-audit'
  | 'performance-report'
  | 'financial-report'
  | 'maintenance-report'
  | 'incident-report'
  | 'custom';

export interface PDFTemplate {
  id: string;
  name: string;
  category: 'report' | 'invoice' | 'proposal' | 'documentation' | 'contract';
  sections: PDFSection[];
  styling: PDFStyling;
  branding: BrandingOptions;
}

export interface PDFSection {
  id: string;
  title: string;
  type: 'text' | 'table' | 'chart' | 'image' | 'list' | 'code';
  content?: string;
  data?: unknown;
  order: number;
  conditional?: string; // condition for inclusion
}

export interface PDFStyling {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  margins: { top: number; right: number; bottom: number; left: number };
}

export interface BrandingOptions {
  logo?: string;
  companyName: string;
  tagline?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  footer?: string;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  date: Date;
  author: string;
  sections: ReportSection[];
  summary?: string;
  recommendations?: string[];
  attachments?: Attachment[];
}

export interface ReportSection {
  title: string;
  content: string | object;
  type: 'text' | 'table' | 'chart' | 'list' | 'metrics';
}

export interface Attachment {
  name: string;
  type: string;
  url: string;
}

// ============================================
// CLIENT TYPES
// ============================================

export interface ClientInfo {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: 'zzp' | 'small' | 'medium' | 'large';
  notes?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'critical';

export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'in-app' | 'sms';

export interface Notification {
  id: string;
  type: NotificationType;
  channel: NotificationChannel[];
  recipient: string;
  subject: string;
  message: string;
  data?: Record<string, unknown>;
  sentAt?: Date;
  read?: boolean;
}

// ============================================
// HEALTH & METRICS TYPES
// ============================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number; // in seconds
  lastCheck: Date;
  components: ComponentHealth[];
  issues?: string[];
}

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
}

export interface MetricsSummary {
  period: { start: Date; end: Date };
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    onHold: number;
  };
  performance: {
    avgResponseTime: number;
    errorRate: number;
    successRate: number;
  };
  prompts: {
    generated: number;
    avgQuality: number;
  };
  reports: {
    generated: number;
    downloaded: number;
  };
}

// ============================================
// REQUEST/RESPONSE TYPES
// ============================================

export interface AgentRequest {
  id: string;
  type: 'project' | 'prompt' | 'report' | 'analysis' | 'action';
  action: string;
  data: Record<string, unknown>;
  context?: PromptContext;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  timeout?: number; // in milliseconds
}

export interface AgentResponse {
  requestId: string;
  success: boolean;
  data?: unknown;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata: {
    processingTime: number;
    agentId: string;
    timestamp: Date;
  };
}

// ============================================
// API TYPES
// ============================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime: number;
  };
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// EVENT TYPES
// ============================================

export type AgentEvent = 
  | 'agent:started'
  | 'agent:stopped'
  | 'agent:error'
  | 'project:created'
  | 'project:updated'
  | 'project:completed'
  | 'phase:started'
  | 'phase:completed'
  | 'prompt:generated'
  | 'report:generated'
  | 'notification:sent';

export interface EventPayload {
  event: AgentEvent;
  agentId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

// ============================================
// CONFIGURATION TYPES
// ============================================

export interface AgentConfig {
  enabled: boolean;
  logLevel: LogLevel;
  maxConcurrentProjects: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  webhookUrl?: string;
  customSettings?: Record<string, unknown>;
}

export interface SystemConfig {
  environment: 'development' | 'staging' | 'production';
  agents: Record<AgentType, AgentConfig>;
  logging: {
    level: LogLevel;
    destination: 'console' | 'file' | 'database' | 'all';
    retentionDays: number;
  };
  notifications: {
    enabled: boolean;
    channels: NotificationChannel[];
    alertThresholds: {
      errorRate: number;
      responseTime: number;
    };
  };
  security: {
    rateLimit: number;
    ipWhitelist?: string[];
    requireAuth: boolean;
  };
}
