/**
 * @fileoverview Unit tests for segment error boundary logging.
 */

import { render, waitFor } from '@testing-library/react';

import ErrorBoundary from '@/app/error';
import { clientLogger } from '@/lib/logger/client';

jest.mock('@/contexts/CorrelationContext', () => ({
  useCorrelationId: jest.fn(() => '00000000-0000-7000-8000-000000000000'),
}));

jest.mock('@/lib/logger/client', () => ({
  clientLogger: {
    error: jest.fn(),
  },
}));

describe('ErrorBoundary', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs errorMessage in the segment error payload', async () => {
    const error = new Error('Segment failure');
    error.name = 'SegmentError';
    Object.assign(error, { digest: 'digest-123' });

    render(
      <ErrorBoundary
        error={error as Error & { digest?: string }}
        reset={() => undefined}
      />
    );

    await waitFor(() => {
      expect(clientLogger.error).toHaveBeenCalled();
    });

    expect(clientLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'ErrorBoundary',
        action: 'segment_error',
        errorName: 'SegmentError',
        errorMessage: 'Segment failure',
        digest: 'digest-123',
      }),
      'Client error boundary triggered'
    );
  });
});
