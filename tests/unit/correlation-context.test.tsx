/**
 * @fileoverview Unit tests for correlation context behavior.
 */

import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';

import { CorrelationProvider, useCorrelationId } from '@/contexts/CorrelationContext';
import type { CorrelationId } from '@/lib/correlation';

const INITIAL_ID = '00000000-0000-7000-8000-000000000001' as CorrelationId;
const NEXT_ID = '00000000-0000-7000-8000-000000000002' as CorrelationId;

function CorrelationProbe(): ReactElement {
  const correlationId = useCorrelationId();
  return <span data-testid="correlation-id">{correlationId}</span>;
}

describe('CorrelationProvider', () => {
  it('does not overwrite correlation ID when initialId prop changes later', () => {
    const { rerender } = render(
      <CorrelationProvider initialId={INITIAL_ID}>
        <CorrelationProbe />
      </CorrelationProvider>
    );

    expect(screen.getByTestId('correlation-id')).toHaveTextContent(INITIAL_ID);
    expect(sessionStorage.getItem('lemello.correlationId')).toBe(INITIAL_ID);

    rerender(
      <CorrelationProvider initialId={NEXT_ID}>
        <CorrelationProbe />
      </CorrelationProvider>
    );

    expect(screen.getByTestId('correlation-id')).toHaveTextContent(INITIAL_ID);
    expect(sessionStorage.getItem('lemello.correlationId')).toBe(INITIAL_ID);
  });
});
