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
  // Capture navigation start time for duration logging.
  const navigationStart = useRef<number>(performance.now());

  useEffect(() => {
    const currentPath = pathname ?? '/';
    const fromPath = previousPath.current;
    // Measure elapsed time between navigation events.
    const durationMs = Math.round(performance.now() - navigationStart.current);

    if (fromPath && fromPath !== currentPath) {
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
    navigationStart.current = performance.now();
  }, [pathname, correlationId]);
}
