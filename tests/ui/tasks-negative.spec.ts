import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Taskflow123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Your tasks' })).toBeVisible();
});

test('a failed task creation shows an error and keeps the entered title', async ({ page }) => {
  await page.route('**/api/tasks', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    } else {
      await route.continue();
    }
  });

  const title = 'Task to retry ' + Date.now();
  const input = page.getByLabel('New task');
  await input.fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('alert')).toHaveText('Could not add task. Please try again.');
  await expect(input).toHaveValue(title);
});

test('an overlong task title is rejected without losing the entered text', async ({ page }) => {
  const title = 'x'.repeat(201);
  const input = page.getByLabel('New task');
  await input.fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('alert')).toHaveText('Task titles must be 200 characters or fewer');
  await expect(input).toHaveValue(title);
});
