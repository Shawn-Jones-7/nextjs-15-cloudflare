/**
 * Turnstile API Mock
 *
 * Mock factory for Cloudflare Turnstile verification API responses.
 */

import { vi, type Mock } from 'vitest'

export interface TurnstileVerifyResponse {
  success: boolean
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
  action?: string
  cdata?: string
}

export interface CreateTurnstileFetchMockOptions {
  delay?: number
  throwError?: boolean
  errorMessage?: string
}

/**
 * Creates a mock fetch function for Turnstile verification
 */
export function createTurnstileFetchMock(
  response: TurnstileVerifyResponse,
  options: CreateTurnstileFetchMockOptions = {},
): Mock {
  const { delay = 0, throwError = false, errorMessage = 'Network error' } = options

  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (throwError) {
      throw new Error(errorMessage)
    }

    return {
      ok: true,
      status: 200,
      json: async () => response,
    }
  })
}

/**
 * Pre-built Turnstile response scenarios
 */
export const turnstileResponses = {
  success: {
    success: true,
    challenge_ts: '2025-01-01T00:00:00.000Z',
    hostname: 'example.com',
  } satisfies TurnstileVerifyResponse,

  failure: {
    success: false,
    'error-codes': ['invalid-input-response'],
  } satisfies TurnstileVerifyResponse,

  timeout: {
    success: false,
    'error-codes': ['timeout-or-duplicate'],
  } satisfies TurnstileVerifyResponse,

  missingSecret: {
    success: false,
    'error-codes': ['missing-input-secret'],
  } satisfies TurnstileVerifyResponse,

  invalidSecret: {
    success: false,
    'error-codes': ['invalid-input-secret'],
  } satisfies TurnstileVerifyResponse,
}

/**
 * Helper to create a successful Turnstile mock
 */
export function mockTurnstileSuccess(): Mock {
  return createTurnstileFetchMock(turnstileResponses.success)
}

/**
 * Helper to create a failed Turnstile mock
 */
export function mockTurnstileFailure(): Mock {
  return createTurnstileFetchMock(turnstileResponses.failure)
}

/**
 * Helper to create a network error Turnstile mock
 */
export function mockTurnstileNetworkError(): Mock {
  return createTurnstileFetchMock(turnstileResponses.failure, {
    throwError: true,
    errorMessage: 'Network error',
  })
}
