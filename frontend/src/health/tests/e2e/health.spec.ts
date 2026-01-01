import { test, expect } from '@playwright/test';
import { Routes } from '../../../shared/infrastructure/ui/routes';

test.describe('Health Page', () => {
  test('shows health status from real API', async ({ page }) => {
    await page.goto(Routes.Health);

    await expect(page.getByText('healthy')).toBeVisible({ timeout: 10000 });
  });

  test('shows loading state or health status', async ({ page }) => {
    await page.goto(Routes.Health);

    // Either loading or healthy should be visible (loading might be too fast to catch)
    const loading = page.getByText('Checking health...');
    const healthy = page.getByText('healthy');

    await expect(loading.or(healthy)).toBeVisible({ timeout: 10000 });
  });
});
