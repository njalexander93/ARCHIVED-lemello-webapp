/**
 * @fileoverview Server-side structured logger for the webapp runtime.
 */

import 'server-only';

import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';

import { REDACT_PATHS, deepScrub, scrubString } from './pii-scrubber';
import type { LogContext, Logger, LogLevel } from './types';

const isProduction = process.env.NODE_ENV === 'production';

const LEVELS: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
const LOG_LEVEL_FALLBACK: LogLevel = isProduction ? 'info' : 'debug';
const resolveLogLevel = (candidate: string | undefined): LogLevel => {
  if (!candidate) {
    return LOG_LEVEL_FALLBACK;
  }

  const normalized = candidate.toLowerCase();
  return LEVELS.includes(normalized as LogLevel)
    ? (normalized as LogLevel)
    : LOG_LEVEL_FALLBACK;
};
const logLevel = resolveLogLevel(process.env.LOG_LEVEL);

// AsyncLocalStorage for safe per-request correlation ID isolation.
const correlationStorage = new AsyncLocalStorage<string>();

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

const scrubLogArgs = (inputArgs: unknown[]): unknown[] => {
  const [first, ...rest] = inputArgs;

  if (typeof first === 'string') {
    return [scrubString(first), ...rest.map(scrubExtraArg)];
  }

  if (first instanceof Error) {
    if (typeof rest[0] === 'string') {
      return [scrubExtraArg(first), scrubString(rest[0]), ...rest.slice(1).map(scrubExtraArg)];
    }

    return [scrubExtraArg(first), ...rest.map(scrubExtraArg)];
  }

  if (first && typeof first === 'object') {
    if (typeof rest[0] === 'string') {
      return [deepScrub(first), scrubString(rest[0]), ...rest.slice(1).map(scrubExtraArg)];
    }

    return [deepScrub(first), ...rest.map(scrubExtraArg)];
  }

  return inputArgs.map(scrubExtraArg);
};

const hooks = {
  logMethod(
    this: unknown,
    inputArgs: unknown[],
    method: (...args: unknown[]) => void
  ): void {
    method.apply(this, scrubLogArgs(inputArgs));
  },
};

const withScrubbedChild = (logger: Logger): Logger => {
  const target = logger as Logger & { child(bindings: LogContext): Logger };
  const originalChild = target.child.bind(target);

  target.child = (bindings: LogContext): Logger => {
    const scrubbedBindings = deepScrub(bindings);
    return withScrubbedChild(originalChild(scrubbedBindings as LogContext));
  };

  return target;
};

const createLogger = (): Logger => {
  if (!isProduction) {
    const logger = pino({
      level: logLevel,
      hooks,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
      redact: {
        paths: [...REDACT_PATHS],
        censor: '[REDACTED]',
      },
    }) as Logger;
    return withScrubbedChild(logger);
  }

  const logger = pino({
    level: logLevel,
    hooks,
    redact: {
      paths: [...REDACT_PATHS],
      censor: '[REDACTED]',
    },
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        hostname: bindings.hostname,
        env: process.env.NODE_ENV,
      }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }) as Logger;
  return withScrubbedChild(logger);
};

export const serverLogger = createLogger();

/**
 * Run a callback with a correlation ID bound to the current async context.
 *
 * @param correlationId - Correlation ID to bind to this execution context.
 * @param callback - Async function to execute within the correlation context.
 * @returns Promise resolving to the callback's return value.
 */
export async function withCorrelationId<T>(
  correlationId: string,
  callback: () => Promise<T>
): Promise<T> {
  return correlationStorage.run(correlationId, callback);
}

/**
 * Retrieve the current correlation ID for server logs.
 *
 * @returns The current correlation ID if set in the current async context.
 */
export function getCorrelationId(): string | undefined {
  return correlationStorage.getStore();
}
