/**
 * @fileoverview Type definitions for structured logging in the webapp.
 */

// Keep in sync with Pino levels.
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  // Correlation ID for distributed tracing.
  correlationId?: string;
  // Logical component/module emitting the log.
  module?: string;
  // Action or operation name (e.g. fetch, submit).
  action?: string;
  [key: string]: unknown;
}

export interface RequestLogContext extends LogContext {
  // Request metadata for network/event logs.
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
}

export interface LogMethod {
  // Pino-style method overloads.
  (obj: LogContext, msg?: string, ...args: unknown[]): void;
  (msg: string, ...args: unknown[]): void;
}

export interface Logger {
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
  child(bindings: LogContext): Logger;
  level?: LogLevel;
}
