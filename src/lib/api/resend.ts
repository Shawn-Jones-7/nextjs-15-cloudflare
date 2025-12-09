import type { Lead } from '@/lib/schemas/lead';

interface SendEmailOptions {
  lead: Lead;
  apiKey: string;
  fromEmail: string;
  toEmail: string;
}

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

export async function sendLeadNotification({
  lead,
  apiKey,
  fromEmail,
  toEmail,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: toEmail,
      subject: `New Lead: ${lead.name} from ${lead.company ?? 'N/A'}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.name)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.phone ?? '-')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.company ?? '-')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Inquiry Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.inquiryType ?? '-')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Product</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.productName ?? '-')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Form Page</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.formPage ?? '-')}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Locale</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${lead.locale}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(lead.message ?? '').replaceAll('\n', '<br>')}</td></tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">Lead ID: ${lead.id} | Submitted at: ${new Date(lead.createdAt).toISOString()}</p>
      `,
    }),
  });

  const result: ResendResponse = await response.json();

  if (!response.ok || result.error) {
    return { success: false, error: result.error?.message ?? 'Failed to send email' };
  }

  return { success: true };
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
