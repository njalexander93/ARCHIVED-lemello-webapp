/**
 * @fileoverview Client layout wrapper for route logging.
 */

'use client';

import 'client-only';

import type { ReactElement, ReactNode } from 'react';

import { useRouteLogger } from '@/hooks/useRouteLogger';

export interface ClientLayoutProps {
  children: ReactNode;
}

/**
 * Wraps children with client-side logging behavior.
 *
 * @param props - Client layout props.
 * @returns Rendered children.
 */
export function ClientLayout({ children }: ClientLayoutProps): ReactElement {
  // Start route logging as soon as the client layout renders.
  useRouteLogger();
  // Render children without additional DOM wrappers.
  return <>{children}</>;
}
