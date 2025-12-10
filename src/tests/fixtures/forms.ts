/**
 * FormData Test Fixtures
 *
 * Helper functions for creating FormData objects in tests.
 */

import type { LeadInput } from '@/lib/schemas/lead'

type FormDataInput = Partial<Omit<LeadInput, 'turnstileToken'>> & {
  turnstileToken?: string
}

/**
 * Creates a FormData object with default values and optional overrides
 */
export function createFormData(data: FormDataInput = {}): FormData {
  const formData = new FormData()

  const defaults: Record<string, string> = {
    name: 'Test User',
    email: 'test@example.com',
    'cf-turnstile-response': 'test-token',
  }

  // Apply overrides
  const merged = { ...defaults }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'turnstileToken' && value) {
      merged['cf-turnstile-response'] = value
    } else if (value !== undefined) {
      merged[key] = String(value)
    }
  }

  // Set all values on FormData
  for (const [key, value] of Object.entries(merged)) {
    if (key !== 'turnstileToken') {
      formData.set(key, value)
    }
  }

  return formData
}

/**
 * Pre-built FormData scenarios for common test cases
 */
export const formDataScenarios = {
  /** Valid submission with all required fields */
  valid: () =>
    createFormData({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello, this is a test message.',
    }),

  /** Complete submission with all optional fields */
  complete: () =>
    createFormData({
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Corp',
      inquiryType: 'product',
      productSlug: 'test-product',
      productName: 'Test Product',
      formPage: '/en/contact',
      message: 'Complete test message.',
      locale: 'en',
    }),

  /** Missing name field */
  missingName: () => createFormData({ name: '' }),

  /** Invalid email format */
  invalidEmail: () => createFormData({ email: 'invalid-email' }),

  /** Missing Turnstile token */
  missingTurnstile: () => {
    const fd = createFormData()
    fd.delete('cf-turnstile-response')
    return fd
  },

  /** Short name (below minimum) */
  shortName: () => createFormData({ name: 'A' }),

  /** Message exceeding max length */
  longMessage: () => createFormData({ message: 'x'.repeat(5001) }),

  /** Chinese locale */
  chineseLocale: () =>
    createFormData({
      name: '测试用户',
      email: 'test@example.com',
      locale: 'zh',
    }),

  /** Arabic locale (RTL) */
  arabicLocale: () =>
    createFormData({
      name: 'مستخدم اختبار',
      email: 'test@example.com',
      locale: 'ar',
    }),
}
