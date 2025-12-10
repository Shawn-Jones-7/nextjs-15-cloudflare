---
paths: src/actions/**/*.ts
---

# Server Actions Rules

## Async Request APIs

These APIs **must be awaited** in Next.js 15:

| API            | Usage                                  |
| -------------- | -------------------------------------- |
| `params`       | `const { locale } = await params`      |
| `searchParams` | `const { query } = await searchParams` |
| `cookies()`    | `await cookies()`                      |
| `headers()`    | `await headers()`                      |
| `draftMode()`  | `await draftMode()`                    |

**Warning**: Synchronous access works in Next.js 15 but will **break in Next.js 16**.

## Serialization Requirements

Server Action arguments and return values must be JSON-serializable:

```typescript
// ❌ Won't work
return { createdAt: new Date() }

// ✅ Correct
return { createdAt: new Date().toISOString() }
```

## Cloudflare Integration

Access D1/KV/Queue via `getCloudflareContext`:

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function submitLead(data: LeadData) {
  // Use { async: true } for Server Actions
  const { env } = await getCloudflareContext({ async: true })

  // D1 with prepared statement binding
  await env.CONTACT_FORM_D1.prepare(
    'INSERT INTO leads (id, name, email) VALUES (?, ?, ?)',
  )
    .bind(id, name, email)
    .run()
}
```

## Input Validation

Always validate with Zod before processing:

```typescript
import { contactSchema } from '@/lib/schemas/contact'

export async function submitLead(formData: FormData) {
  const result = contactSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { error: result.error.flatten() }
  }
  // Process validated data
}
```

## Turnstile Verification

```typescript
import { verifyTurnstile } from '@/lib/turnstile'

const isValid = await verifyTurnstile(token)
if (!isValid) {
  return { error: 'turnstile_failed' }
}
```

## Key Files

| File                         | Purpose           |
| ---------------------------- | ----------------- |
| `src/actions/submit-lead.ts` | Contact form      |
| `src/lib/d1/`                | D1 database utils |
| `src/lib/turnstile.ts`       | CAPTCHA helper    |
