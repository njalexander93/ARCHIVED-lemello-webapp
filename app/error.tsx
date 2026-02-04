/**
 * @fileoverview Segment error boundary with structured logging.
 */

'use client';

import 'client-only';

import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { useCorrelationId } from '@/contexts/CorrelationContext';
import { clientLogger } from '@/lib/logger/client';

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Logs and renders segment-level errors.
 *
 * @param props - Error boundary props.
 * @returns Error UI.
 */
export default function Error({
  error,
  reset,
}: ErrorProps): ReactElement {
  const correlationId = useCorrelationId();

  useEffect(() => {
    // Log the error with correlation context, avoiding full stack traces.
    clientLogger.error(
      {
        correlationId,
        module: 'ErrorBoundary',
        action: 'segment_error',
        errorName: error.name,
        digest: error.digest,
      },
      'Client error boundary triggered'
    );
  }, [correlationId, error.name, error.digest]);

  return (
    <div className="min-h-screen bg-[#fefefe] dark:bg-[#191a17] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-[#3d3833] dark:text-[#f2f1ec]">
          Something went wrong.
        </h1>
        <p className="text-base text-[#6b6560] dark:text-[#95968e]">
          Please try again in a moment.
        </p>
        <button
          type="button"
          className="px-5 py-2 rounded-md bg-[#ffca28] text-[#3d3833] font-semibold"
          onClick={() => reset()}
        >
          Try again
        </button>
        {/* Show digest only during development to reduce exposure. */}
        {process.env.NODE_ENV === 'development' && error.digest ? (
          <p className="text-xs text-[#6b6560] dark:text-[#95968e]">
            Digest: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
