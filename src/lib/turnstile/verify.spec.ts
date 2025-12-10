import { beforeEach, describe, expect, it, vi } from 'vitest'

import { verifyTurnstile } from './verify'

describe('verifyTurnstile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success: true for valid token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })

    const result = await verifyTurnstile('valid-token', 'test-secret')

    expect(result.success).toBe(true)
    expect(result.errorCodes).toBeUndefined()
  })

  it('returns success: false for invalid token', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
    })

    const result = await verifyTurnstile('invalid-token', 'test-secret')

    expect(result.success).toBe(false)
    expect(result.errorCodes).toBeDefined()
  })

  it('includes error-codes in failure response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: false,
          'error-codes': ['timeout-or-duplicate', 'invalid-input-secret'],
        }),
    })

    const result = await verifyTurnstile('token', 'test-secret')

    expect(result.success).toBe(false)
    expect(result.errorCodes).toEqual([
      'timeout-or-duplicate',
      'invalid-input-secret',
    ])
  })

  it('handles network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await verifyTurnstile('token', 'test-secret')

    expect(result.success).toBe(false)
    expect(result.errorCodes).toEqual(['network_error'])
  })

  it('handles non-ok HTTP response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    const result = await verifyTurnstile('token', 'test-secret')

    expect(result.success).toBe(false)
    expect(result.errorCodes).toEqual(['http_error'])
  })

  it('calls Cloudflare API with correct parameters', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
    globalThis.fetch = mockFetch

    await verifyTurnstile('test-token-123', 'secret-key-456')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: 'secret-key-456',
          response: 'test-token-123',
        }),
      },
    )
  })
})
