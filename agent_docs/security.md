# Security Implementation

## Principles

- **Defense in Depth**: Multiple layers of security
- **Least Privilege**: Minimum necessary permissions
- **Zero Trust**: Verify everything, trust no input

## Input Validation

All user input must use Zod schema validation:

```typescript
// src/lib/schemas/contact.ts

import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
})
```

## Cloudflare Turnstile

CAPTCHA protection on forms:

```typescript
// Server-side verification
import { verifyTurnstile } from '@/lib/turnstile'

const isValid = await verifyTurnstile(token)
if (!isValid) {
  return { error: 'turnstile_failed' }
}
```

## Rate Limiting

```typescript
// src/lib/rate-limit.ts
// 5 requests per minute per IP
```

## XSS Prevention

- **Never** use unfiltered `dangerouslySetInnerHTML`
- URLs must validate protocol (only `https://` or `/`)

## Environment Variables

**Never commit these**:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `AIRTABLE_API_KEY`

Validated at build time via `src/env.ts` (arktype).

## Security Headers

Not currently configured. Add via Next.js middleware or Cloudflare Rules when needed:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Checklist

- [ ] All form input validated with Zod
- [ ] Turnstile enabled on public forms
- [ ] Rate limiting on API endpoints
- [ ] No secrets in client bundles
