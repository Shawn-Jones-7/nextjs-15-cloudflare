/**
 * Server Action Test Utilities
 *
 * Helpers for testing Next.js Server Actions with mocked Cloudflare environment.
 */

import type { MockCloudflareEnvironment } from '../mocks/cloudflare'

import { vi } from 'vitest'

import { createFormData } from '../fixtures/forms'
import { createMockEnvironment } from '../mocks/cloudflare'

/**
 * Sets up mocks for Server Action testing
 */
export function setupServerActionMocks(
  environmentOverrides: Partial<MockCloudflareEnvironment> = {},
) {
  const mockEnvironment = createMockEnvironment(environmentOverrides)

  // Get the mocked module - using dynamic import pattern for test environment
  const cloudflareModule = vi.mocked(
    require('@opennextjs/cloudflare') as {
      getCloudflareContext: ReturnType<typeof vi.fn>
    },
  )

  // Configure getCloudflareContext to return our mock environment
  cloudflareModule.getCloudflareContext.mockResolvedValue({
    env: mockEnvironment,
    ctx: {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    },
  })

  return mockEnvironment
}

/**
 * Resets all Server Action related mocks
 */
export function resetServerActionMocks() {
  vi.clearAllMocks()
}

/**
 * Creates a FormData and calls a server action
 */
export async function callServerAction<TState, TResult>(
  action: (state: TState, formData: FormData) => Promise<TResult>,
  initialState: TState,
  formDataInput: Parameters<typeof createFormData>[0] = {},
): Promise<TResult> {
  const formData = createFormData(formDataInput)
  return action(initialState, formData)
}

/**
 * Helper to mock successful Turnstile verification for server action tests
 */
export function mockSuccessfulTurnstile() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      }),
    ),
  )
}

/**
 * Helper to mock failed Turnstile verification for server action tests
 */
export function mockFailedTurnstile() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            'error-codes': ['invalid-input-response'],
          }),
      }),
    ),
  )
}

/**
 * Helper to mock network error for server action tests
 */
export function mockNetworkError() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('Network error'))),
  )
}
