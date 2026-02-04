/**
 * @fileoverview Unit tests for edge proxy correlation and log scrubbing.
 */

import { proxy } from '@/proxy';

jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn((options?: { request?: { headers?: Headers } }) => ({
      headers: new Headers(),
      request: options?.request,
    })),
  },
}));

describe('proxy', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('propagates valid correlation IDs and scrubs logged strings', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const correlationId = '018f47ac-4db0-7cc2-8f7e-9f2f7f1c1234';
    const request = {
      headers: new Headers({
        'x-correlation-id': correlationId,
        'user-agent': 'Mozilla user@example.com',
      }),
      method: 'GET',
      nextUrl: { pathname: '/users/user@example.com' },
    } as const;

    const pending: Promise<unknown>[] = [];
    const event = {
      waitUntil: (promise: Promise<unknown>): void => {
        pending.push(promise);
      },
    };

    const response = proxy(
      request as unknown as Parameters<typeof proxy>[0],
      event as unknown as Parameters<typeof proxy>[1]
    ) as unknown as {
      headers: Headers;
      request?: { headers?: Headers };
    };

    expect(response.headers.get('x-correlation-id')).toBe(correlationId);
    expect(response.request?.headers?.get('x-correlation-id')).toBe(correlationId);

    await Promise.all(pending);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(logSpy.mock.calls[0][0])) as {
      correlationId: string;
      path: string;
      userAgent: string;
    };

    expect(payload.correlationId).toBe(correlationId);
    expect(payload.path).toContain('[REDACTED]');
    expect(payload.path).not.toContain('user@example.com');
    expect(payload.userAgent).toContain('[REDACTED]');
    expect(payload.userAgent).not.toContain('user@example.com');
  });

  it('generates a correlation ID when header is missing', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const request = {
      headers: new Headers({ 'user-agent': 'Mozilla' }),
      method: 'GET',
      nextUrl: { pathname: '/home' },
    } as const;
    const pending: Promise<unknown>[] = [];
    const event = {
      waitUntil: (promise: Promise<unknown>): void => {
        pending.push(promise);
      },
    };

    const response = proxy(
      request as unknown as Parameters<typeof proxy>[0],
      event as unknown as Parameters<typeof proxy>[1]
    ) as unknown as {
      headers: Headers;
      request?: { headers?: Headers };
    };

    const generated = response.headers.get('x-correlation-id');
    expect(generated).toBe('00000000-0000-7000-8000-000000000000');
    expect(response.request?.headers?.get('x-correlation-id')).toBe(generated);

    await Promise.all(pending);
    expect(logSpy).toHaveBeenCalledTimes(1);
  });
});
