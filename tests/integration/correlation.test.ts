/**
 * @fileoverview Integration tests for correlation ID propagation.
 */

import {
  CORRELATION_HEADER,
  generateCorrelationId,
} from '@/lib/correlation';
import { createHttpClient } from '@/lib/http-client';

describe('Correlation ID propagation', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // Store original fetch if it exists.
    originalFetch = global.fetch;
    // Create a fresh mock for each test.
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    // Restore the original fetch implementation.
    global.fetch = originalFetch;
  });

  it('injects correlation ID into fetch headers', async () => {
    // Create a client that always returns the same correlation ID.
    const testId = generateCorrelationId();
    const client = createHttpClient(() => testId);

    // Mock a JSON response to avoid relying on Response in Jest.
    const headers = new Headers({ 'content-type': 'application/json' });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers,
      text: async () => JSON.stringify({ ok: true }),
    });

    // Execute the request and inspect the captured fetch init.
    const result = await client<{ ok: boolean }>('https://api.example.com/test');
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const requestHeaders = init?.headers as Headers;

    // Verify correlation ID propagation into headers and result.
    expect(requestHeaders.get(CORRELATION_HEADER)).toBe(testId);
    expect(result.correlationId).toBe(testId);
  });
});
