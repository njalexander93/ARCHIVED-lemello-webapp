/**
 * @fileoverview Client hook for logging route changes.
 */

'use client';

import 'client-only';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useCorrelationId } from '@/contexts/CorrelationContext';
import { clientLogger } from '@/lib/logger/client';

/**
 * Logs route transitions without capturing query params.
 *
 * @returns Void.
 */
export function useRouteLogger(): void {
  const pathname = usePathname();
  const correlationId = useCorrelationId();
  // Track the previous path to compute transitions.
  const previousPath = useRef<string | null>(null);
  // Track when the current route last settled to avoid near-zero durations.
  const lastRouteSettledAt = useRef<number | null>(null);

  useEffect(() => {
    const now = performance.now();
    const currentPath = pathname ?? '/';
    const fromPath = previousPath.current;

    if (fromPath && fromPath !== currentPath) {
      // Measure elapsed time since the previous route settled.
      const startedAt = lastRouteSettledAt.current ?? now;
      const elapsedSinceLastRouteMs = Math.max(0, Math.round(now - startedAt));

      clientLogger.info(
        {
          correlationId,
          module: 'route',
          action: 'navigate',
          fromPath,
          toPath: currentPath,
          elapsedSinceLastRouteMs,
        },
        'Route change completed'
      );
    }

    // Update refs for the next navigation event.
    previousPath.current = currentPath;
    lastRouteSettledAt.current = now;
  }, [pathname, correlationId]);
}
