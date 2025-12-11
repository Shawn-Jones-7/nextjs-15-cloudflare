# Research: Configuration Optimization

**Date**: 2025-12-09 | **Branch**: `002-config-optimization`

## 1. React Compiler ESLint Rule

### Question

Is `babel-plugin-react-compiler` configured in this project?

### Finding

**NO** - The project does not have React Compiler configured.

- `eslint.config.js:145` has `'react-hooks/react-compiler': 'error'`
- No `babel-plugin-react-compiler` in `package.json`
- No babel config file exists

### Decision

**Remove the rule** - The `react-hooks/react-compiler` rule is only useful when React Compiler is actively used. Without the compiler, this rule may cause false positives or confusion.

### Alternative Considered

- Conditionally enable the rule → Rejected (adds complexity for no benefit)
- Install React Compiler → Rejected (out of scope, requires significant testing)

---

## 2. Vitest Projects Migration

### Question

What's the exact migration syntax from `defineWorkspace` to `projects` in Vitest 3.x?

### Finding

Vitest 3.x supports inline `projects` array in `vitest.config.ts`:

```typescript
// OLD: vitest.workspace.ts
import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([...])

// NEW: vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```

### Decision

**Migrate to inline projects** - Single config file, better maintainability.

### Alternative Considered

- Keep separate workspace file → Rejected (deprecated in Vitest 3.x)

---

## 3. verbatimModuleSyntax Impact

### Question

Which files need import style changes when enabling `verbatimModuleSyntax`?

### Finding

- 15 files use `import type` syntax (already correct)
- Project already uses `@typescript-eslint/consistent-type-imports` with `prefer: 'type-imports'`
- ESLint auto-fixes will handle any issues

### Decision

**Safe to enable** - Existing code already follows type-import conventions. Any edge cases will be caught by ESLint.

### Risk

Low - ESLint provides auto-fix for inconsistent imports.

---

## 4. @cloudflare/workers-types Compatibility

### Question

What version is compatible with wrangler 4.16.1?

### Finding

- Current wrangler version: `4.16.1`
- `@cloudflare/workers-types` latest version is compatible
- Installation: `pnpm add -D @cloudflare/workers-types`

### Decision

**Install latest version** - No version pinning needed, types track wrangler releases.

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

---

## 5. next-intl Lazy Loading Pattern

### Question

Best pattern for namespace-based message splitting?

### Finding

next-intl supports dynamic imports in `getRequestConfig`:

```typescript
// Option A: Split by namespace files
const messages = {
  ...(await import(`../../messages/${locale}/common.json`)).default,
  ...(await import(`../../messages/${locale}/products.json`)).default,
}

// Option B: Single file with selective namespace passing
// In layout.tsx, pass only needed namespaces to NextIntlClientProvider
```

### Decision

**Defer to P2** - Current translations (~12KB/locale) are below performance threshold (30KB). Document as future optimization when translations grow.

### Rationale

- Current bundle impact is minimal
- Splitting adds complexity
- Premature optimization

---

---

## 6. Vitest v8 Coverage Provider

### Question

Which coverage provider is best for ESM/Next.js 15/Cloudflare Workers?

### Finding

Vitest 3.x supports two providers:

- `v8`: Native V8 coverage, faster, better ESM support
- `istanbul`: Traditional instrumentation, more accurate branches

### Decision

**Use `v8`** - Faster execution, native ESM support, no source map issues with dynamic imports.

### Configuration

```typescript
coverage: {
  provider: 'v8',
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/app/**/*',           // Pages/Server Components
    'src/components/ui/**/*', // shadcn/ui
    '**/*.spec.{ts,tsx}',
    '**/*.d.ts',
  ],
}
```

---

## 7. Cloudflare Bindings Mock Pattern

### Question

How to mock D1Database and KVNamespace for unit tests?

### Finding

Create lightweight in-memory mocks implementing the interfaces:

```typescript
// KVNamespace Mock
export function createMockKV(): KVNamespace {
  const store = new Map<string, { value: string; expiration?: number }>()
  return {
    get: vi.fn(async (key: string, type?: string) => {
      const entry = store.get(key)
      if (!entry) return null
      if (entry.expiration && Date.now() / 1000 >= entry.expiration) {
        store.delete(key)
        return null
      }
      return type === 'json' ? JSON.parse(entry.value) : entry.value
    }),
    put: vi.fn(
      async (
        key: string,
        value: string,
        options?: { expirationTtl?: number },
      ) => {
        store.set(key, {
          value,
          expiration: options?.expirationTtl
            ? Math.floor(Date.now() / 1000) + options.expirationTtl
            : undefined,
        })
      },
    ),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
    list: vi.fn(async () => ({
      keys: [...store.keys()].map((name) => ({ name })),
    })),
  } as unknown as KVNamespace
}

// D1Database Mock
export function createMockD1(): D1Database {
  const preparedStatement = {
    bind: vi.fn().mockReturnThis(),
    run: vi.fn(async () => ({ success: true, meta: {} })),
    first: vi.fn(async () => null),
    all: vi.fn(async () => ({ results: [] })),
  }
  return {
    prepare: vi.fn(() => preparedStatement),
    batch: vi.fn(async (statements) =>
      statements.map(() => ({ success: true })),
    ),
    exec: vi.fn(async () => ({ count: 1 })),
  } as unknown as D1Database
}
```

### Decision

**In-memory mocks** - Fast, type-safe, deterministic. Miniflare is too heavyweight for unit tests.

---

## 8. Server Action Testing

### Question

Best practice for testing Server Actions in Next.js 15?

### Finding

Server Actions are async functions with `'use server'` directive. Test them by:

1. Mocking `getCloudflareContext` to inject test bindings
2. Mocking `getLocale` from next-intl
3. Creating FormData programmatically

```typescript
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(() => 'en'),
}))

describe('submitLead', () => {
  beforeEach(() => {
    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: { CONTACT_FORM_D1: createMockD1() /* ... */ },
    })
  })

  it('validates input', async () => {
    const formData = new FormData()
    formData.set('email', 'invalid')
    const result = await submitLead({}, formData)
    expect(result.success).toBe(false)
  })
})
```

### Decision

**Direct function testing** with mocked dependencies. No HTTP simulation needed.

---

## 9. Browser Component Testing

### Question

How to test React components in browser environment?

### Finding

Current config uses Vitest browser mode with Playwright provider. Use `vitest-browser-react` for rendering:

```typescript
// *.browser.spec.tsx
import { render, screen } from 'vitest-browser-react'
import { userEvent } from '@vitest/browser/context'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ContactForm', () => {
  it('shows validation error', async () => {
    render(<ContactForm locale="en" />)
    await userEvent.click(screen.getByRole('button', { name: /submit/i }))
    await expect.element(screen.getByText(/required/i)).toBeVisible()
  })
})
```

### Decision

**vitest-browser-react** with Playwright provider. File naming: `*.browser.spec.tsx`.

---

## 10. Fake Timers for Rate Limiting

### Question

How to test time-dependent rate-limit logic?

### Finding

Use Vitest fake timers:

```typescript
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

it('resets after window expires', async () => {
  const kv = createMockKV()
  // Exhaust limit
  for (let i = 0; i < 5; i++) await checkRateLimit(kv, 'user')
  // Advance time past window (60s)
  vi.advanceTimersByTime(61 * 1000)
  // Should be allowed again
  const result = await checkRateLimit(kv, 'user')
  expect(result.allowed).toBe(true)
})
```

### Decision

**vi.useFakeTimers()** - Essential for deterministic rate-limit tests.

---

## Summary

| Topic                  | Decision                 | Risk |
| ---------------------- | ------------------------ | ---- |
| React Compiler         | Remove ESLint rule       | None |
| Vitest projects        | Migrate to inline config | Low  |
| verbatimModuleSyntax   | Enable                   | Low  |
| workers-types          | Install latest           | None |
| next-intl lazy loading | Defer to future          | None |
| Coverage provider      | v8 (faster, ESM-native)  | None |
| Cloudflare mocks       | In-memory Map-based      | None |
| Server Action tests    | Direct function + mocks  | Low  |
| Browser tests          | vitest-browser-react     | None |
| Fake timers            | vi.useFakeTimers()       | None |
