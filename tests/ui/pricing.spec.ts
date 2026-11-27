import { test, expect } from '@playwright/test';

test('the pricing page shows the monthly prices and the discounted yearly prices', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByText('$10 / month')).toBeVisible();
  await page.getByRole('button', { name: /Yearly/ }).click();
  await expect(page.getByText('$96 / year')).toBeVisible();  // Pro: 12 months with 20% off
  await expect(page.getByText('$240 / year')).toBeVisible(); // Team
});
