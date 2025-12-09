import type { Lead } from '@/lib/schemas/lead';

interface AirtableSyncOptions {
  lead: Lead;
  apiKey: string;
  baseId: string;
  tableName: string;
}

interface AirtableResponse {
  id?: string;
  error?: { type: string; message: string };
}

export async function syncLeadToAirtable({
  lead,
  apiKey,
  baseId,
  tableName,
}: AirtableSyncOptions): Promise<{ success: boolean; recordId?: string; error?: string }> {
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
  };

  if (lead.inquiryType) {
    fields['Inquiry Type'] = lead.inquiryType;
  }
  if (lead.productName) {
    fields['Product Name'] = lead.productName;
  }
  if (lead.productSlug) {
    fields['Product Slug'] = lead.productSlug;
  }
  if (lead.formPage) {
    fields['Form Page'] = lead.formPage;
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ fields }),
    }
  );

  const result: AirtableResponse = await response.json();

  if (!response.ok || result.error) {
    return {
      success: false,
      error: result.error?.message ?? 'Failed to sync to Airtable',
    };
  }

  return { success: true, recordId: result.id };
}
