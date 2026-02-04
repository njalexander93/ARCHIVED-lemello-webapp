/**
 * @fileoverview Client hook for logging route changes.
 */

'use client';

import 'client-only';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef } from 'react';

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
  // Capture navigation start when pathname changes.
  const navigationStart = useRef<number | null>(null);

  useLayoutEffect(() => {
    navigationStart.current = performance.now();
  }, [pathname]);

  useEffect(() => {
    const currentPath = pathname ?? '/';
    const fromPath = previousPath.current;

    if (fromPath && fromPath !== currentPath) {
      // Measure navigation completion from pathname change to commit.
      const startedAt = navigationStart.current ?? performance.now();
      const durationMs = Math.round(performance.now() - startedAt);

      clientLogger.info(
        {
          correlationId,
          module: 'route',
          action: 'navigate',
          fromPath,
          toPath: currentPath,
          durationMs,
        },
        'Route change completed'
      );
    }

    // Update refs for the next navigation event.
    previousPath.current = currentPath;
  }, [pathname, correlationId]);
}
