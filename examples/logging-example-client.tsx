/**
 * @fileoverview Client-side example usage of structured logging utilities.
 */

'use client';

import type { ReactElement } from 'react';

import { useCorrelationId } from '@/contexts/CorrelationContext';
import { clientLogger } from '@/lib/logger/client';

/**
 * Example client component with correlation-aware logging.
 *
 * @returns JSX element.
 */
export function ExampleClientComponent(): ReactElement {
  // Correlation ID is provided by CorrelationProvider in app layout.
  const correlationId = useCorrelationId();

  // Client-side logger usage: include correlation ID for tracing.
  clientLogger.info(
    { correlationId, module: 'ExampleClientComponent', action: 'render' },
    'Client component rendered'
  );

  return <div>Logging example</div>;
}
