/**
 * @fileoverview Unit tests for client logger argument handling.
 */

import type { Logger } from '@/lib/logger/types';

const loadClientLogger = async (): Promise<Logger> => {
  jest.resetModules();
  const module = await import('@/lib/logger/client');
  return module.clientLogger;
};

describe('client logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forwards scrubbed Error args when called with a message string', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom user@example.com');
    const clientLogger = await loadClientLogger();

    clientLogger.error('Request failed', error);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][2]).toEqual(
      expect.objectContaining({
        name: 'Error',
      })
    );
    const forwardedError = errorSpy.mock.calls[0][2] as Error;
    expect(forwardedError.message).toContain('[REDACTED]');
    expect(forwardedError.message).not.toContain('@');
  });

  it('forwards scrubbed object args when called with context + message', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const clientLogger = await loadClientLogger();

    clientLogger.error(
      { module: 'client-logger', action: 'test' },
      'Request failed',
      { email: 'user@example.com', safe: 'ok' }
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][2]).toEqual({
      email: '[REDACTED]',
      safe: 'ok',
    });
  });

  it('scrubs PII from message strings', async () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const clientLogger = await loadClientLogger();

    clientLogger.info('Contact user@example.com');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toContain('[REDACTED]');
    expect(infoSpy.mock.calls[0][0]).not.toContain('user@example.com');
  });
});
