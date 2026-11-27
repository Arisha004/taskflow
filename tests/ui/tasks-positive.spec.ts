import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Taskflow123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Your tasks' })).toBeVisible();
});

test('a signed in user can add a task and sees it in the list', async ({ page }) => {
  const title = 'Book the venue ' + Date.now();
  await page.getByLabel('New task').fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
});

test('a task can be marked complete', async ({ page }) => {
  const title = 'Complete task ' + Date.now();
  await page.getByLabel('New task').fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  const task = page.getByRole('listitem').filter({ hasText: title });
  const complete = task.getByRole('checkbox', { name: `Complete ${title}` });
  await complete.check();
  await expect(complete).toBeChecked();
});

test('a task can be deleted', async ({ page }) => {
  const title = 'Delete task ' + Date.now();
  await page.getByLabel('New task').fill(title);
  await page.getByRole('button', { name: 'Add task' }).click();
  const task = page.getByRole('listitem').filter({ hasText: title });
  await expect(task).toBeVisible();
  await task.getByRole('button', { name: `Delete ${title}` }).click();
  await expect(task).toHaveCount(0);
});

test('search only shows tasks matching the query', async ({ page }) => {
  const suffix = Date.now();
  const matchingTitle = 'Search match ' + suffix;
  const otherTitle = 'Unrelated task ' + suffix;

  for (const title of [matchingTitle, otherTitle]) {
    await page.getByLabel('New task').fill(title);
    await page.getByRole('button', { name: 'Add task' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: title })).toBeVisible();
  }

  await page.getByLabel('Search').fill(matchingTitle);
  await expect(page.getByRole('listitem').filter({ hasText: matchingTitle })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: otherTitle })).toHaveCount(0);
});
