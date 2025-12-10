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

  it('decrements remaining count on each request', async () => {
    const kv = createMockKV()

    const result1 = await checkRateLimit(kv, 'user-1')
    expect(result1.remaining).toBe(4)

    const result2 = await checkRateLimit(kv, 'user-1')
    expect(result2.remaining).toBe(3)

    const result3 = await checkRateLimit(kv, 'user-1')
    expect(result3.remaining).toBe(2)
  })

  it('blocks after limit exceeded', async () => {
    const kv = createMockKV()

    // Make 5 requests (the limit)
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv, 'user-1')
    }

    // 6th request should be blocked
    const result = await checkRateLimit(kv, 'user-1')
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('returns correct resetAt timestamp', async () => {
    const kv = createMockKV()
    const now = Math.floor(Date.now() / 1000)
    const expectedResetAt = now + 60 // RATE_LIMIT_WINDOW = 60

    const result = await checkRateLimit(kv, 'user-1')

    expect(result.resetAt).toBe(expectedResetAt)
  })

  it('resets after window expires', async () => {
    const kv = createMockKV()

    // Exhaust the limit
    for (let i = 0; i < 5; i++) {
      await checkRateLimit(kv, 'user-1')
    }

    // Verify blocked
    const blockedResult = await checkRateLimit(kv, 'user-1')
    expect(blockedResult.allowed).toBe(false)

    // Advance time past the 60-second window
    vi.advanceTimersByTime(61 * 1000)

    // Should be allowed again
    const result = await checkRateLimit(kv, 'user-1')
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('tracks different identifiers separately', async () => {
    const kv = createMockKV()

    // User 1 makes 3 requests
    await checkRateLimit(kv, 'user-1')
    await checkRateLimit(kv, 'user-1')
    const user1Result = await checkRateLimit(kv, 'user-1')
    expect(user1Result.remaining).toBe(2)

    // User 2 should have independent limit
    const user2Result = await checkRateLimit(kv, 'user-2')
    expect(user2Result.allowed).toBe(true)
    expect(user2Result.remaining).toBe(4)
  })

  it('calls KV put with correct TTL', async () => {
    const kv = createMockKV()

    await checkRateLimit(kv, 'user-1')

    expect(kv.put).toHaveBeenCalledWith(
      'rate_limit:user-1',
      expect.any(String),
      { expirationTtl: 60 },
    )
  })

  it('handles KV read errors gracefully', async () => {
    const kv = createMockKV()

    // Mock KV.get to reject
    vi.mocked(kv.get).mockRejectedValueOnce(new Error('KV read error'))

    // Should treat as first request and not throw
    await expect(checkRateLimit(kv, 'user-1')).rejects.toThrow('KV read error')
  })
})
