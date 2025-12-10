# Test Writing Quickstart Guide

**Date**: 2025-12-10 | **Branch**: `002-config-optimization`

## Commands

```bash
# Run all tests with coverage
pnpm test:coverage

# Run unit tests only (headless)
pnpm test

# Run browser tests with UI
pnpm test:browser

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Unit tests | `*.spec.ts` | `lib/cn.spec.ts` |
| Browser tests | `*.browser.spec.tsx` | `components/forms/contact-form.browser.spec.tsx` |
| E2E tests | `e2e/*.spec.ts` | `e2e/contact-form.spec.ts` |

---

## Quick Templates

### 1. Pure Function Test

```typescript
// lib/cn.spec.ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
```

### 2. Zod Schema Test

```typescript
// lib/schemas/lead.spec.ts
import { describe, it, expect } from 'vitest'
import { leadSchema } from './lead'

describe('leadSchema', () => {
  const validData = {
    name: 'Test User',
    email: 'test@example.com',
    locale: 'en',
    turnstileToken: 'token',
  }

  it('accepts valid data', () => {
    const result = leadSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = leadSchema.safeParse({ ...validData, email: 'invalid' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects short name', () => {
    const result = leadSchema.safeParse({ ...validData, name: 'A' })
    expect(result.success).toBe(false)
  })

  it('allows empty optional fields', () => {
    const result = leadSchema.safeParse({ ...validData, phone: '' })
    expect(result.success).toBe(true)
  })
})
```

### 3. Function with External Dependency (Mock)

```typescript
// lib/turnstile/verify.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyTurnstile } from './verify'

describe('verifyTurnstile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success for valid token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const result = await verifyTurnstile('valid-token', 'secret')
    expect(result.success).toBe(true)
  })

  it('returns failure for invalid token', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        'error-codes': ['invalid-input-response'],
      }),
    })

    const result = await verifyTurnstile('invalid-token', 'secret')
    expect(result.success).toBe(false)
    expect(result.errorCodes).toContain('invalid-input-response')
  })

  it('handles network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await verifyTurnstile('token', 'secret')
    expect(result.success).toBe(false)
    expect(result.errorCodes).toContain('network_error')
  })
})
```

### 4. Rate Limit with Fake Timers

```typescript
// lib/rate-limit.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { checkRateLimit } from './rate-limit'
import { createMockKV } from '@/tests/mocks/cloudflare'

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows first request', async () => {
    const kv = createMockKV()
    const result = await checkRateLimit(kv, 'user-1')

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks after limit exceeded', async () => {
    const kv = createMockKV()

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv, 'user-1')
    }

    const result = await checkRateLimit(kv, 'user-1')
    expect(result.allowed).toBe(false)
  })

  it('resets after window expires', async () => {
    const kv = createMockKV()

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv, 'user-1')
    }

    // Advance 61 seconds
    vi.advanceTimersByTime(61 * 1000)

    const result = await checkRateLimit(kv, 'user-1')
    expect(result.allowed).toBe(true)
  })
})
```

### 5. Server Action Test

```typescript
// actions/submit-lead.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitLead } from './submit-lead'
import { createMockD1, createMockKV } from '@/tests/mocks/cloudflare'

// Mock modules
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(() => Promise.resolve('en')),
}))

import { getCloudflareContext } from '@opennextjs/cloudflare'

describe('submitLead', () => {
  let mockEnv: CloudflareEnv

  beforeEach(() => {
    vi.clearAllMocks()

    mockEnv = {
      CONTACT_FORM_D1: createMockD1(),
      NEXT_INC_CACHE_KV: createMockKV(),
      TURNSTILE_SECRET_KEY: 'test-secret',
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: 'noreply@test.com',
      RESEND_TO_EMAIL: 'admin@test.com',
    }

    vi.mocked(getCloudflareContext).mockResolvedValue({ env: mockEnv })

    // Mock successful Turnstile
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  })

  it('returns validation error for invalid email', async () => {
    const formData = new FormData()
    formData.set('name', 'Test')
    formData.set('email', 'invalid')
    formData.set('cf-turnstile-response', 'token')

    const result = await submitLead({}, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('validation_error')
  })

  it('returns turnstile_failed when verification fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    })

    const formData = new FormData()
    formData.set('name', 'Test User')
    formData.set('email', 'test@example.com')
    formData.set('cf-turnstile-response', 'invalid-token')

    const result = await submitLead({}, formData)

    expect(result.success).toBe(false)
    expect(result.message).toBe('turnstile_failed')
  })
})
```

### 6. Browser Component Test

```typescript
// components/forms/contact-form.browser.spec.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from 'vitest-browser-react'
import { userEvent } from '@vitest/browser/context'
import { ContactForm } from './contact-form'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock Turnstile component
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => {
    // Auto-succeed in tests
    setTimeout(() => onSuccess('test-token'), 0)
    return <div data-testid="turnstile-mock" />
  },
}))

describe('ContactForm', () => {
  it('renders form fields', async () => {
    render(<ContactForm locale="en" />)

    await expect.element(screen.getByLabelText(/name/i)).toBeVisible()
    await expect.element(screen.getByLabelText(/email/i)).toBeVisible()
    await expect.element(screen.getByRole('button', { name: /submit/i })).toBeVisible()
  })

  it('shows validation error for empty required fields', async () => {
    render(<ContactForm locale="en" />)

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    // Wait for validation message
    await expect.element(screen.getByText(/required/i)).toBeVisible()
  })
})
```

---

## Mock Utilities Location

```
src/tests/
   setup.ts              # Global setup (runs before all tests)
   mocks/
      cloudflare.ts     # createMockD1(), createMockKV()
      turnstile.ts      # Mock Turnstile responses
      resend.ts         # Mock Resend API
      next-intl.ts      # Mock translations
   fixtures/
       leads.ts          # Lead test data factories
       forms.ts          # FormData helpers
```

---

## Coverage Thresholds

| Metric | Global | Per-File |
|--------|--------|----------|
| Statements | 85% | 70% |
| Lines | 85% | 70% |
| Functions | 85% | 65% |
| Branches | 82% | 65% |

**New code must meet e85% coverage (hard gate).**

---

## Common Patterns

### Mocking Module Exports

```typescript
// Mock before imports
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(),
}))

// Import after mock setup
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Use vi.mocked for type-safe mock access
vi.mocked(getCloudflareContext).mockResolvedValue({ env: mockEnv })
```

### Cleaning Up Mocks

```typescript
beforeEach(() => {
  vi.clearAllMocks()  // Clear call history
  // OR
  vi.resetAllMocks()  // Clear + reset implementations
})
```

### Testing Async Errors

```typescript
it('handles database error', async () => {
  mockD1.prepare().run.mockRejectedValue(new Error('DB error'))

  const result = await submitLead({}, formData)

  expect(result.success).toBe(false)
  expect(result.message).toBe('server_error')
})
```

### Suppressing Expected Console Errors

```typescript
it('logs error on failure', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  await functionThatLogs()

  expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('error'))
  consoleSpy.mockRestore()
})
```
