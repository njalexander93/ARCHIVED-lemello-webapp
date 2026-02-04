/**
 * @fileoverview Unit tests for HTTP client behavior and error handling.
 */

import { createHttpClient } from '@/lib/http-client';

describe('http client', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('throws HttpError for non-OK responses even with invalid JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => '{invalid-json',
    });

    const client = createHttpClient(() => undefined);

    await expect(client('https://api.example.com/fail')).rejects.toEqual(
      expect.objectContaining({
        name: 'HttpError',
        status: 500,
        url: 'https://api.example.com/fail',
      })
    );
  });

  it('throws HttpError when successful responses contain invalid JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => '{invalid-json',
    });

    const client = createHttpClient(() => undefined);

    await expect(client('https://api.example.com/bad-json')).rejects.toEqual(
      expect.objectContaining({
        name: 'HttpError',
        status: 200,
        url: 'https://api.example.com/bad-json',
        message: 'HTTP response contained invalid JSON',
      })
    );
  });

  it('returns undefined data for empty response bodies', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => '',
    });

    const client = createHttpClient(() => undefined);
    const result = await client<{ ok: boolean }>(
      'https://api.example.com/no-content'
    );

    expect(result.status).toBe(204);
    expect(result.data).toBeUndefined();
  });

  it('throws HttpError when URL resolution fails', async () => {
    const client = createHttpClient(() => undefined, { baseUrl: '://invalid-base' });

    await expect(client('/recipes')).rejects.toEqual(
      expect.objectContaining({
        name: 'HttpError',
        status: 400,
        url: '/recipes',
        message: 'Invalid request URL',
      })
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enforces timeout when an external signal is provided', async () => {
    jest.useFakeTimers();

    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      });
    });

    const client = createHttpClient(() => undefined, { timeoutMs: 25 });
    const externalController = new AbortController();
    const pending = client('https://api.example.com/slow', {
      signal: externalController.signal,
    });
    const assertion = expect(pending).rejects.toEqual(
      expect.objectContaining({
        name: 'HttpError',
        status: 408,
      })
    );

    await jest.advanceTimersByTimeAsync(25);
    await assertion;
  });

  it('does not convert caller-initiated aborts into timeouts', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      });
    });

    const client = createHttpClient(() => undefined, { timeoutMs: 1000 });
    const externalController = new AbortController();
    const pending = client('https://api.example.com/cancel', {
      signal: externalController.signal,
    });
    const assertion = expect(pending).rejects.toEqual(
      expect.objectContaining({
        name: 'AbortError',
      })
    );
    externalController.abort();

    await assertion;
  });

  it('falls back to safe default timeout for invalid timeout values', async () => {
    jest.useFakeTimers();

    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      });
    });

    const client = createHttpClient(() => undefined, { timeoutMs: 0 });
    const pending = client('https://api.example.com/fallback-timeout');
    let settled = false;
    void pending.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      }
    );

    const assertion = expect(pending).rejects.toEqual(
      expect.objectContaining({
        name: 'HttpError',
        status: 408,
      })
    );

    await jest.advanceTimersByTimeAsync(1);
    expect(settled).toBe(false);

    await jest.advanceTimersByTimeAsync(10000);
    await assertion;
  });
});
