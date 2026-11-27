import { test, expect } from '@playwright/test';

test('a wrong password does not sign in', async ({ page }) => {
  await page.goto('/signin');
  await page.getByLabel('Email').fill('demo@taskflow.test');
  await page.getByLabel('Password').fill('Wrong-password-1');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email or password is incorrect');
});
