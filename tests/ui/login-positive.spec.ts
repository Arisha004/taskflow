import { test, expect } from '@playwright/test';

test('valid credentials sign in and open the task page', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Taskflow123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('heading', { name: 'Your tasks' })).toBeVisible();
});
