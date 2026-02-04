/**
 * @fileoverview React context for correlation ID propagation.
 */

'use client';

import 'client-only';

import type { ReactElement, ReactNode } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { CorrelationId } from '@/lib/correlation';
import {
  generateCorrelationId,
  isValidCorrelationId,
} from '@/lib/correlation';

const STORAGE_KEY = 'lemello.correlationId';
// Stable fallback prevents non-deterministic ID generation during prerender.
const FALLBACK_CORRELATION_ID =
  '00000000-0000-7000-8000-000000000000' as CorrelationId;

interface CorrelationContextValue {
  correlationId: CorrelationId;
}

export interface CorrelationProviderProps {
  children: ReactNode;
  initialId?: CorrelationId;
}

const CorrelationContext = createContext<CorrelationContextValue | undefined>(
  undefined
);

/**
 * Provides a correlation ID to client components.
 *
 * @param props - Correlation provider props.
 * @returns Context provider with correlation ID.
 */
export function CorrelationProvider({
  children,
  initialId,
}: CorrelationProviderProps): ReactElement {
  const initialIdRef = useRef(initialId);
  const [correlationId, setCorrelationId] = useState<CorrelationId | null>(
    initialIdRef.current ?? null
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initialCorrelationId = initialIdRef.current;
    if (initialCorrelationId) {
      setCorrelationId(initialCorrelationId);
      try {
        sessionStorage.setItem(STORAGE_KEY, initialCorrelationId);
      } catch {
        // Ignore storage failures (privacy mode/quota) and keep in-memory ID.
      }
      return;
    }

    // Reuse the session correlation ID if available.
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures and fall back to generating an ID.
    }

    if (isValidCorrelationId(stored)) {
      setCorrelationId(stored);
      return;
    }

    // Generate a new ID when none exists.
    const generated = generateCorrelationId();
    try {
      sessionStorage.setItem(STORAGE_KEY, generated);
    } catch {
      // Ignore storage failures (privacy mode/quota) and keep in-memory ID.
    }
    setCorrelationId(generated);
  }, []);

  const value = useMemo<CorrelationContextValue>(() => {
    return {
      // Keep render deterministic; the real ID is hydrated in useEffect.
      correlationId: correlationId ?? FALLBACK_CORRELATION_ID,
    };
  }, [correlationId]);

  return (
    <CorrelationContext.Provider value={value}>
      {children}
    </CorrelationContext.Provider>
  );
}

/**
 * Retrieves the current correlation ID from context.
 *
 * @returns Correlation ID from the nearest provider.
 * @throws Error if the provider is missing.
 */
export function useCorrelationId(): CorrelationId {
  const context = useContext(CorrelationContext);
  if (!context) {
    throw new Error('CorrelationProvider is missing from the component tree.');
  }
  return context.correlationId;
}
