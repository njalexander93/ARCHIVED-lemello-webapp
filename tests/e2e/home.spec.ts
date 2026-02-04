/**
 * @fileoverview Playwright E2E checks for the home page.
 */

import { expect, test } from '@playwright/test';

test('home page shows coming soon', async ({ page }) => {
  // Navigate to the home page served by the app.
  await page.goto('/');

  // Confirm the primary headline is visible in a real browser.
  await expect(
    page.getByRole('heading', { name: /coming soon/i })
  ).toBeVisible();
});
