/**
 * @fileoverview Client-side logger wrapper for browser console output.
 */

import 'client-only';

import { deepScrub, scrubString } from './pii-scrubber';
import type { LogContext, Logger, LogLevel, LogMethod } from './types';

const isProduction = process.env.NODE_ENV === 'production';

// Default to quieter logs in production to reduce noise.
const LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const LOG_LEVEL_FALLBACK: LogLevel = isProduction ? 'warn' : 'debug';
const resolveLogLevel = (candidate: string | undefined): LogLevel => {
  if (!candidate) {
    return LOG_LEVEL_FALLBACK;
  }

  const normalized = candidate.toLowerCase();
  return LEVELS.includes(normalized as LogLevel)
    ? (normalized as LogLevel)
    : LOG_LEVEL_FALLBACK;
};
const logLevel = resolveLogLevel(process.env.NEXT_PUBLIC_LOG_LEVEL);

const shouldLog = (level: LogLevel): boolean =>
  LEVELS.indexOf(level) >= LEVELS.indexOf(logLevel);

const toConsoleMethod = (level: LogLevel): ((...args: unknown[]) => void) => {
  switch (level) {
    case 'trace':
    case 'debug':
      return console.debug;
    case 'info':
      return console.info;
    case 'warn':
      return console.warn;
    case 'error':
    case 'fatal':
      return console.error;
    default:
      return console.log;
  }
};

const normalizeArgs = (
  args: unknown[]
): { context: LogContext; message: string; extra: unknown[] } => {
  const [first, ...rest] = args;

  if (typeof first === 'string') {
    return {
      context: {},
      message: first,
      extra: rest,
    };
  }

  if (first instanceof Error) {
    if (typeof rest[0] === 'string') {
      return {
        context: {},
        message: rest[0],
        extra: [first, ...rest.slice(1)],
      };
    }

    return {
      context: {},
      message: first.message,
      extra: [first, ...rest],
    };
  }

  if (first && typeof first === 'object') {
    if (typeof rest[0] === 'string') {
      return {
        context: first as LogContext,
        message: rest[0],
        extra: rest.slice(1),
      };
    }

    return {
      context: first as LogContext,
      message: '',
      extra: rest,
    };
  }

  return {
    context: {},
    message: '',
    extra: rest,
  };
};

const buildEntry = (
  level: LogLevel,
  context: LogContext,
  message: string
): Record<string, unknown> => ({
  timestamp: new Date().toISOString(),
  level: level.toUpperCase(),
  message,
  ...context,
});

const formatDevMessage = (
  level: LogLevel,
  context: LogContext,
  message: string
): string => {
  const correlationId = context.correlationId;
  const correlationLabel = correlationId ? ` [${correlationId}]` : '';
  return `[${level.toUpperCase()}] ${new Date().toISOString()}${correlationLabel} ${message}`;
};

const scrubExtraArg = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return scrubString(value);
  }

  if (value instanceof Error) {
    const scrubbedError = new Error(scrubString(value.message));
    scrubbedError.name = value.name;
    if (value.stack) {
      scrubbedError.stack = scrubString(value.stack);
    }
    return scrubbedError;
  }

  return deepScrub(value);
};

const createLogMethod = (
  level: LogLevel,
  baseContext: LogContext
): LogMethod => {
  const consoleFn = toConsoleMethod(level);

  return (...args: unknown[]): void => {
    if (!shouldLog(level)) {
      return;
    }

    const { context, message, extra } = normalizeArgs(args);
    const mergedContext = { ...baseContext, ...context };
    const scrubbedMessage = scrubString(message);
    const scrubbedContext = deepScrub(mergedContext);
    const scrubbedExtra = extra.map(scrubExtraArg);

    if (isProduction) {
      const entry = buildEntry(level, scrubbedContext, scrubbedMessage);
      consoleFn(JSON.stringify(entry), ...scrubbedExtra);
      return;
    }

    // Development: human-readable line plus structured context.
    const devMessage = formatDevMessage(level, scrubbedContext, scrubbedMessage);
    consoleFn(devMessage, scrubbedContext, ...scrubbedExtra);
  };
};

const createLogger = (baseContext: LogContext = {}): Logger => ({
  trace: createLogMethod('trace', baseContext),
  debug: createLogMethod('debug', baseContext),
  info: createLogMethod('info', baseContext),
  warn: createLogMethod('warn', baseContext),
  error: createLogMethod('error', baseContext),
  fatal: createLogMethod('fatal', baseContext),
  child(bindings: LogContext): Logger {
    return createLogger({ ...baseContext, ...bindings });
  },
  level: logLevel,
});

export const clientLogger = createLogger();
