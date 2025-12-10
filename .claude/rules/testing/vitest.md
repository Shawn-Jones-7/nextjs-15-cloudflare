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
browser: {
  enabled: true,
  provider: 'playwright',  // String form (Vitest 3.x supports both)
  instances: [{ browser: 'chromium' }]
}
```

**Note**: Vitest 3.x accepts both string (`'playwright'`) and function (`playwright()`) forms for provider. Project uses string form which is simpler and works correctly.

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

## Mock Cleanup

Always clear mocks between tests:

```typescript
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()  // Clear call history
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
