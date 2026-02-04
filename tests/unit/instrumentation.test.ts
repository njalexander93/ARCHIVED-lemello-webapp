/**
 * @fileoverview Unit tests for instrumentation error logging.
 */

import { onRequestError } from '@/instrumentation';
import { serverLogger } from '@/lib/logger/server';

jest.mock('@/lib/logger/server', () => ({
  serverLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('instrumentation', () => {
  const originalRuntime = process.env.NEXT_RUNTIME;

  beforeEach(() => {
    process.env.NEXT_RUNTIME = 'nodejs';
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env.NEXT_RUNTIME = originalRuntime;
  });

  it('logs request errors even when request.url is malformed', async () => {
    await expect(
      onRequestError(
        new Error('boom'),
        {
          method: 'GET',
          url: '/users/user@example.com?token=abc',
        },
        {}
      )
    ).resolves.toBeUndefined();

    expect(serverLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({
          path: '/users/[REDACTED]',
        }),
      }),
      'Server request error'
    );
  });
});
