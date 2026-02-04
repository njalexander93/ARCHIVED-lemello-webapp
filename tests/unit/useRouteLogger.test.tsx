/**
 * @fileoverview Unit tests for useRouteLogger hook.
 */

import { renderHook } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { CorrelationProvider } from '@/contexts/CorrelationContext';
import { useRouteLogger } from '@/hooks/useRouteLogger';
import * as clientLogger from '@/lib/logger/client';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/logger/client', () => ({
  clientLogger: {
    info: jest.fn(),
  },
}));

describe('useRouteLogger', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock performance.now() for consistent timing.
    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CorrelationProvider>{children}</CorrelationProvider>
  );

  it('does not log on initial render', () => {
    mockUsePathname.mockReturnValue('/');

    renderHook(() => useRouteLogger(), { wrapper });

    // Should not log on first render (no previous path).
    expect(clientLogger.clientLogger.info).not.toHaveBeenCalled();
  });

  it('logs route changes with correlation ID', () => {
    mockUsePathname.mockReturnValue('/initial');

    const { rerender } = renderHook(() => useRouteLogger(), { wrapper });

    // Clear the initial render check.
    jest.clearAllMocks();

    // Simulate navigation to a new route.
    mockUsePathname.mockReturnValue('/new-route');
    jest.spyOn(performance, 'now').mockReturnValue(150);

    rerender();

    // Verify logging with route transition details.
    expect(clientLogger.clientLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: expect.any(String),
        module: 'route',
        action: 'navigate',
        fromPath: '/initial',
        toPath: '/new-route',
        durationMs: expect.any(Number),
      }),
      'Route change completed'
    );
  });

  it('does not log when staying on the same route', () => {
    mockUsePathname.mockReturnValue('/same-route');

    const { rerender } = renderHook(() => useRouteLogger(), { wrapper });

    jest.clearAllMocks();

    // Stay on the same route.
    mockUsePathname.mockReturnValue('/same-route');
    rerender();

    // Should not log if the path hasn't changed.
    expect(clientLogger.clientLogger.info).not.toHaveBeenCalled();
  });

  it('tracks navigation duration correctly', () => {
    mockUsePathname.mockReturnValue('/start');
    jest.spyOn(performance, 'now').mockReturnValue(1000);

    const { rerender } = renderHook(() => useRouteLogger(), { wrapper });

    jest.clearAllMocks();

    // Navigate after 250ms.
    mockUsePathname.mockReturnValue('/destination');
    jest.spyOn(performance, 'now').mockReturnValue(1250);

    rerender();

    // Verify duration is calculated correctly.
    expect(clientLogger.clientLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        durationMs: 250,
        fromPath: '/start',
        toPath: '/destination',
      }),
      'Route change completed'
    );
  });
});
