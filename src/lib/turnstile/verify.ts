interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function verifyTurnstile(
  token: string,
  secretKey: string,
): Promise<{ success: boolean; errorCodes?: string[] }> {
  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretKey, response: token }),
      },
    )

    if (!response.ok) {
      return { success: false, errorCodes: ['http_error'] }
    }

    const result: TurnstileVerifyResponse = await response.json()
    return {
      success: result.success,
      errorCodes: result['error-codes'],
    }
  } catch (error) {
    console.error('Turnstile verification failed', error)
    return { success: false, errorCodes: ['network_error'] }
  }
}
