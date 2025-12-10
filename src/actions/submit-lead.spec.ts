import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createFormData } from '@/tests/fixtures/forms'
import {
  createMockD1,
  createMockEnv,
  createMockKV,
  type MockCloudflareEnv,
} from '@/tests/mocks/cloudflare'
import {
  mockTurnstileFailure,
  mockTurnstileSuccess,
} from '@/tests/mocks/turnstile'

// Mock modules before imports
vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn(() => Promise.resolve('en')),
}))

vi.mock('@/lib/d1/client', () => ({
  insertLead: vi.fn(),
  getLeadById: vi.fn(),
  updateLeadStatus: vi.fn(),
}))

vi.mock('@/lib/api/resend', () => ({
  sendLeadNotification: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/turnstile/verify', () => ({
  verifyTurnstile: vi.fn(),
}))

// Import after mocks
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getLocale } from 'next-intl/server'

import { sendLeadNotification } from '@/lib/api/resend'
import { getLeadById, insertLead, updateLeadStatus } from '@/lib/d1/client'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile/verify'

import { submitLead } from './submit-lead'

describe('submitLead', () => {
  let mockEnv: MockCloudflareEnv

  beforeEach(() => {
    vi.clearAllMocks()

    mockEnv = createMockEnv({
      CONTACT_FORM_D1: createMockD1(),
      NEXT_INC_CACHE_KV: createMockKV(),
      TURNSTILE_SECRET_KEY: 'test-turnstile-secret',
      RESEND_API_KEY: 'test-resend-api-key',
      RESEND_FROM_EMAIL: 'noreply@test.com',
      RESEND_TO_EMAIL: 'admin@test.com',
    })

    vi.mocked(getCloudflareContext).mockResolvedValue({ env: mockEnv })
    vi.mocked(getLocale).mockResolvedValue('en')

    // Default mocks for successful flow
    vi.mocked(verifyTurnstile).mockResolvedValue({ success: true })
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() / 1000 + 60,
    })
    vi.mocked(insertLead).mockResolvedValue('test-lead-id-123')
    vi.mocked(getLeadById).mockResolvedValue({
      id: 'test-lead-id-123',
      name: 'Test User',
      email: 'test@example.com',
      locale: 'en',
      message: '',
      createdAt: Date.now(),
      status: 'pending',
    })
    vi.mocked(sendLeadNotification).mockResolvedValue({ success: true })
    vi.mocked(updateLeadStatus).mockResolvedValue()

    // Mock global fetch for Turnstile
    global.fetch = mockTurnstileSuccess()
  })

  describe('Validation', () => {
    it('returns validation_error for invalid email', async () => {
      const formData = createFormData({ email: 'invalid-email' })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('validation_error')
      expect(result.errors).toBeDefined()
      expect(result.errors?.email).toBeDefined()
    })

    it('returns validation_error for missing name', async () => {
      const formData = createFormData({ name: '' })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('validation_error')
      expect(result.errors).toBeDefined()
      expect(result.errors?.name).toBeDefined()
    })

    it('returns validation_error for missing turnstile token', async () => {
      const formData = createFormData()
      formData.delete('cf-turnstile-response')

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('validation_error')
      expect(result.errors).toBeDefined()
      expect(result.errors?.turnstileToken).toBeDefined()
    })

    it('returns validation_error for name too short', async () => {
      const formData = createFormData({ name: 'A' })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('validation_error')
      expect(result.errors?.name).toBeDefined()
    })
  })

  describe('Turnstile Verification', () => {
    it('returns turnstile_failed when verification fails', async () => {
      global.fetch = mockTurnstileFailure()
      vi.mocked(verifyTurnstile).mockResolvedValue({
        success: false,
        errorCodes: ['invalid-input-response'],
      })

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('turnstile_failed')
      expect(verifyTurnstile).toHaveBeenCalledWith(
        'test-token',
        'test-turnstile-secret',
      )
    })

    it('calls verifyTurnstile with correct parameters', async () => {
      const formData = createFormData({ turnstileToken: 'custom-token' })

      await submitLead({}, formData)

      expect(verifyTurnstile).toHaveBeenCalledWith(
        'custom-token',
        'test-turnstile-secret',
      )
    })
  })

  describe('Rate Limiting', () => {
    it('returns rate_limited when limit exceeded', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() / 1000 + 60,
      })

      const formData = createFormData({ email: 'test@example.com' })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('rate_limited')
      expect(checkRateLimit).toHaveBeenCalledWith(
        mockEnv.NEXT_INC_CACHE_KV,
        'lead:test@example.com',
      )
    })

    it('normalizes email to lowercase for rate limiting', async () => {
      const formData = createFormData({ email: 'Test@EXAMPLE.COM' })

      await submitLead({}, formData)

      expect(checkRateLimit).toHaveBeenCalledWith(
        mockEnv.NEXT_INC_CACHE_KV,
        'lead:test@example.com',
      )
    })
  })

  describe('Successful Submission', () => {
    it('returns success on valid submission', async () => {
      const formData = createFormData({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(true)
      expect(result.message).toBe('success')
    })

    it('stores lead in D1 database', async () => {
      const formData = createFormData({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Test Corp',
        inquiryType: 'product',
        message: 'I am interested',
      })

      await submitLead({}, formData)

      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Test Corp',
          inquiryType: 'product',
          message: 'I am interested',
          locale: 'en',
        }),
      )
    })

    it('sends notification email via Resend', async () => {
      const formData = createFormData()

      await submitLead({}, formData)

      expect(sendLeadNotification).toHaveBeenCalledWith({
        lead: expect.objectContaining({
          id: 'test-lead-id-123',
          name: 'Test User',
          email: 'test@example.com',
        }),
        apiKey: 'test-resend-api-key',
        fromEmail: 'noreply@test.com',
        toEmail: 'admin@test.com',
      })
    })

    it('updates lead status to processed after email sent', async () => {
      const formData = createFormData()

      await submitLead({}, formData)

      expect(updateLeadStatus).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        'test-lead-id-123',
        'processed',
      )
    })
  })

  describe('Error Handling', () => {
    it('returns server_error on D1 insertLead failure', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(insertLead).mockRejectedValue(new Error('D1 error'))

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('server_error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'submitLead failed',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('Resend failure is caught and logged, but returns success (lead saved)', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(sendLeadNotification).mockRejectedValue(
        new Error('Resend API error'),
      )

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(true)
      expect(result.message).toBe('success')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Email notification failed:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('lead status updated to failed on server_error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // Lead is inserted successfully but then an error occurs
      vi.mocked(insertLead).mockResolvedValue('test-lead-id-456')
      vi.mocked(getLeadById).mockRejectedValue(new Error('D1 error'))

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('server_error')
      expect(updateLeadStatus).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        'test-lead-id-456',
        'failed',
      )

      consoleErrorSpy.mockRestore()
    })

    it('handles updateLeadStatus failure gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(insertLead).mockResolvedValue('test-lead-id-789')
      vi.mocked(getLeadById).mockRejectedValue(new Error('D1 error'))
      vi.mocked(updateLeadStatus).mockRejectedValue(
        new Error('Update status failed'),
      )

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('server_error')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Locale Handling', () => {
    it('locale is correctly passed from getLocale()', async () => {
      vi.mocked(getLocale).mockResolvedValue('zh')

      const formData = createFormData()

      await submitLead({}, formData)

      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          locale: 'zh',
        }),
      )
    })

    it('uses getLocale result even when locale is in formData', async () => {
      vi.mocked(getLocale).mockResolvedValue('es')

      const formData = createFormData({ locale: 'ar' })

      await submitLead({}, formData)

      // getLocale result should override formData
      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          locale: 'es',
        }),
      )
    })
  })

  describe('Optional Fields', () => {
    it('handles submission with only required fields', async () => {
      const formData = createFormData({
        name: 'Minimal User',
        email: 'minimal@example.com',
      })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(true)
      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          name: 'Minimal User',
          email: 'minimal@example.com',
          phone: undefined,
          company: undefined,
          inquiryType: undefined,
          productSlug: undefined,
          productName: undefined,
          formPage: undefined,
          message: '',
        }),
      )
    })

    it('handles submission with all optional fields', async () => {
      const formData = createFormData({
        name: 'Complete User',
        email: 'complete@example.com',
        phone: '+9876543210',
        company: 'Complete Corp',
        inquiryType: 'agency',
        productSlug: 'test-product',
        productName: 'Test Product Name',
        formPage: '/en/contact',
        message: 'Complete message',
      })

      const result = await submitLead({}, formData)

      expect(result.success).toBe(true)
      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          name: 'Complete User',
          email: 'complete@example.com',
          phone: '+9876543210',
          company: 'Complete Corp',
          inquiryType: 'agency',
          productSlug: 'test-product',
          productName: 'Test Product Name',
          formPage: '/en/contact',
          message: 'Complete message',
        }),
      )
    })
  })

  describe('Email Normalization', () => {
    it('normalizes email to lowercase in database', async () => {
      const formData = createFormData({ email: 'TEST@EXAMPLE.COM' })

      await submitLead({}, formData)

      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          email: 'test@example.com',
        }),
      )
    })

    it('preserves mixed case in original formData', async () => {
      const formData = createFormData({ email: 'Test@Example.COM' })

      // Verify formData is not mutated
      expect(formData.get('email')).toBe('Test@Example.COM')

      await submitLead({}, formData)

      // But stored as lowercase
      expect(insertLead).toHaveBeenCalledWith(
        mockEnv.CONTACT_FORM_D1,
        expect.objectContaining({
          email: 'test@example.com',
        }),
      )
    })
  })

  describe('KV Configuration', () => {
    it('returns server_error when KV namespace not configured', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      vi.mocked(getCloudflareContext).mockResolvedValue({
        env: {
          ...mockEnv,
          // eslint-disable-next-line unicorn/no-null
          NEXT_INC_CACHE_KV: null as unknown as KVNamespace,
        },
      })

      const formData = createFormData()

      const result = await submitLead({}, formData)

      expect(result.success).toBe(false)
      expect(result.message).toBe('server_error')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'submitLead failed',
        expect.objectContaining({
          message: 'KV namespace not configured',
        }),
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
