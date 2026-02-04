/**
 * @fileoverview HTTP client wrapper with correlation ID propagation.
 */

import type { CorrelationId } from '@/lib/correlation';
import { CORRELATION_HEADER } from '@/lib/correlation';
import { scrubString } from '@/lib/logger/pii-scrubber';
import type { LogContext, Logger } from '@/lib/logger/types';

export interface FetchResult<T> {
  data: T | undefined;
  status: number;
  durationMs: number;
  correlationId?: CorrelationId;
}

export class HttpError extends Error {
  status: number;
  url: string;
  correlationId?: CorrelationId;

  constructor(
    message: string,
    status: number,
    url: string,
    correlationId?: CorrelationId
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.correlationId = correlationId;
  }
}

const noop = (): void => {};

const noopLogger: Logger = {
  trace: noop,
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
  fatal: noop,
  child(): Logger {
    return noopLogger;
  },
};

const DEFAULT_TIMEOUT_MS = 10000;
const resolveTimeoutMs = (candidate: number | undefined): number => {
  if (!Number.isFinite(candidate) || candidate === undefined || candidate <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  const normalized = Math.floor(candidate);
  return normalized > 0 ? normalized : DEFAULT_TIMEOUT_MS;
};
const timeoutFromEnv = resolveTimeoutMs(
  typeof process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS === 'string'
    ? Number(process.env.NEXT_PUBLIC_HTTP_TIMEOUT_MS)
    : undefined
);
const resolveUrl = (input: string, baseUrl?: string): string => {
  if (!baseUrl) {
    return input;
  }
  return new URL(input, baseUrl).toString();
};

const parsePayload = <T>(
  bodyText: string,
  contentType: string
): T | undefined => {
  if (bodyText.length === 0) {
    return undefined;
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(bodyText) as T;
  }

  return bodyText as unknown as T;
};

/**
 * Creates an HTTP client that injects correlation IDs and logs requests.
 *
 * @param getCorrelationId - Provider for correlation IDs.
 * @param logger - Logger implementation for request metadata.
 * @param baseUrl - Optional base URL for relative requests.
 * @param timeoutMs - Optional timeout in milliseconds (default from env or 10000ms).
 * @returns Fetch wrapper with structured logging.
 */
export function createHttpClient(
  getCorrelationId: () => CorrelationId | undefined,
  {
    logger = noopLogger,
    baseUrl,
    timeoutMs = timeoutFromEnv,
  }: {
    logger?: Logger;
    baseUrl?: string;
    timeoutMs?: number;
  } = {}
): <T>(
  input: string,
  init?: RequestInit
) => Promise<FetchResult<T>> {
  const resolvedTimeoutMs = resolveTimeoutMs(timeoutMs);

  return async <T>(
    input: string,
    init: RequestInit = {}
  ): Promise<FetchResult<T>> => {
    const correlationId = getCorrelationId();
    let url: string;
    try {
      url = resolveUrl(input, baseUrl);
    } catch (error) {
      const context: LogContext = {
        correlationId,
        module: 'http-client',
        method: init.method ?? 'GET',
        path: scrubString(input),
      };
      logger.error(context, 'Invalid request URL', error as Error);
      throw new HttpError('Invalid request URL', 400, input, correlationId);
    }

    const headers = new Headers(init.headers ?? {});
    if (correlationId) {
      headers.set(CORRELATION_HEADER, correlationId);
    }

    const controller = new AbortController();
    const externalSignal = init.signal;
    let externalAbortListenerAttached = false;
    let timedOut = false;
    const onExternalAbort = (): void => {
      controller.abort();
    };
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', onExternalAbort, {
          once: true,
        });
        externalAbortListenerAttached = true;
      }
    }
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, resolvedTimeoutMs);
    const start = performance.now();

    const baseContext: LogContext = {
      correlationId,
      module: 'http-client',
      method: init.method ?? 'GET',
      path: scrubString(url),
    };

    logger.debug(baseContext, 'HTTP request started');

    try {
      const response = await fetch(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
      const durationMs = Math.round(performance.now() - start);
      const status = response.status;

      const logContext: LogContext = {
        ...baseContext,
        statusCode: status,
        durationMs,
      };

      if (!response.ok) {
        logger.warn(logContext, 'HTTP request failed');
        throw new HttpError('HTTP request failed', status, url, correlationId);
      }

      const contentType = response.headers.get('content-type') ?? '';
      const bodyText = await response.text();
      let payload: T | undefined;

      try {
        payload = parsePayload<T>(bodyText, contentType);
      } catch (error) {
        if (error instanceof SyntaxError && contentType.includes('application/json')) {
          throw new HttpError('HTTP response contained invalid JSON', status, url, correlationId);
        }
        throw error;
      }

      logger.info(logContext, 'HTTP request completed');
      return { data: payload, status, durationMs, correlationId };
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      const logContext: LogContext = { ...baseContext, durationMs };

      if (error instanceof HttpError) {
        logger.error(logContext, error.message, error);
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        if (timedOut) {
          const message = 'HTTP request timed out';
          logger.error(logContext, message, error);
          throw new HttpError(message, 408, url, correlationId);
        }

        logger.warn(logContext, 'HTTP request aborted', error);
        throw error;
      }

      logger.error(logContext, 'HTTP request failed', error as Error);
      throw error;
    } finally {
      clearTimeout(timeoutId);
      if (externalSignal && externalAbortListenerAttached) {
        externalSignal.removeEventListener('abort', onExternalAbort);
      }
    }
  };
}
