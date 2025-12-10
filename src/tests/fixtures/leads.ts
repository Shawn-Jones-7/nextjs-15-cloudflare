/**
 * Lead Test Fixtures
 *
 * Factory functions and pre-built scenarios for Lead entity testing.
 */

import type { Lead, LeadInput } from '@/lib/schemas/lead'

/**
 * Valid lead input without turnstileToken (for schema tests)
 */
export const validLeadInput: Omit<LeadInput, 'turnstileToken'> = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  company: 'Test Corp',
  inquiryType: 'product',
  productSlug: 'test-product',
  productName: 'Test Product',
  formPage: '/en/contact',
  message: 'Test message content',
  locale: 'en',
}

/**
 * Creates a lead input with optional overrides
 */
export function createLeadInput(
  overrides: Partial<Omit<LeadInput, 'turnstileToken'>> = {},
): Omit<LeadInput, 'turnstileToken'> {
  return { ...validLeadInput, ...overrides }
}

/**
 * Creates a complete lead input including turnstileToken
 */
export function createFullLeadInput(
  overrides: Partial<LeadInput> = {},
): LeadInput {
  return {
    ...validLeadInput,
    turnstileToken: 'test-turnstile-token',
    ...overrides,
  }
}

/**
 * Creates a persisted Lead entity
 */
export function createLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-uuid-1234',
    ...validLeadInput,
    createdAt: Date.now(),
    status: 'pending',
    ...overrides,
  }
}

/**
 * Invalid lead input scenarios for validation testing
 */
export const invalidLeadInputs = {
  missingName: createLeadInput({ name: '' }),
  shortName: createLeadInput({ name: 'A' }),
  invalidEmail: createLeadInput({ email: 'invalid' }),
  missingEmail: createLeadInput({ email: '' }),
  longMessage: createLeadInput({ message: 'x'.repeat(5001) }),
  longPhone: createLeadInput({ phone: '1'.repeat(21) }),
  longCompany: createLeadInput({ company: 'x'.repeat(201) }),
} as const

/**
 * Creates a minimal valid lead input (required fields only)
 */
export function createMinimalLeadInput(): Omit<LeadInput, 'turnstileToken'> {
  return {
    name: 'Test User',
    email: 'test@example.com',
    locale: 'en',
  }
}
