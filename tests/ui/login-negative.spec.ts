import { test, expect } from '@playwright/test';

test('a wrong password does not sign in', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Wrong-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect');
});

test('empty credentials are rejected with a required-fields message', async ({ page }) => {
  await page.goto('/signin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email and password are required');
});

test('repeated failed login attempts are rate limited', async ({ page }) => {
  await page.goto('/signin');
  let status = 0;
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await page.request.post('/api/auth/login', {
      data: { email: 'demo@taskflow.test', password: 'Wrong-password-1' },
    });
    status = response.status();
  }
  expect(status).toBe(429);
});

test('a valid login is blocked after repeated failed attempts', async ({ page }) => {
  await page.goto('/signin');
  const alert = page.getByRole('alert');
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.getByLabel('Email').fill('api@taskflow.test');
    await page.getByLabel('Password').fill('Wrong-password-1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(alert).toHaveText('Email or password is incorrect');
  }

  await page.getByLabel('Password').fill('Taskflow123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(alert).toHaveText('Account temporarily locked after too many failed attempts');
});
