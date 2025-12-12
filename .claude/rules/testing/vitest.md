---
paths: src/tests/**/*.spec.{ts,tsx}, src/tests/**/*.test.{ts,tsx}
---

# Vitest Rules

## Commands

```bash
pnpm test           # All tests (headless Chromium)
pnpm test:browser   # Browser tests (Chromium with UI)
pnpm test:watch     # Watch mode (headless Chromium)
```

**Note**: All tests run in browser environment via Playwright provider.

## File Naming

- Unit tests: `*.spec.ts` or `*.test.ts`
- Browser tests: `*.browser.spec.tsx`

## Configuration

Two environments in `vitest.config.ts` using `test.projects`:

1. **Unit** — Excludes `*.browser.spec.*` files
2. **Browser** — Chromium via Playwright provider

```typescript
import { playwright } from '@vitest/browser-playwright'

browser: {
  enabled: true,
  provider: playwright(),  // Factory function (Vitest 4.x)
  instances: [{ browser: 'chromium' }]
}
```

**Note**: Vitest 4.x requires factory function form `playwright()` from `@vitest/browser-playwright` package.

## vitest-browser-react v2 API

`render()` is now async and returns a `screen` object:

```typescript
import { userEvent } from 'vitest/browser'
import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-react'

it('example test', async () => {
  const screen = await render(<MyComponent />)
  await expect.element(screen.getByRole('button')).toBeVisible()
  await userEvent.click(screen.getByRole('button'))
})
```

**Key changes from v1**:

- `render()` returns a Promise — must be awaited
- Use `screen.getByRole()` instead of destructured `{ getByRole }`
- Import `userEvent` from `vitest/browser` (not `@vitest/browser/context`)

## vi.hoisted Usage

ESM mocks require `vi.hoisted` for variables used before module loading:

```typescript
// ❌ Error: cannot reference external imports

import { helper } from './helpers'

// ✅ Correct: inline literals only
const mockFn = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', () => ({
  fetchData: mockFn,
}))

const mockFn = vi.hoisted(() => helper()) // ESM error!
```

## Mock Cleanup

Always clear mocks between tests:

```typescript
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks() // Clear call history
  // or vi.resetAllMocks() to also reset implementations
})
```

## Testing Server Components

Server Components cannot render directly. Test logic separately:

```typescript
import { submitLead } from '@/actions/submit-lead'

describe('submitLead', () => {
  it('should validate input', async () => {
    const result = await submitLead({ name: '', email: 'invalid' })
    expect(result.success).toBe(false)
  })
})
```
