import type { Lead } from '@/lib/schemas/lead'

import { FetchRetryError, fetchWithRetry } from './fetch-with-retry'

interface AirtableSyncOptions {
  lead: Lead
  apiKey: string
  baseId: string
  tableName: string
}

interface AirtableResponse {
  id?: string
  error?: { type: string; message: string }
}

/** Airtable API timeout: 10s */
const AIRTABLE_TIMEOUT_MS = 10_000

/**
 * Sync lead data to Airtable.
 * Includes automatic retry with exponential backoff for transient failures.
 */
export async function syncLeadToAirtable({
  lead,
  apiKey,
  baseId,
  tableName,
}: AirtableSyncOptions): Promise<{
  success: boolean
  recordId?: string
  error?: string
}> {
  const fields = buildAirtableFields(lead)

  try {
    const result = await fetchWithRetry<AirtableResponse>(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ fields }),
      },
      { timeoutMs: AIRTABLE_TIMEOUT_MS },
    )

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, recordId: result.id }
  } catch (error) {
    if (error instanceof FetchRetryError) {
      const apiError = extractAirtableError(error.responseBody)
      return { success: false, error: apiError ?? error.message }
    }
    throw error
  }
}

function buildAirtableFields(lead: Lead): Record<string, string> {
  const fields: Record<string, string> = {
    'Lead ID': lead.id,
    Name: lead.name,
    Email: lead.email,
    Phone: lead.phone ?? '',
    Company: lead.company ?? '',
    Message: lead.message ?? '',
    Locale: lead.locale,
    Status: lead.status,
    'Created At': new Date(lead.createdAt).toISOString(),
  }

  if (lead.inquiryType) fields['Inquiry Type'] = lead.inquiryType
  if (lead.productName) fields['Product Name'] = lead.productName
  if (lead.productSlug) fields['Product Slug'] = lead.productSlug
  if (lead.formPage) fields['Form Page'] = lead.formPage

  return fields
}

function extractAirtableError(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined
  const error = (body as { error?: { message?: string } }).error
  return error?.message
}
