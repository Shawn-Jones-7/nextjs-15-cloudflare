const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 5;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  identifier: string
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Math.floor(Date.now() / 1000);

  const stored = await kv.get<{ count: number; resetAt: number }>(key, 'json');

  if (!stored || now >= stored.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW;
    await kv.put(key, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }

  if (stored.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: stored.resetAt };
  }

  await kv.put(
    key,
    JSON.stringify({ count: stored.count + 1, resetAt: stored.resetAt }),
    { expirationTtl: stored.resetAt - now }
  );

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - stored.count - 1,
    resetAt: stored.resetAt,
  };
}
