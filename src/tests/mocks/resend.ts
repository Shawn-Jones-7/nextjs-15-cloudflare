import type { Mock } from 'vitest'

import { vi } from 'vitest'

/**
 * Resend Email API Mock
 *
 * Mock factory for Resend email API responses.
 */

export interface ResendEmailResponse {
  id?: string
  error?: { message: string }
}

export interface CreateResendFetchMockOptions {
  status?: number
  delay?: number
  throwError?: boolean
  errorMessage?: string
}

/**
 * Creates a mock fetch function for Resend email API
 */
export function createResendFetchMock(
  response: ResendEmailResponse,
  options: CreateResendFetchMockOptions = {},
): Mock {
  const {
    status = response.error ? 400 : 200,
    delay = 0,
    throwError = false,
    errorMessage = 'Network error',
  } = options

  return vi.fn(async () => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (throwError) {
      throw new Error(errorMessage)
    }

    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
    }
  })
}

/**
 * Pre-built Resend response scenarios
 */
export const resendResponses = {
  success: {
    id: 'email-id-123',
  } satisfies ResendEmailResponse,

  rateLimited: {
    error: { message: 'Rate limit exceeded' },
  } satisfies ResendEmailResponse,

  invalidApiKey: {
    error: { message: 'Invalid API key' },
  } satisfies ResendEmailResponse,

  invalidRecipient: {
    error: { message: 'Invalid recipient address' },
  } satisfies ResendEmailResponse,

  serverError: {
    error: { message: 'Internal server error' },
  } satisfies ResendEmailResponse,
}

/**
 * Helper to create a successful Resend mock
 */
export function mockResendSuccess(): Mock {
  return createResendFetchMock(resendResponses.success)
}

/**
 * Helper to create a rate-limited Resend mock
 */
export function mockResendRateLimited(): Mock {
  return createResendFetchMock(resendResponses.rateLimited, { status: 429 })
}

/**
 * Helper to create an invalid API key Resend mock
 */
export function mockResendInvalidApiKey(): Mock {
  return createResendFetchMock(resendResponses.invalidApiKey, { status: 401 })
}

/**
 * Helper to create a network error Resend mock
 */
export function mockResendNetworkError(): Mock {
  return createResendFetchMock(resendResponses.success, {
    throwError: true,
    errorMessage: 'Network error',
  })
}
