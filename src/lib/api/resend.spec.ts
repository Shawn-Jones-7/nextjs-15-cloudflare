import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendLeadNotification } from './resend'
import type { Lead } from '@/lib/schemas/lead'

describe('sendLeadNotification', () => {
  const mockLead: Lead = {
    id: 'test-id-123',
    locale: 'en',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    inquiryType: 'product',
    productSlug: 'widget-pro',
    productName: 'Widget Pro',
    formPage: '/contact',
    message: 'I am interested in your products.',
    createdAt: Date.now(),
    status: 'pending',
  }

  const sendOptions = {
    lead: mockLead,
    apiKey: 'test-api-key',
    fromEmail: 'noreply@test.com',
    toEmail: 'admin@test.com',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends email successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-id-123' }),
    })

    const result = await sendLeadNotification(sendOptions)

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('handles API error response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () =>
        Promise.resolve({
          error: { message: 'Invalid email address' },
        }),
    })

    const result = await sendLeadNotification(sendOptions)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid email address')
  })

  it('handles network failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await expect(sendLeadNotification(sendOptions)).rejects.toThrow(
      'Network error',
    )
  })

  it('constructs correct request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-id-123' }),
    })
    global.fetch = mockFetch

    await sendLeadNotification(sendOptions)

    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)

    expect(body.from).toBe('noreply@test.com')
    expect(body.to).toBe('admin@test.com')
    expect(body.subject).toBe('New Lead: John Doe from Acme Corp')
    expect(body.html).toContain('John Doe')
    expect(body.html).toContain('john@example.com')
    expect(body.html).toContain('Acme Corp')
  })

  it('uses correct Authorization header', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-id-123' }),
    })
    global.fetch = mockFetch

    await sendLeadNotification(sendOptions)

    const callArgs = mockFetch.mock.calls[0]
    expect(callArgs[1].headers.Authorization).toBe('Bearer test-api-key')
  })

  it('handles response with error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          error: { message: 'Rate limit exceeded' },
        }),
    })

    const result = await sendLeadNotification(sendOptions)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Rate limit exceeded')
  })

  it('escapes HTML in email content', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'email-id-123' }),
    })
    global.fetch = mockFetch

    const leadWithHtml: Lead = {
      ...mockLead,
      name: '<script>alert("XSS")</script>',
      message: 'Test & <b>bold</b>',
    }

    await sendLeadNotification({
      ...sendOptions,
      lead: leadWithHtml,
    })

    const callArgs = mockFetch.mock.calls[0]
    const body = JSON.parse(callArgs[1].body)

    expect(body.html).toContain('&lt;script&gt;')
    expect(body.html).toContain('&amp;')
    expect(body.html).toContain('&lt;b&gt;')
  })
})
