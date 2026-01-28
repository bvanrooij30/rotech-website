/**
 * RoTech AI Agents - Core Module
 * Central export point for all core functionality
 */

// Types
export * from './types';

// AI Provider - ECHTE AI CONNECTIE
export { AIProvider, createAIProvider, getGlobalAIProvider } from './ai-provider';

// Database - PERSISTENTIE
export { AgentDatabase, createAgentDatabase, getGlobalDatabase, prisma } from './database';

// Logger
export { AgentLogger, createLogger, getGlobalLogStorage, queryAllLogs, subscribeToAllLogs, getLogStats, exportAllLogs, clearAllLogs } from './logger';

// Error Handler
export { AgentErrorHandler, createErrorHandler, retry } from './error-handler';
export type { RetryOptions } from './error-handler';

// PDF Generator
export { PDFGenerator, createPDFGenerator } from './pdf-generator';
export type { PDFDocument } from './pdf-generator';

// Prompt Engine
export { PromptEngine, createPromptEngine } from './prompt-engine';

// Project Manager
export { ProjectManager, createProjectManager, getGlobalProjectStorage } from './project-manager';
export type { ProgressReport, HealthReport, Delay } from './project-manager';

// Base Agent
export { BaseAgent, agentRegistry, registerAgent, getAgent, getAllAgents } from './base-agent';
