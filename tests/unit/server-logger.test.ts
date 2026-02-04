/**
 * @fileoverview Unit tests for server-side logger scrubbing behavior.
 * @jest-environment node
 */

import type { Logger } from '@/lib/logger/types';

const originalNodeEnv = process.env.NODE_ENV;
const originalLogLevel = process.env.LOG_LEVEL;
const mutableEnv = process.env as Record<string, string | undefined>;

const loadServerLogger = async (): Promise<Logger> => {
  jest.resetModules();
  mutableEnv.NODE_ENV = 'production';
  const module = await import('@/lib/logger/server');
  return module.serverLogger;
};

const loadServerModule = async (): Promise<{
  serverLogger: Logger;
  withCorrelationId: <T>(
    correlationId: string,
    callback: () => Promise<T>
  ) => Promise<T>;
}> => {
  jest.resetModules();
  mutableEnv.NODE_ENV = 'production';
  const module = await import('@/lib/logger/server');
  return {
    serverLogger: module.serverLogger,
    withCorrelationId: module.withCorrelationId,
  };
};

describe('server logger', () => {
  const flush = async (): Promise<void> => {
    await new Promise((resolve) => setImmediate(resolve));
  };

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete mutableEnv.NODE_ENV;
    } else {
      mutableEnv.NODE_ENV = originalNodeEnv;
    }

    if (originalLogLevel === undefined) {
      delete mutableEnv.LOG_LEVEL;
    } else {
      mutableEnv.LOG_LEVEL = originalLogLevel;
    }

    jest.restoreAllMocks();
  });

  it('scrubs PII from message strings and extra args', async () => {
    mutableEnv.LOG_LEVEL = 'info';
    const writeSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const serverLogger = await loadServerLogger();
    writeSpy.mockClear();

    serverLogger.info(
      { module: 'server-logger', action: 'test' },
      'Contact user@example.com',
      { email: 'user@example.com' }
    );

    await flush();

    const output = writeSpy.mock.calls.map(([chunk]) => String(chunk)).join('\n');
    expect(output).toContain('[REDACTED]');
    expect(output).not.toContain('user@example.com');
  });

  it('scrubs PII in child logger bindings', async () => {
    mutableEnv.LOG_LEVEL = 'info';
    const writeSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const serverLogger = await loadServerLogger();
    writeSpy.mockClear();

    const logger = serverLogger.child({
      module: 'server-logger',
      email: 'user@example.com',
    });
    logger.info('child logger request');

    await flush();

    const output = writeSpy.mock.calls.map(([chunk]) => String(chunk)).join('\n');
    expect(output).not.toContain('user@example.com');
    expect(output).toContain('"email":"[REDACTED]"');
  });

  it('preserves structured error logging when error is the first argument', async () => {
    mutableEnv.LOG_LEVEL = 'error';
    const writeSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const serverLogger = await loadServerLogger();
    writeSpy.mockClear();

    (serverLogger.error as (...args: unknown[]) => void)(
      new Error('Boom user@example.com'),
      'Failed for user@example.com'
    );

    await flush();

    const output = writeSpy.mock.calls.map(([chunk]) => String(chunk)).join('\n');
    expect(output).not.toContain('user@example.com');
    expect(output).toContain('"type":"Error"');
  });

  it('auto-injects correlationId from AsyncLocalStorage into server logs', async () => {
    mutableEnv.LOG_LEVEL = 'info';
    const writeSpy = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    const { serverLogger, withCorrelationId } = await loadServerModule();
    writeSpy.mockClear();

    await withCorrelationId(
      '00000000-0000-7000-8000-000000000001',
      async () => {
        serverLogger.info(
          { module: 'server-logger', action: 'als-correlation' },
          'Correlation test'
        );
      }
    );

    await flush();

    const output = writeSpy.mock.calls.map(([chunk]) => String(chunk)).join('\n');
    expect(output).toContain('"correlationId":"00000000-0000-7000-8000-000000000001"');
  });
});
