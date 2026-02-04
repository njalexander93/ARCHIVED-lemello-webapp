/**
 * @fileoverview Edge proxy for correlation ID injection and request logging.
 */

import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server';

import {
  CORRELATION_HEADER,
  generateCorrelationId,
  isValidCorrelationId,
} from '@/lib/correlation';
import { scrubString } from '@/lib/logger/pii-scrubber';

/**
 * Injects correlation IDs into incoming requests and logs metadata.
 *
 * @param request - Next.js request instance.
 * @param event - Next.js fetch event for async work.
 * @returns Response with correlation headers set.
 */
export function proxy(
  request: NextRequest,
  event: NextFetchEvent
): NextResponse {
  const start = performance.now();
  const incomingId = request.headers.get(CORRELATION_HEADER) ?? undefined;
  const correlationId = isValidCorrelationId(incomingId)
    ? incomingId
    : generateCorrelationId();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_HEADER, correlationId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(CORRELATION_HEADER, correlationId);
  const durationMs = Math.round(performance.now() - start);

  event.waitUntil(
    (async () => {
      const userAgent = request.headers.get('user-agent') ?? '';

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          type: 'request',
          correlationId,
          method: request.method,
          path: scrubString(request.nextUrl.pathname),
          durationMs,
          userAgent: scrubString(userAgent.slice(0, 200)),
        })
      );
    })()
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
