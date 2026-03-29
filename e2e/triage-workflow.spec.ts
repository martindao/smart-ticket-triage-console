import { test, expect } from '@playwright/test';

test('critical ticket can be escalated from detail panel', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Smart Ticket Triage' })).toBeVisible();

  await page.getByText('API rate limit errors').first().click();
  await page.getByRole('button', { name: 'Escalate' }).click();

  await expect(page.getByText('TKT-006')).toBeVisible();
  await expect(page.getByText('Escalated from TKT-004')).toBeVisible();
});
