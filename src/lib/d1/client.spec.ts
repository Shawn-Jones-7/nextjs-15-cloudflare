import type { LeadInput } from '@/lib/schemas/lead'
import type { MockD1PreparedStatement } from '@/tests/mocks/cloudflare'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createMockD1 } from '@/tests/mocks/cloudflare'

import { getLeadById, insertLead, updateLeadStatus } from './client'

describe('D1 Client', () => {
  let mockD1: ReturnType<typeof createMockD1>

  beforeEach(() => {
    mockD1 = createMockD1()
    vi.clearAllMocks()
  })

  describe('insertLead', () => {
    const leadInput: Omit<LeadInput, 'turnstileToken'> = {
      locale: 'en',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Acme Corp',
      inquiryType: 'product',
      productSlug: 'widget-pro',
      productName: 'Widget Pro',
      formPage: '/contact',
      message: 'Interested in products',
    }

    it('inserts lead successfully', async () => {
      const id = await insertLead(mockD1, leadInput)

      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
      expect(mockD1.prepare).toHaveBeenCalled()
    })

    it('handles insert failure', async () => {
      // Mock prepare to return a statement that fails on run
      vi.mocked(mockD1.prepare).mockImplementationOnce(() => {
        const statement = {
          bind: vi.fn().mockReturnThis(),
          run: vi.fn().mockRejectedValue(new Error('DB error')),
          first: vi.fn(),
          all: vi.fn(),
          raw: vi.fn(),
          _boundValues: [],
        } as unknown as MockD1PreparedStatement
        return statement
      })

      await expect(insertLead(mockD1, leadInput)).rejects.toThrow('DB error')
    })

    it('binds parameters in correct order', async () => {
      await insertLead(mockD1, leadInput)

      const lastStatement = mockD1._lastStatement
      expect(lastStatement).not.toBeNull()

      const boundValues = lastStatement!._boundValues
      // Check key values are bound (id is generated, so skip index 0)
      expect(boundValues[1]).toBe('en') // locale
      expect(boundValues[2]).toBe('John Doe') // name
      expect(boundValues[3]).toBe('john@example.com') // email
      expect(boundValues[4]).toBe('+1234567890') // phone
      expect(boundValues[5]).toBe('Acme Corp') // company
      expect(boundValues[6]).toBe('Interested in products') // message
    })

    it('converts empty strings to null for optional fields', async () => {
      const minimalInput: Omit<LeadInput, 'turnstileToken'> = {
        locale: 'en',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '',
        company: '',
        message: '',
      }

      await insertLead(mockD1, minimalInput)

      const lastStatement = mockD1._lastStatement
      const boundValues = lastStatement!._boundValues

      expect(boundValues[4]).toBe(null) // phone

      expect(boundValues[5]).toBe(null) // company
      expect(boundValues[6]).toBe('') // message (always string)
    })

    it('handles undefined optional fields', async () => {
      const minimalInput: Omit<LeadInput, 'turnstileToken'> = {
        locale: 'en',
        name: 'Jane Doe',
        email: 'jane@example.com',
      }

      await insertLead(mockD1, minimalInput)

      const lastStatement = mockD1._lastStatement
      const boundValues = lastStatement!._boundValues

      expect(boundValues[4]).toBe(null) // phone

      expect(boundValues[5]).toBe(null) // company
    })
  })

  describe('getLeadById', () => {
    it('returns lead when found', async () => {
      const mockRow = {
        id: 'test-id-123',
        locale: 'en',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Acme Corp',
        inquiry_type: 'product',
        product_slug: 'widget-pro',
        product_name: 'Widget Pro',
        form_page: '/contact',
        message: 'Test message',
        created_at: 1_704_067_200_000,
        status: 'pending',
      }

      mockD1._setRows([mockRow])

      const result = await getLeadById(mockD1, 'test-id-123')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('test-id-123')
      expect(result?.name).toBe('John Doe')
      expect(result?.email).toBe('john@example.com')
      expect(result?.locale).toBe('en')
    })

    it('returns null when lead not found', async () => {
      mockD1._setRows([])

      const result = await getLeadById(mockD1, 'non-existent-id')

      expect(result).toBe(null)
    })

    it('converts null fields to undefined', async () => {
      const mockRow = {
        id: 'test-id-123',
        locale: 'en',
        name: 'John Doe',
        email: 'john@example.com',

        phone: null,

        company: null,

        inquiry_type: null,

        product_slug: null,

        product_name: null,

        form_page: null,

        message: null,
        created_at: 1_704_067_200_000,
        status: 'pending',
      }

      mockD1._setRows([mockRow])

      const result = await getLeadById(mockD1, 'test-id-123')

      expect(result?.phone).toBeUndefined()
      expect(result?.company).toBeUndefined()
      expect(result?.inquiryType).toBeUndefined()
      expect(result?.message).toBe('')
    })

    it('handles database errors', async () => {
      // Mock prepare to return a statement that fails on first
      vi.mocked(mockD1.prepare).mockImplementationOnce(() => {
        const statement = {
          bind: vi.fn().mockReturnThis(),
          first: vi.fn().mockRejectedValue(new Error('DB error')),
          run: vi.fn(),
          all: vi.fn(),
          raw: vi.fn(),
          _boundValues: [],
        } as unknown as MockD1PreparedStatement
        return statement
      })

      await expect(getLeadById(mockD1, 'test-id')).rejects.toThrow('DB error')
    })
  })

  describe('updateLeadStatus', () => {
    it('updates lead status successfully', async () => {
      await updateLeadStatus(mockD1, 'test-id-123', 'processed')

      expect(mockD1.prepare).toHaveBeenCalled()
      const lastStatement = mockD1._lastStatement
      expect(lastStatement).not.toBeNull()
      expect(lastStatement?._boundValues).toEqual(['processed', 'test-id-123'])
    })

    it('handles update failure', async () => {
      // Mock prepare to return a statement that fails on run
      vi.mocked(mockD1.prepare).mockImplementationOnce(() => {
        const statement = {
          bind: vi.fn().mockReturnThis(),
          run: vi.fn().mockRejectedValue(new Error('Update failed')),
          first: vi.fn(),
          all: vi.fn(),
          raw: vi.fn(),
          _boundValues: [],
        } as unknown as MockD1PreparedStatement
        return statement
      })

      await expect(
        updateLeadStatus(mockD1, 'test-id', 'failed'),
      ).rejects.toThrow('Update failed')
    })
  })
})
