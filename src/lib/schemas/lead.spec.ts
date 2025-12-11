import { describe, expect, it } from 'vitest'

import { leadSchema } from './lead'

describe('leadSchema', () => {
  const validCompleteInput = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    company: 'Test Corp',
    inquiryType: 'product' as const,
    productSlug: 'test-product',
    productName: 'Test Product',
    formPage: '/en/contact',
    message: 'Test message content',
    locale: 'en' as const,
    turnstileToken: 'test-token',
  }

  const validMinimalInput = {
    name: 'Test User',
    email: 'test@example.com',
    locale: 'en' as const,
    turnstileToken: 'test-token',
  }

  describe('valid inputs', () => {
    it('accepts valid complete input', () => {
      const result = leadSchema.safeParse(validCompleteInput)
      expect(result.success).toBe(true)
    })

    it('accepts valid minimal input with required fields only', () => {
      const result = leadSchema.safeParse(validMinimalInput)
      expect(result.success).toBe(true)
    })

    it('allows empty optional fields', () => {
      const input = {
        ...validMinimalInput,
        phone: '',
        company: '',
        message: '',
      }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('name validation', () => {
    it('rejects missing name with empty string', () => {
      const input = { ...validMinimalInput, name: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('name')
      }
    })

    it('rejects short name with less than 2 chars', () => {
      const input = { ...validMinimalInput, name: 'A' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('name')
      }
    })

    it('accepts name with exactly 2 chars', () => {
      const input = { ...validMinimalInput, name: 'AB' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts name with 100 chars', () => {
      const input = { ...validMinimalInput, name: 'A'.repeat(100) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('rejects name exceeding 100 chars', () => {
      const input = { ...validMinimalInput, name: 'A'.repeat(101) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('email validation', () => {
    it('rejects invalid email format', () => {
      const input = { ...validMinimalInput, email: 'invalid' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('email')
      }
    })

    it('rejects missing email', () => {
      const input = { ...validMinimalInput, email: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('email')
      }
    })

    it('accepts valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ]

      for (const email of validEmails) {
        const input = { ...validMinimalInput, email }
        const result = leadSchema.safeParse(input)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('locale validation', () => {
    it('rejects invalid locale', () => {
      const input = { ...validMinimalInput, locale: 'xx' as const }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('locale')
      }
    })

    it('accepts all valid locales', () => {
      const validLocales = ['en', 'zh', 'es', 'ar'] as const

      for (const locale of validLocales) {
        const input = { ...validMinimalInput, locale }
        const result = leadSchema.safeParse(input)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('message validation', () => {
    it('rejects message exceeding 5000 chars', () => {
      const input = { ...validMinimalInput, message: 'x'.repeat(5001) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('message')
      }
    })

    it('accepts message with exactly 5000 chars', () => {
      const input = { ...validMinimalInput, message: 'x'.repeat(5000) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts empty message', () => {
      const input = { ...validMinimalInput, message: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('phone validation', () => {
    it('rejects phone exceeding 20 chars', () => {
      const input = { ...validMinimalInput, phone: '1'.repeat(21) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('phone')
      }
    })

    it('accepts phone with exactly 20 chars', () => {
      const input = { ...validMinimalInput, phone: '1'.repeat(20) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts empty phone', () => {
      const input = { ...validMinimalInput, phone: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('optional fields', () => {
    it('accepts empty company', () => {
      const input = { ...validMinimalInput, company: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('rejects company exceeding 200 chars', () => {
      const input = { ...validMinimalInput, company: 'A'.repeat(201) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('accepts valid inquiryType values', () => {
      const types = ['product', 'agency', 'other'] as const

      for (const inquiryType of types) {
        const input = { ...validMinimalInput, inquiryType }
        const result = leadSchema.safeParse(input)
        expect(result.success).toBe(true)
      }
    })

    it('accepts empty inquiryType', () => {
      const input = { ...validMinimalInput, inquiryType: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts productSlug up to 200 chars', () => {
      const input = { ...validMinimalInput, productSlug: 'a'.repeat(200) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('rejects productSlug exceeding 200 chars', () => {
      const input = { ...validMinimalInput, productSlug: 'a'.repeat(201) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('accepts productName up to 200 chars', () => {
      const input = { ...validMinimalInput, productName: 'A'.repeat(200) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it('accepts formPage up to 500 chars', () => {
      const input = { ...validMinimalInput, formPage: '/'.repeat(500) }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })

  describe('turnstileToken validation', () => {
    it('rejects empty turnstileToken', () => {
      const input = { ...validMinimalInput, turnstileToken: '' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('turnstileToken')
      }
    })

    it('accepts valid turnstileToken', () => {
      const input = { ...validMinimalInput, turnstileToken: 'valid-token' }
      const result = leadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })
  })
})
