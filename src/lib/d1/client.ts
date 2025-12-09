import type { Lead, LeadInput } from '@/lib/schemas/lead'

function toNullable(value?: string): string | null {
  // D1/SQL requires null for empty values (not undefined)
  // eslint-disable-next-line unicorn/no-null
  return value && value.length > 0 ? value : null
}

export async function insertLead(
  db: D1Database,
  data: Omit<LeadInput, 'turnstileToken'>,
): Promise<string> {
  // crypto.randomUUID is available in Cloudflare Workers
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const id = crypto.randomUUID()
  const createdAt = Date.now()
  const message = data.message ?? ''

  await db
    .prepare(
      `INSERT INTO leads (id, locale, name, email, phone, company, message, inquiry_type, product_slug, product_name, form_page, created_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    )
    .bind(
      id,
      data.locale,
      data.name,
      data.email,
      toNullable(data.phone),
      toNullable(data.company),
      message,
      toNullable(data.inquiryType),
      toNullable(data.productSlug),
      toNullable(data.productName),
      toNullable(data.formPage),
      createdAt,
    )
    .run()

  return id
}

export async function getLeadById(
  db: D1Database,
  id: string,
): Promise<Lead | null> {
  const result = await db
    .prepare('SELECT * FROM leads WHERE id = ?')
    .bind(id)
    .first<{
      id: string
      locale: string
      name: string
      email: string
      phone: string | null
      company: string | null
      inquiry_type: string | null
      product_slug: string | null
      product_name: string | null
      form_page: string | null
      message: string | null
      created_at: number
      status: string
    }>()

  // D1.first() returns null when no row is found
  // eslint-disable-next-line unicorn/no-null
  if (!result) return null

  return {
    id: result.id,
    locale: result.locale as Lead['locale'],
    name: result.name,
    email: result.email,
    phone: result.phone ?? undefined,
    company: result.company ?? undefined,
    inquiryType: (result.inquiry_type as Lead['inquiryType']) ?? undefined,
    productSlug: result.product_slug ?? undefined,
    productName: result.product_name ?? undefined,
    formPage: result.form_page ?? undefined,
    message: result.message ?? '',
    createdAt: result.created_at,
    status: result.status as Lead['status'],
  }
}

export async function updateLeadStatus(
  db: D1Database,
  id: string,
  status: Lead['status'],
): Promise<void> {
  await db
    .prepare('UPDATE leads SET status = ? WHERE id = ?')
    .bind(status, id)
    .run()
}
