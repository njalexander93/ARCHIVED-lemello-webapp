/**
 * @fileoverview Playwright configuration for webapp end-to-end tests.
 */

import { defineConfig, devices } from '@playwright/test';

// CI runs should be more deterministic and conservative.
const isCI =
  process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  // Location of e2e specs.
  testDir: './tests/e2e',
  fullyParallel: true,
  // Fail fast on accidental "test.only" in CI.
  forbidOnly: isCI,
  // Retries help reduce flaky failures in CI.
  retries: isCI ? 2 : 0,
  // One worker in CI for stability; local runs use Playwright defaults.
  workers: isCI ? 1 : undefined,
  // CI logs to stdout; local runs get an HTML report.
  reporter: isCI ? 'line' : 'html',
  use: {
    // Base URL for page.goto('/') and similar calls.
    baseURL: 'http://localhost:3000',
    // Collect traces on first retry to aid debugging.
    trace: 'on-first-retry',
  },
  webServer: {
    // Build and start the standalone server in CI; use dev server locally.
    command: isCI
      ? 'npm run build && node .next/standalone/server.js'
      : 'npm run dev',
    url: 'http://localhost:3000',
    // Reuse an already-running server during local development.
    reuseExistingServer: !isCI,
    timeout: 120000,
  },
  projects: [
    {
      // Chromium is a solid baseline for UI regression testing.
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
