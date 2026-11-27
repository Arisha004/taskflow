import { test, expect } from '@playwright/test';

test('the contact form asks for every field, then sends the message', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Please fill in every field')).toBeVisible();
  await page.getByLabel('Name').fill('Ada Lovelace');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Message').fill('Hello, I would like a demo.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Thanks, we got your message')).toBeVisible();
});
