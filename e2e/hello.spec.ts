import { expect, test } from '@playwright/test'

test('homepage loads with brand name', async ({ page }) => {
  await page.goto('/en')

  // Check header logo link contains brand name
  await expect(
    page.getByRole('link', { name: 'GlobalTrade' }).first(),
  ).toBeVisible()
})
