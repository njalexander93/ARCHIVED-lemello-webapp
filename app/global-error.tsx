/**
 * @fileoverview Global error boundary with minimal logging.
 */

'use client';

import 'client-only';

import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { deepScrub } from '@/lib/logger/pii-scrubber';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Logs fatal app-level errors and renders a fallback UI.
 *
 * @param props - Global error boundary props.
 * @returns Error UI with required html/body tags.
 */
export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): ReactElement {
  useEffect(() => {
    // Log a minimal payload to avoid leaking sensitive data.
    const payload = deepScrub({
      timestamp: new Date().toISOString(),
      level: 'FATAL',
      type: 'global_error',
      digest: error.digest,
      errorName: error.name,
      errorMessage: error.message,
    });

    console.error(
      JSON.stringify(payload)
    );
  }, [error.name, error.message, error.digest]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#fefefe] dark:bg-[#191a17] flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-[#3d3833] dark:text-[#f2f1ec]">
              We hit a snag.
            </h1>
            <p className="text-base text-[#6b6560] dark:text-[#95968e]">
              Please try again in a moment.
            </p>
            <button
              type="button"
              className="px-5 py-2 rounded-md bg-[#ffca28] text-[#3d3833] font-semibold"
              onClick={() => reset()}
            >
              Retry
            </button>
            {/* Show digest only during development to limit exposure. */}
            {process.env.NODE_ENV === 'development' && error.digest ? (
              <p className="text-xs text-[#6b6560] dark:text-[#95968e]">
                Digest: {error.digest}
              </p>
            ) : null}
          </div>
        </div>
      </body>
    </html>
  );
}
