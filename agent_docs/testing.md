# Testing Standards

## Framework

- **Unit/Integration**: Vitest + React Testing Library
- **Browser Tests**: Vitest Browser Mode (Playwright)
- **E2E**: Playwright

## Commands

```bash
pnpm test              # Unit tests (Node.js)
pnpm test:browser      # Browser tests (Chromium)
pnpm test:watch        # Watch mode
pnpm test:e2e          # Playwright E2E
```

## Test File Organization

```
src/
├── tests/
│   ├── hello.spec.ts           # Unit test
│   └── hello.browser.spec.tsx  # Browser test
e2e/
└── hello.spec.ts               # E2E test
```

### Naming Convention

- Unit tests: `*.spec.ts` or `*.test.ts`
- Browser tests: `*.browser.spec.tsx`
- E2E tests: `e2e/*.spec.ts`

## Vitest Workspace

Two test environments configured in `vitest.workspace.ts`:

1. **Node.js** — Unit tests, excludes `*.browser.spec.*`
2. **Browser** — Chromium via Playwright, only `*.browser.spec.*`

## vi.hoisted Usage

ESM mocks require `vi.hoisted` for variables used before module loading:

```typescript
// ✅ Correct: inline literals only
const mockFn = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', () => ({
  fetchData: mockFn,
}))

// ❌ Error: cannot reference external imports
import { helper } from './helpers'
const mockFn = vi.hoisted(() => helper()) // ESM error!
```

## Testing Async Server Components

Server Components cannot render directly in Vitest. Test logic separately:

```typescript
// Test the function, not the component

import { submitLead } from '@/actions/submit-lead'

describe('submitLead', () => {
  it('should validate input', async () => {
    const result = await submitLead({ name: '', email: 'invalid' })
    expect(result.success).toBe(false)
  })
})
```

## Playwright E2E

Config in `playwright.config.ts`:

- **Projects**: Desktop Chrome/Firefox/Safari + Mobile
- **Base URL**: `http://localhost:3000`
- **Dev server**: Auto-starts via `pnpm dev`

```typescript
// e2e/contact.spec.ts
test('contact form submits', async ({ page }) => {
  await page.goto('/en/contact')
  await page.fill('[name="name"]', 'Test User')
  // ...
})
```

## Quality Limits

| Metric         | Production | Test |
| -------------- | ---------- | ---- |
| File lines     | 500        | 800  |
| Function lines | 120        | 700  |
| Complexity     | 15         | 20   |
