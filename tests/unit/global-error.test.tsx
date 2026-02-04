/**
 * @fileoverview Unit tests for global error boundary logging.
 */

import { render, waitFor } from '@testing-library/react';

import GlobalError from '@/app/global-error';

describe('GlobalError', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('scrubs PII from fatal log payload', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');
    error.name = 'Crash user@example.com';
    Object.assign(error, { digest: 'digest user@example.com' });

    render(
      <GlobalError
        error={error as Error & { digest?: string }}
        reset={() => undefined}
      />
    );

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalled();
    });

    const payload = String(errorSpy.mock.calls.at(-1)?.[0]);
    expect(payload).toContain('[REDACTED]');
    expect(payload).not.toContain('user@example.com');
  });
});
