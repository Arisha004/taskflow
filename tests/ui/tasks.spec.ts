import { test, expect } from '@playwright/test';

test('a signed in user can add a task and sees it in the list', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Taskflow123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Your tasks' })).toBeVisible();
  const title = 'Book the venue ' + Date.now();
  await page.getByLabel('New task').fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
});
