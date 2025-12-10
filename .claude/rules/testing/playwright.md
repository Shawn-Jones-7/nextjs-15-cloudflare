---
paths: e2e/**/*.spec.ts, playwright.config.ts
---

# Playwright E2E Rules

## Command

```bash
pnpm test:e2e   # Run all E2E tests
```

## Configuration

Config in `playwright.config.ts`:

- **Projects**: chromium, firefox, webkit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Dev server**: Auto-starts via `pnpm dev`
- **Trace**: `on-first-retry` for debugging failures
- **Reporter**: HTML reports in `playwright-report/`

### CI Behavior

```typescript
// In CI environment (process.env.CI)
forbidOnly: true,    // Fail if test.only() left in code
retries: 2,          // Retry failed tests twice
workers: 1,          // Sequential execution
```

## Test Structure

```
e2e/
└── *.spec.ts   # E2E test files
```

## Locator Priority (Best Practices)

Use built-in locators in this order:

1. `page.getByRole()` — highest priority, accessible
2. `page.getByLabel()` — form inputs
3. `page.getByPlaceholder()` — fallback for forms
4. `page.getByText()` — visible text
5. `page.getByTestId()` — last resort

**Avoid**: CSS selectors, XPath, `[name="..."]` attribute selectors

## Example Test

```typescript
import { expect, test } from '@playwright/test'

test('contact form submits', async ({ page }) => {
  await page.goto('/en/contact')

  // ✅ Use semantic locators
  await page.getByLabel('Name').fill('Test User')
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Message').fill('Test message content')
  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page).toHaveURL('/en/contact/thank-you')
})
```

## Locator Chaining

Filter and chain locators for precision:

```typescript
await page
  .getByRole('listitem')
  .filter({ hasText: 'Product 2' })
  .getByRole('button', { name: 'Add to cart' })
  .click()
```

## Locale Testing

Test all locales including RTL:

```typescript
const locales = ['en', 'zh', 'es', 'ar']

for (const locale of locales) {
  test(`home page loads in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
}
```

## Debugging

```bash
pnpm test:e2e --debug   # Opens Playwright Inspector
```
