/**
 * @fileoverview Root layout shell for the Lemello webapp.
 */

import type { Metadata } from 'next';

import { CorrelationProvider } from '@/contexts/CorrelationContext';
import { ClientLayout } from './client-layout';
import './globals.css';

export const metadata: Metadata = {
  title: "Lemello - Today's recipes. Tomorrow's traditions.",
  description: 'Transform from recipe-follower to recipe-creator with AI guidance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* App-wide layout wrapper for all pages. */}
      <body>
        {/* Provide a per-session correlation ID to client components. */}
        <CorrelationProvider>
          {/* Run client-only route logging without extra DOM wrappers. */}
          <ClientLayout>{children}</ClientLayout>
        </CorrelationProvider>
      </body>
    </html>
  );
}
