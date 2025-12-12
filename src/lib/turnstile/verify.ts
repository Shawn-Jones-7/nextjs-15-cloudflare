import { FetchRetryError, fetchWithRetry } from '@/lib/api/fetch-with-retry'

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

/**
 * Verify Turnstile CAPTCHA token with Cloudflare.
 * Uses 5s timeout and 1 retry for network resilience on edge.
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  try {
    const result = await fetchWithRetry<TurnstileVerifyResponse>(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: token }),
      },
      { timeoutMs: 5000, maxRetries: 1 },
    )

    return {
      success: result.success,
      errorCodes: result['error-codes'],
    }
  } catch (error) {
    if (error instanceof FetchRetryError) {
      console.error(
        'Turnstile verification failed:',
        error.classification,
        error.message,
      )
      return { success: false, errorCodes: [error.classification] }
    }
    console.error('Turnstile verification failed', error)
    return { success: false, errorCodes: ['unknown_error'] }
  }
}
