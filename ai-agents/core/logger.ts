/**
 * RoTech AI Agents - Logger System
 * Uitgebreid logging systeem voor alle agents
 */

import { LogLevel, LogEntry, LogFilter, AgentType } from './types';

// ============================================
// LOGGER CONFIGURATION
// ============================================

interface LoggerConfig {
  level: LogLevel;
  prefix: string;
  agentId: string;
  agentType: AgentType;
  enableConsole: boolean;
  enablePersistence: boolean;
  maxEntries: number;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  critical: '\x1b[35m', // Magenta
};

const RESET_COLOR = '\x1b[0m';

// ============================================
// IN-MEMORY LOG STORAGE
// ============================================

class LogStorage {
  private logs: LogEntry[] = [];
  private maxEntries: number;
  private subscribers: Map<string, (log: LogEntry) => void> = new Map();

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  add(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Trim if necessary
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(-this.maxEntries);
    }

    // Notify subscribers
    this.subscribers.forEach((callback) => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Log subscriber error:', error);
      }
    });
  }

  query(filter: LogFilter): LogEntry[] {
    let results = [...this.logs];

    if (filter.agentId) {
      results = results.filter(log => log.agentId === filter.agentId);
    }

    if (filter.projectId) {
      results = results.filter(log => log.projectId === filter.projectId);
    }

    if (filter.level) {
      const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
      results = results.filter(log => levels.includes(log.level));
    }

    if (filter.startDate) {
      results = results.filter(log => log.timestamp >= filter.startDate!);
    }

    if (filter.endDate) {
      results = results.filter(log => log.timestamp <= filter.endDate!);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      results = results.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.data).toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    results = results.slice(offset, offset + limit);

    return results;
  }

  subscribe(id: string, callback: (log: LogEntry) => void): () => void {
    this.subscribers.set(id, callback);
    return () => this.subscribers.delete(id);
  }

  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byAgent: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<LogLevel, number>,
      byAgent: {} as Record<string, number>,
    };

    for (const log of this.logs) {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byAgent[log.agentId] = (stats.byAgent[log.agentId] || 0) + 1;
    }

    return stats;
  }

  clear(): void {
    this.logs = [];
  }

  export(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV format
    const headers = ['timestamp', 'level', 'agentId', 'projectId', 'message', 'data'];
    const rows = this.logs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.agentId,
      log.projectId || '',
      `"${log.message.replace(/"/g, '""')}"`,
      JSON.stringify(log.data || {}).replace(/"/g, '""'),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// Global log storage instance
const globalLogStorage = new LogStorage();

// ============================================
// AGENT LOGGER CLASS
// ============================================

export class AgentLogger {
  private config: LoggerConfig;
  private contextData: Record<string, unknown> = {};

  constructor(config: Partial<LoggerConfig> & { agentId: string; agentType: AgentType }) {
    this.config = {
      level: 'info',
      prefix: '',
      enableConsole: true,
      enablePersistence: true,
      maxEntries: 10000,
      ...config,
    };
  }

  // ============================================
  // CONTEXT MANAGEMENT
  // ============================================

  setContext(data: Record<string, unknown>): void {
    this.contextData = { ...this.contextData, ...data };
  }

  clearContext(): void {
    this.contextData = {};
  }

  withProject(projectId: string): AgentLogger {
    const childLogger = new AgentLogger(this.config);
    childLogger.setContext({ ...this.contextData, projectId });
    return childLogger;
  }

  // ============================================
  // LOG METHODS
  // ============================================

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('error', message, {
      ...data,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
    });
  }

  critical(message: string, error?: Error, data?: Record<string, unknown>): void {
    this.log('critical', message, {
      ...data,
      errorName: error?.name,
      errorMessage: error?.message,
      stack: error?.stack,
    });
  }

  // ============================================
  // SPECIALIZED LOG METHODS
  // ============================================

  projectCreated(projectId: string, projectName: string, data?: Record<string, unknown>): void {
    this.info(`Project created: ${projectName}`, {
      projectId,
      projectName,
      event: 'project:created',
      ...data,
    });
  }

  projectUpdated(projectId: string, changes: Record<string, unknown>): void {
    this.info(`Project updated`, {
      projectId,
      changes,
      event: 'project:updated',
    });
  }

  projectCompleted(projectId: string, duration: number): void {
    this.info(`Project completed`, {
      projectId,
      durationMs: duration,
      event: 'project:completed',
    });
  }

  phaseStarted(projectId: string, phaseName: string): void {
    this.info(`Phase started: ${phaseName}`, {
      projectId,
      phaseName,
      event: 'phase:started',
    });
  }

  phaseCompleted(projectId: string, phaseName: string, duration: number): void {
    this.info(`Phase completed: ${phaseName}`, {
      projectId,
      phaseName,
      durationMs: duration,
      event: 'phase:completed',
    });
  }

  promptGenerated(promptId: string, category: string, quality: number): void {
    this.info(`Prompt generated`, {
      promptId,
      category,
      quality,
      event: 'prompt:generated',
    });
  }

  reportGenerated(reportId: string, type: string, size: number): void {
    this.info(`Report generated`, {
      reportId,
      type,
      sizeBytes: size,
      event: 'report:generated',
    });
  }

  apiCall(method: string, endpoint: string, status: number, duration: number): void {
    this.debug(`API call: ${method} ${endpoint}`, {
      method,
      endpoint,
      status,
      durationMs: duration,
      event: 'api:call',
    });
  }

  performance(operation: string, duration: number, metadata?: Record<string, unknown>): void {
    this.debug(`Performance: ${operation}`, {
      operation,
      durationMs: duration,
      ...metadata,
      event: 'performance',
    });
  }

  // ============================================
  // CORE LOG METHOD
  // ============================================

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    // Check if we should log this level
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      agentId: this.config.agentId,
      agentType: this.config.agentType,
      projectId: this.contextData.projectId as string | undefined,
      message: this.config.prefix ? `[${this.config.prefix}] ${message}` : message,
      data: { ...this.contextData, ...data },
      tags: data?.tags as string[] | undefined,
    };

    // Console output
    if (this.config.enableConsole) {
      this.writeToConsole(entry);
    }

    // Persist to storage
    if (this.config.enablePersistence) {
      globalLogStorage.add(entry);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const color = LOG_LEVEL_COLORS[entry.level];
    const levelStr = entry.level.toUpperCase().padEnd(8);
    const agentStr = `[${entry.agentId}]`;
    const projectStr = entry.projectId ? `[${entry.projectId}]` : '';

    const prefix = `${color}${timestamp} ${levelStr}${RESET_COLOR} ${agentStr}${projectStr}`;
    const message = entry.message;

    if (entry.level === 'error' || entry.level === 'critical') {
      console.error(`${prefix} ${message}`);
      if (entry.data?.stack) {
        console.error(entry.data.stack);
      }
    } else if (entry.level === 'warn') {
      console.warn(`${prefix} ${message}`);
    } else {
      console.log(`${prefix} ${message}`);
    }

    if (entry.data && Object.keys(entry.data).length > 0) {
      const dataWithoutStack = { ...entry.data };
      delete dataWithoutStack.stack;
      if (Object.keys(dataWithoutStack).length > 0) {
        console.log('  Data:', JSON.stringify(dataWithoutStack, null, 2));
      }
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  getLogs(filter?: Partial<LogFilter>): LogEntry[] {
    return globalLogStorage.query({
      agentId: this.config.agentId,
      ...filter,
    });
  }

  getProjectLogs(projectId: string, filter?: Partial<LogFilter>): LogEntry[] {
    return globalLogStorage.query({
      agentId: this.config.agentId,
      projectId,
      ...filter,
    });
  }

  getRecentErrors(limit: number = 10): LogEntry[] {
    return globalLogStorage.query({
      agentId: this.config.agentId,
      level: ['error', 'critical'],
      limit,
    });
  }

  // ============================================
  // SUBSCRIPTION
  // ============================================

  subscribe(callback: (log: LogEntry) => void): () => void {
    const subscriberId = `${this.config.agentId}_${Date.now()}`;
    return globalLogStorage.subscribe(subscriberId, (log) => {
      if (log.agentId === this.config.agentId) {
        callback(log);
      }
    });
  }

  // ============================================
  // EXPORT
  // ============================================

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs({ limit: 100000 });
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = ['timestamp', 'level', 'agentId', 'projectId', 'message', 'data'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.agentId,
      log.projectId || '',
      `"${log.message.replace(/"/g, '""')}"`,
      JSON.stringify(log.data || {}).replace(/"/g, '""'),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// ============================================
// GLOBAL LOGGER ACCESS
// ============================================

export function getGlobalLogStorage(): LogStorage {
  return globalLogStorage;
}

export function queryAllLogs(filter: LogFilter): LogEntry[] {
  return globalLogStorage.query(filter);
}

export function subscribeToAllLogs(callback: (log: LogEntry) => void): () => void {
  const id = `global_${Date.now()}`;
  return globalLogStorage.subscribe(id, callback);
}

export function getLogStats(): ReturnType<LogStorage['getStats']> {
  return globalLogStorage.getStats();
}

export function exportAllLogs(format: 'json' | 'csv' = 'json'): string {
  return globalLogStorage.export(format);
}

export function clearAllLogs(): void {
  globalLogStorage.clear();
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createLogger(
  agentId: string,
  agentType: AgentType,
  options?: Partial<LoggerConfig>
): AgentLogger {
  return new AgentLogger({
    agentId,
    agentType,
    ...options,
  });
}
