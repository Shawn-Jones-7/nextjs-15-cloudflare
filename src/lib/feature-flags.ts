/**
 * Feature Flags
 *
 * Configuration-driven feature toggles for optional functionality.
 * Features are enabled/disabled based on environment variables.
 */

export const FEATURE_FLAGS = {
  /**
   * WhatsApp floating button and product inquiry CTA.
   * Enabled when NEXT_PUBLIC_WHATSAPP_NUMBER is set.
   */
  ENABLE_WHATSAPP_CHAT:
    typeof process.env.NEXT_PUBLIC_WHATSAPP_NUMBER === 'string' &&
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.length > 0,
} as const

/**
 * Get the configured WhatsApp number.
 * Returns undefined if not configured or empty.
 */
export function getWhatsAppNumber(): string | undefined {
  const value = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim()
  return value && value.length > 0 ? value : undefined
}

/**
 * Build a WhatsApp chat URL with optional prefilled message.
 * Uses the official wa.me format for WhatsApp Business.
 *
 * @param phoneNumber - Phone number with country code (e.g., +1234567890)
 * @param message - Optional prefilled message
 * @returns WhatsApp URL or undefined if phone number is invalid
 */
export function buildWhatsAppUrl(
  phoneNumber: string,
  message?: string,
): string | undefined {
  // Normalize: trim and strip all non-digit characters
  const cleanNumber = phoneNumber.trim().replaceAll(/\D/g, '')

  if (!/^\d{10,}$/.test(cleanNumber)) {
    return undefined
  }

  const baseUrl = `https://wa.me/${cleanNumber}`

  if (message) {
    const encodedMessage = encodeURIComponent(message)
    return `${baseUrl}?text=${encodedMessage}`
  }

  return baseUrl
}
