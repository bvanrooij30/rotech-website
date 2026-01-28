/**
 * RoTech AI Agents - Error Handler
 * Uitgebreid error handling systeem met recovery en troubleshooting
 */

import {
  ErrorCategory,
  ErrorContext,
  DiagnosisReport,
  FixSuggestion,
  RecoveryResult,
  LogLevel,
} from './types';
import { AgentLogger } from './logger';

// ============================================
// ERROR PATTERNS DATABASE
// ============================================

interface ErrorPattern {
  pattern: RegExp | string;
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedFixes: FixSuggestion[];
  autoRecoverable: boolean;
  recoveryAction?: () => Promise<RecoveryResult>;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Network errors
  {
    pattern: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET/i,
    category: 'network',
    severity: 'medium',
    autoRecoverable: true,
    suggestedFixes: [
      {
        id: 'net-1',
        description: 'Controleer netwerkverbinding',
        steps: ['Verifieer internetverbinding', 'Controleer firewall instellingen', 'Test met ping'],
        confidence: 0.9,
        automated: false,
      },
      {
        id: 'net-2',
        description: 'Wacht en probeer opnieuw',
        steps: ['Wacht 30 seconden', 'Probeer de operatie opnieuw'],
        confidence: 0.8,
        automated: true,
      },
    ],
  },
  // Rate limiting
  {
    pattern: /rate limit|too many requests|429/i,
    category: 'rate-limit',
    severity: 'low',
    autoRecoverable: true,
    suggestedFixes: [
      {
        id: 'rate-1',
        description: 'Wacht en probeer opnieuw met exponential backoff',
        steps: ['Wacht minimaal 60 seconden', 'Implementeer exponential backoff', 'Hervat operaties'],
        confidence: 0.95,
        automated: true,
      },
    ],
  },
  // Authentication errors
  {
    pattern: /unauthorized|authentication failed|invalid.*token|401/i,
    category: 'authentication',
    severity: 'high',
    autoRecoverable: false,
    suggestedFixes: [
      {
        id: 'auth-1',
        description: 'Vernieuw authenticatie tokens',
        steps: ['Controleer API keys', 'Genereer nieuwe tokens', 'Update environment variables'],
        confidence: 0.85,
        automated: false,
      },
    ],
  },
  // Authorization errors
  {
    pattern: /forbidden|permission denied|not authorized|403/i,
    category: 'authorization',
    severity: 'high',
    autoRecoverable: false,
    suggestedFixes: [
      {
        id: 'authz-1',
        description: 'Controleer gebruikersrechten',
        steps: ['Verifieer account permissions', 'Vraag toegang aan bij admin', 'Update role assignments'],
        confidence: 0.8,
        automated: false,
      },
    ],
  },
  // Database errors
  {
    pattern: /database|prisma|sql|query failed|unique constraint/i,
    category: 'database',
    severity: 'high',
    autoRecoverable: false,
    suggestedFixes: [
      {
        id: 'db-1',
        description: 'Controleer database verbinding',
        steps: ['Verifieer DATABASE_URL', 'Check database server status', 'Run prisma db push'],
        confidence: 0.7,
        automated: false,
      },
      {
        id: 'db-2',
        description: 'Los unique constraint violation op',
        steps: ['Identificeer duplicate data', 'Verwijder of update conflicterende records'],
        confidence: 0.6,
        automated: false,
      },
    ],
  },
  // Timeout errors
  {
    pattern: /timeout|timed out|deadline exceeded/i,
    category: 'timeout',
    severity: 'medium',
    autoRecoverable: true,
    suggestedFixes: [
      {
        id: 'timeout-1',
        description: 'Verhoog timeout en probeer opnieuw',
        steps: ['Verhoog timeout waarde', 'Probeer met kleinere batch size', 'Optimaliseer query'],
        confidence: 0.7,
        automated: true,
      },
    ],
  },
  // Validation errors
  {
    pattern: /validation|invalid.*input|required.*field|type.*error/i,
    category: 'validation',
    severity: 'low',
    autoRecoverable: false,
    suggestedFixes: [
      {
        id: 'val-1',
        description: 'Corrigeer input data',
        steps: ['Controleer verplichte velden', 'Valideer data types', 'Verwijder ongeldige karakters'],
        confidence: 0.9,
        automated: false,
      },
    ],
  },
  // External API errors
  {
    pattern: /api.*error|external.*service|third.?party/i,
    category: 'external-api',
    severity: 'medium',
    autoRecoverable: true,
    suggestedFixes: [
      {
        id: 'api-1',
        description: 'Controleer externe service status',
        steps: ['Check service status page', 'Wacht tot service hersteld is', 'Probeer opnieuw'],
        confidence: 0.75,
        automated: true,
      },
    ],
  },
  // Configuration errors
  {
    pattern: /config|environment|missing.*key|undefined.*variable/i,
    category: 'configuration',
    severity: 'high',
    autoRecoverable: false,
    suggestedFixes: [
      {
        id: 'config-1',
        description: 'Controleer environment configuratie',
        steps: ['Verifieer .env bestand', 'Check alle required variables', 'Herstart applicatie'],
        confidence: 0.85,
        automated: false,
      },
    ],
  },
];

// ============================================
// ERROR HANDLER CLASS
// ============================================

export class AgentErrorHandler {
  private logger: AgentLogger;
  private errorHistory: Map<string, { count: number; lastSeen: Date; solutions: string[] }> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();

  constructor(logger: AgentLogger) {
    this.logger = logger;
  }

  // ============================================
  // ERROR CATEGORIZATION
  // ============================================

  categorize(error: Error): ErrorCategory {
    const errorString = `${error.name} ${error.message} ${error.stack || ''}`;

    for (const pattern of ERROR_PATTERNS) {
      const regex = typeof pattern.pattern === 'string' 
        ? new RegExp(pattern.pattern, 'i')
        : pattern.pattern;

      if (regex.test(errorString)) {
        return pattern.category;
      }
    }

    return 'unknown';
  }

  // ============================================
  // DIAGNOSIS
  // ============================================

  async diagnose(error: Error, context?: ErrorContext): Promise<DiagnosisReport> {
    const category = this.categorize(error);
    const pattern = this.findMatchingPattern(error);
    const errorHash = this.hashError(error);

    // Check history for previous occurrences
    const history = this.errorHistory.get(errorHash);
    const previousSolutions = history?.solutions || [];

    const report: DiagnosisReport = {
      errorCategory: category,
      rootCause: this.identifyRootCause(error, category),
      affectedComponents: this.identifyAffectedComponents(error, context),
      suggestedFixes: this.getSuggestedFixes(error, pattern, previousSolutions),
      severity: pattern?.severity || 'medium',
      requiresHumanIntervention: !pattern?.autoRecoverable || category === 'unknown',
    };

    // Log diagnosis
    this.logger.info('Error diagnosed', {
      errorMessage: error.message,
      category,
      severity: report.severity,
      requiresHuman: report.requiresHumanIntervention,
    });

    return report;
  }

  private identifyRootCause(error: Error, category: ErrorCategory): string {
    const causes: Record<ErrorCategory, string> = {
      validation: 'Ongeldige input data ontvangen',
      authentication: 'Authenticatie gefaald - ongeldige of verlopen credentials',
      authorization: 'Onvoldoende rechten voor deze operatie',
      network: 'Netwerkverbinding probleem - service niet bereikbaar',
      database: 'Database operatie gefaald',
      'external-api': 'Externe API service retourneerde een fout',
      timeout: 'Operatie duurde te lang en is gestopt',
      'rate-limit': 'Te veel requests in korte tijd',
      configuration: 'Configuratie fout - ontbrekende of ongeldige settings',
      unknown: `Onbekende fout: ${error.message}`,
    };

    return causes[category];
  }

  private identifyAffectedComponents(error: Error, context?: ErrorContext): string[] {
    const components: string[] = [];

    if (context?.operation) {
      components.push(context.operation);
    }

    if (error.stack) {
      // Extract component names from stack trace
      const matches = error.stack.match(/at\s+([A-Z][a-zA-Z]+)\./g);
      if (matches) {
        const uniqueComponents = [...new Set(matches.map(m => m.replace(/at\s+|\./g, '')))];
        components.push(...uniqueComponents.slice(0, 5));
      }
    }

    return components;
  }

  private getSuggestedFixes(
    error: Error,
    pattern: ErrorPattern | undefined,
    previousSolutions: string[]
  ): FixSuggestion[] {
    const fixes: FixSuggestion[] = [];

    // Add pattern-based fixes
    if (pattern?.suggestedFixes) {
      fixes.push(...pattern.suggestedFixes);
    }

    // Add fixes based on previous successful solutions
    if (previousSolutions.length > 0) {
      fixes.push({
        id: 'history-1',
        description: 'Eerder succesvolle oplossing',
        steps: previousSolutions,
        confidence: 0.95,
        automated: false,
      });
    }

    // Add generic fixes if no specific ones found
    if (fixes.length === 0) {
      fixes.push({
        id: 'generic-1',
        description: 'Algemene troubleshooting',
        steps: [
          'Controleer de logs voor meer details',
          'Verifieer alle configuratie settings',
          'Herstart de service',
          'Neem contact op met support indien nodig',
        ],
        confidence: 0.3,
        automated: false,
      });
    }

    // Sort by confidence
    return fixes.sort((a, b) => b.confidence - a.confidence);
  }

  // ============================================
  // RECOVERY
  // ============================================

  async recover(error: Error, context: ErrorContext): Promise<RecoveryResult> {
    const pattern = this.findMatchingPattern(error);
    const errorHash = this.hashError(error);

    // Check recovery attempt count
    const attempts = this.recoveryAttempts.get(errorHash) || 0;
    const maxAttempts = 3;

    if (attempts >= maxAttempts) {
      this.logger.warn('Max recovery attempts reached', {
        errorMessage: error.message,
        attempts,
        maxAttempts,
      });

      return {
        success: false,
        action: 'escalate',
        message: `Maximum ${maxAttempts} recovery pogingen bereikt. Escalatie nodig.`,
      };
    }

    // Increment attempt counter
    this.recoveryAttempts.set(errorHash, attempts + 1);

    // Attempt auto-recovery if available
    if (pattern?.autoRecoverable && pattern.recoveryAction) {
      this.logger.info('Attempting auto-recovery', {
        errorMessage: error.message,
        attempt: attempts + 1,
      });

      try {
        const result = await pattern.recoveryAction();
        
        if (result.success) {
          this.recoveryAttempts.delete(errorHash);
          this.logger.info('Auto-recovery successful', { action: result.action });
        }

        return result;
      } catch (recoveryError) {
        this.logger.error('Auto-recovery failed', recoveryError as Error);
      }
    }

    // Standard recovery strategies based on category
    return this.executeStandardRecovery(error, context, pattern?.category || 'unknown');
  }

  private async executeStandardRecovery(
    error: Error,
    context: ErrorContext,
    category: ErrorCategory
  ): Promise<RecoveryResult> {
    switch (category) {
      case 'network':
      case 'timeout':
      case 'rate-limit':
        // Retry with exponential backoff
        return this.retryWithBackoff(context);

      case 'external-api':
        // Wait and retry
        await this.delay(5000);
        return {
          success: true,
          action: 'retry',
          message: 'Wacht 5 seconden en probeer opnieuw',
        };

      case 'database':
        // Try to reconnect
        return {
          success: false,
          action: 'reconnect',
          message: 'Database reconnect nodig - manual intervention required',
        };

      default:
        return {
          success: false,
          action: 'manual',
          message: 'Automatisch herstel niet mogelijk. Handmatige interventie nodig.',
        };
    }
  }

  private async retryWithBackoff(context: ErrorContext): Promise<RecoveryResult> {
    const errorHash = `${context.agentId}_${context.operation}`;
    const attempts = this.recoveryAttempts.get(errorHash) || 1;
    const backoffMs = Math.min(1000 * Math.pow(2, attempts), 30000);

    await this.delay(backoffMs);

    return {
      success: true,
      action: 'retry',
      message: `Retry na ${backoffMs}ms wachttijd`,
      data: { backoffMs, attempt: attempts },
    };
  }

  // ============================================
  // ESCALATION
  // ============================================

  shouldEscalate(error: Error, context?: ErrorContext): boolean {
    const category = this.categorize(error);
    const pattern = this.findMatchingPattern(error);

    // Always escalate critical errors
    if (pattern?.severity === 'critical') {
      return true;
    }

    // Escalate if not auto-recoverable
    if (!pattern?.autoRecoverable) {
      return true;
    }

    // Escalate auth/authz errors
    if (category === 'authentication' || category === 'authorization') {
      return true;
    }

    // Escalate after max recovery attempts
    const errorHash = this.hashError(error);
    const attempts = this.recoveryAttempts.get(errorHash) || 0;
    if (attempts >= 3) {
      return true;
    }

    return false;
  }

  async escalateToHuman(error: Error, context: ErrorContext): Promise<void> {
    const diagnosis = await this.diagnose(error, context);

    this.logger.critical('Error escalated to human operator', error, {
      context,
      diagnosis,
      escalationTime: new Date().toISOString(),
    });

    // TODO: Send notification to admin
    // await this.notificationService.sendAlert({
    //   type: 'critical',
    //   subject: `Agent Error Escalation: ${context.agentId}`,
    //   message: diagnosis.rootCause,
    //   data: { error, context, diagnosis },
    // });
  }

  // ============================================
  // LEARNING
  // ============================================

  recordErrorPattern(error: Error, solution: string): void {
    const errorHash = this.hashError(error);
    const existing = this.errorHistory.get(errorHash);

    if (existing) {
      existing.count++;
      existing.lastSeen = new Date();
      if (!existing.solutions.includes(solution)) {
        existing.solutions.push(solution);
      }
    } else {
      this.errorHistory.set(errorHash, {
        count: 1,
        lastSeen: new Date(),
        solutions: [solution],
      });
    }

    this.logger.info('Error pattern recorded', {
      errorHash,
      solution,
      totalOccurrences: this.errorHistory.get(errorHash)?.count,
    });
  }

  findPreviousSolution(error: Error): string | null {
    const errorHash = this.hashError(error);
    const history = this.errorHistory.get(errorHash);

    if (history && history.solutions.length > 0) {
      return history.solutions[history.solutions.length - 1];
    }

    return null;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private findMatchingPattern(error: Error): ErrorPattern | undefined {
    const errorString = `${error.name} ${error.message} ${error.stack || ''}`;

    for (const pattern of ERROR_PATTERNS) {
      const regex = typeof pattern.pattern === 'string'
        ? new RegExp(pattern.pattern, 'i')
        : pattern.pattern;

      if (regex.test(errorString)) {
        return pattern;
      }
    }

    return undefined;
  }

  private hashError(error: Error): string {
    // Create a simple hash from error message and first stack line
    const key = `${error.name}:${error.message}`.substring(0, 100);
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `err_${Math.abs(hash).toString(16)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================
  // STATISTICS
  // ============================================

  getErrorStats(): {
    totalPatterns: number;
    errorsByCategory: Record<ErrorCategory, number>;
    recentErrors: Array<{ hash: string; count: number; lastSeen: Date }>;
  } {
    const errorsByCategory: Partial<Record<ErrorCategory, number>> = {};
    const recentErrors: Array<{ hash: string; count: number; lastSeen: Date }> = [];

    this.errorHistory.forEach((value, key) => {
      recentErrors.push({ hash: key, ...value });
    });

    // Sort by most recent
    recentErrors.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

    return {
      totalPatterns: this.errorHistory.size,
      errorsByCategory: errorsByCategory as Record<ErrorCategory, number>,
      recentErrors: recentErrors.slice(0, 20),
    };
  }

  clearHistory(): void {
    this.errorHistory.clear();
    this.recoveryAttempts.clear();
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createErrorHandler(logger: AgentLogger): AgentErrorHandler {
  return new AgentErrorHandler(logger);
}

// ============================================
// RETRY UTILITY
// ============================================

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  exponential: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    exponential: true,
    ...options,
  };

  let lastError: Error = new Error('No attempts made');

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === opts.maxAttempts) {
        break;
      }

      opts.onRetry?.(attempt, lastError);

      const delay = opts.exponential
        ? Math.min(opts.baseDelay * Math.pow(2, attempt - 1), opts.maxDelay)
        : opts.baseDelay;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
