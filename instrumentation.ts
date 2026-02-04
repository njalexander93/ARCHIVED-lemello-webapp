/**
 * @fileoverview Next.js server instrumentation hooks for logging.
 */

import 'server-only';

import { scrubString } from '@/lib/logger/pii-scrubber';

const resolveRequestPath = (url: string): string => {
  try {
    return scrubString(new URL(url).pathname);
  } catch {
    // Keep error logging resilient if request.url is malformed.
    const rawPath = url.split('?')[0] ?? url;
    return scrubString(rawPath);
  }
};

/**
 * Registers server-side instrumentation on startup.
 *
 * @returns Void.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { serverLogger } = await import('@/lib/logger/server');
  serverLogger.info(
    { module: 'instrumentation', action: 'register' },
    'Server instrumentation initialized'
  );
}

/**
 * Logs server request errors captured by Next.js.
 *
 * @param error - Error captured by Next.js.
 * @param request - Request metadata.
 * @param context - Rendering context details.
 * @returns Void.
 */
export async function onRequestError(
  error: Error & { digest?: string },
  request: { method: string; url: string },
  context: {
    routerKind?: string;
    routePath?: string;
    routeType?: string;
    renderSource?: string;
  }
): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }

  const { serverLogger } = await import('@/lib/logger/server');
  const path = resolveRequestPath(request.url);

  serverLogger.error(
    {
      module: 'instrumentation',
      action: 'onRequestError',
      errorName: error.name,
      digest: error.digest,
      request: {
        method: request.method,
        path,
      },
      context,
    },
    'Server request error'
  );
}
