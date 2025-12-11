---
paths: src/queue/**/*.ts, wrangler.toml, src/lib/d1/**/*.ts, src/lib/kv/**/*.ts
---

# Cloudflare Rules

## Bindings

Configured in `wrangler.toml`:

| Type  | Name                 | Purpose            | Status   |
| ----- | -------------------- | ------------------ | -------- |
| D1    | `NEXT_TAG_CACHE_D1`  | Next.js tag cache  | Active   |
| D1    | `CONTACT_FORM_D1`    | Lead submissions   | Active   |
| KV    | `NEXT_INC_CACHE_KV`  | Incremental cache  | Active   |
| Queue | `lead-notifications` | Async lead syncing | Disabled |

**Note**: Queue binding is commented out in `wrangler.toml` (requires Workers Paid plan). Consumer code in `src/queue/consumer.ts` is ready for activation.

## Accessing Bindings

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function handler() {
  // Use { async: true } for Server Actions / SSG routes
  const { env } = await getCloudflareContext({ async: true })

  // D1 Database with prepared statement binding
  await env.CONTACT_FORM_D1.prepare(
    'INSERT INTO leads (id, name, email) VALUES (?, ?, ?)',
  )
    .bind(id, name, email)
    .run()

  // KV Store
  await env.NEXT_INC_CACHE_KV.put('key', 'value', { expirationTtl: 3600 })
  const value = await env.NEXT_INC_CACHE_KV.get('key')

  // Queue
  await env.LEAD_QUEUE.send({ type: 'new_lead', data })
}
```

## D1 Query Methods

```typescript
const db = env.CONTACT_FORM_D1

// Single row
const row = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(id).first()

// All rows with metadata
const { results, meta } = await db.prepare('SELECT * FROM leads').all()

// Batch operations
await db.batch([
  db.prepare('INSERT INTO ...').bind(...),
  db.prepare('UPDATE ...').bind(...),
])
```

## KV Methods

```typescript
const kv = env.NEXT_INC_CACHE_KV

await kv.put('key', 'value') // Set
await kv.put('key', 'value', { expirationTtl: 60 }) // With TTL
const value = await kv.get('key') // Get
await kv.delete('key') // Delete
const keys = await kv.list({ prefix: 'user:' }) // List with prefix
```

## Queue Consumer

`src/queue/consumer.ts` handles async processing:

```typescript
export default {
  async queue(batch: MessageBatch, env: Env) {
    for (const message of batch.messages) {
      try {
        await processMessage(message.body, env)
        message.ack() // Acknowledge success
      } catch (error) {
        message.retry() // Retry on failure
      }
    }
  },
}
```

## Key Files

| File                    | Purpose               |
| ----------------------- | --------------------- |
| `wrangler.toml`         | Binding definitions   |
| `src/lib/d1/`           | D1 database helpers   |
| `src/queue/consumer.ts` | Queue message handler |
