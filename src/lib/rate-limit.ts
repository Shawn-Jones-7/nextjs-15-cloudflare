const DEFAULT_WINDOW = 60 // seconds
const DEFAULT_MAX = 5 // requests per window

export interface RateLimitConfig {
  window?: number
  max?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * KV-based fixed-window rate limiter.
 *
 * LIMITATION: This implementation uses a non-atomic read-modify-write pattern.
 * Under high concurrency, race conditions may allow slightly more requests
 * than the configured limit. For strict rate limiting at scale, consider
 * using Cloudflare's Rate Limiting product or a Durable Objects-based approach.
 *
 * @param kv - Cloudflare KV namespace
 * @param identifier - Unique key for rate limiting (e.g., `lead:${email}`)
 * @param config - Optional config overrides (defaults: 60s window, 5 max requests)
 */
export async function checkRateLimit(
  kv: KVNamespace,
  identifier: string,
  config?: RateLimitConfig,
): Promise<RateLimitResult> {
  const window = config?.window ?? DEFAULT_WINDOW
  const max = config?.max ?? DEFAULT_MAX
  const key = `rate_limit:${identifier}`
  const now = Math.floor(Date.now() / 1000)

  const stored = await kv.get<{ count: number; resetAt: number }>(key, 'json')

  if (!stored || now >= stored.resetAt) {
    const resetAt = now + window
    await kv.put(key, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: window,
    })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (stored.count >= max) {
    return { allowed: false, remaining: 0, resetAt: stored.resetAt }
  }

  await kv.put(
    key,
    JSON.stringify({ count: stored.count + 1, resetAt: stored.resetAt }),
    { expirationTtl: stored.resetAt - now },
  )

  return {
    allowed: true,
    remaining: max - stored.count - 1,
    resetAt: stored.resetAt,
  }
}
