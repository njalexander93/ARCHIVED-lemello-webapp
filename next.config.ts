/**
 * @fileoverview Next.js runtime configuration for the Lemello webapp.
 */

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Partial Prerendering for instant load UX
  cacheComponents: true,
  serverExternalPackages: ['pino', 'pino-pretty'],
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  // Standalone output for Docker deployment
  output: 'standalone',
};

export default nextConfig;
