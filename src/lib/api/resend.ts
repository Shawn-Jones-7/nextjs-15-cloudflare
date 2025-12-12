import type { Lead } from '@/lib/schemas/lead'

import { FetchRetryError, fetchWithRetry } from './fetch-with-retry'

interface SendEmailOptions {
  lead: Lead
  apiKey: string
  fromEmail: string
  toEmail: string
}

interface ResendResponse {
  id?: string
  error?: { message: string }
}

/** Email sending timeout: 15s (email APIs can be slower) */
const RESEND_TIMEOUT_MS = 15_000

/**
 * Send lead notification email via Resend API.
 * Includes automatic retry with exponential backoff for transient failures.
 */
export async function sendLeadNotification({
  lead,
  apiKey,
  fromEmail,
  toEmail,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await fetchWithRetry<ResendResponse>(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmail,
          subject: `New Lead: ${lead.name} from ${lead.company ?? 'N/A'}`,
          html: buildEmailHtml(lead),
        }),
      },
      { timeoutMs: RESEND_TIMEOUT_MS },
    )

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof FetchRetryError) {
      const apiError = extractResendError(error.responseBody)
      return { success: false, error: apiError ?? error.message }
    }
    throw error
  }
}

function buildEmailHtml(lead: Lead): string {
  return `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse: collapse; width: 100%;">
      ${tableRow('Name', escapeHtml(lead.name))}
      ${tableRow('Email', `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`)}
      ${tableRow('Phone', escapeHtml(lead.phone ?? '-'))}
      ${tableRow('Company', escapeHtml(lead.company ?? '-'))}
      ${tableRow('Inquiry Type', escapeHtml(lead.inquiryType ?? '-'))}
      ${tableRow('Product', escapeHtml(lead.productName ?? '-'))}
      ${tableRow('Form Page', escapeHtml(lead.formPage ?? '-'))}
      ${tableRow('Locale', lead.locale)}
      ${tableRow('Message', escapeHtml(lead.message ?? '').replaceAll('\n', '<br>'))}
    </table>
    <p style="color: #666; font-size: 12px; margin-top: 16px;">Lead ID: ${lead.id} | Submitted at: ${new Date(lead.createdAt).toISOString()}</p>
  `
}

function tableRow(label: string, value: string): string {
  return `<tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>${label}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`
}

function extractResendError(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined
  const error = (body as { error?: { message?: string } }).error
  return error?.message
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
