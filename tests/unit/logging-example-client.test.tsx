/**
 * @fileoverview Unit tests for the client logging example component.
 */

import { render, waitFor } from '@testing-library/react';

import { ExampleClientComponent } from '@/examples/logging-example-client';
import { clientLogger } from '@/lib/logger/client';

jest.mock('@/contexts/CorrelationContext', () => ({
  useCorrelationId: jest.fn(() => '00000000-0000-7000-8000-000000000000'),
}));

jest.mock('@/lib/logger/client', () => ({
  clientLogger: {
    info: jest.fn(),
  },
}));

describe('ExampleClientComponent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs only on mount (not every re-render)', async () => {
    const { rerender } = render(<ExampleClientComponent />);

    await waitFor(() => {
      expect(clientLogger.info).toHaveBeenCalledTimes(1);
    });

    rerender(<ExampleClientComponent />);
    expect(clientLogger.info).toHaveBeenCalledTimes(1);
    expect(clientLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        module: 'ExampleClientComponent',
        action: 'mount',
      }),
      'Client component mounted'
    );
  });
});
