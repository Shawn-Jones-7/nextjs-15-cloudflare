import { expect, test } from '@playwright/test'

test('homepage loads with brand name', async ({ page }) => {
  await page.goto('/en')

  await expect(page.getByText(/GlobalTrade/i)).toBeVisible()
})
