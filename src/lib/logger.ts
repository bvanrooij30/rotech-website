/**
 * Production-safe Logger
 * 
 * Suppresses logs in production unless explicitly enabled.
 * Uses structured logging format for easier parsing.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isLoggingEnabled = process.env.ENABLE_LOGGING === 'true';
const shouldLog = isDevelopment || isLoggingEnabled;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
}

function formatLog(entry: LogEntry): string {
  const { level, message, timestamp, context, data } = entry;
  const prefix = context ? `[${context}]` : '';
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${dataStr}`;
}

function createLogEntry(
  level: LogLevel, 
  message: string, 
  context?: string, 
  data?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    data,
  };
}

export const logger = {
  debug(message: string, context?: string, data?: Record<string, unknown>) {
    if (!shouldLog) return;
    const entry = createLogEntry('debug', message, context, data);
    console.debug(formatLog(entry));
  },

  info(message: string, context?: string, data?: Record<string, unknown>) {
    if (!shouldLog) return;
    const entry = createLogEntry('info', message, context, data);
    console.info(formatLog(entry));
  },

  warn(message: string, context?: string, data?: Record<string, unknown>) {
    // Warnings are always logged
    const entry = createLogEntry('warn', message, context, data);
    console.warn(formatLog(entry));
  },

  error(message: string, context?: string, error?: unknown) {
    // Errors are always logged
    const entry = createLogEntry('error', message, context);
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message, stack: error.stack }
      : { raw: String(error) };
    
    console.error(formatLog(entry), errorDetails);
    
    // In production, you could send to error tracking service here
    // if (!isDevelopment) { sendToSentry(entry, errorDetails); }
  },

  // API access logging - only in development or when enabled
  api(action: string, details?: Record<string, unknown>) {
    if (!shouldLog) return;
    const entry = createLogEntry('info', action, 'API', details);
    console.log(formatLog(entry));
  },
};

export default logger;
