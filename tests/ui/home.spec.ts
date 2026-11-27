import { test, expect } from '@playwright/test';

test('the home page shows the headline and leads to pricing', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Plan less. Finish more.' })).toBeVisible();
  await page.getByRole('link', { name: 'See pricing' }).click();
  await expect(page).toHaveURL(/\/pricing$/);
});
