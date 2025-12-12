/**
 * D1 Database Schema Constants
 *
 * Single source of truth for table names, column mappings, and enum values.
 * Prevents drift between SQL queries and TypeScript types.
 */

export { locales as LEAD_LOCALES } from '@/lib/i18n/config'
export { inquiryTypes as LEAD_INQUIRY_TYPES } from '@/lib/schemas/lead'

export type { Locale as LeadLocaleValue } from '@/lib/i18n/config'
export type { InquiryType as LeadInquiryTypeValue } from '@/lib/schemas/lead'

// -----------------------------------------------------------------------------
// Table Names
// -----------------------------------------------------------------------------

export const LEADS_TABLE = 'leads' as const

// -----------------------------------------------------------------------------
// Column Mappings (snake_case SQL → camelCase TypeScript)
// -----------------------------------------------------------------------------

/**
 * Maps TypeScript property names to SQL column names.
 * Use for building queries while maintaining type safety.
 */
export const LEADS_COLUMNS = {
  id: 'id',
  locale: 'locale',
  name: 'name',
  email: 'email',
  phone: 'phone',
  company: 'company',
  inquiryType: 'inquiry_type',
  productSlug: 'product_slug',
  productName: 'product_name',
  formPage: 'form_page',
  message: 'message',
  createdAt: 'created_at',
  status: 'status',
} as const

export type LeadsColumnKey = keyof typeof LEADS_COLUMNS
export type LeadsColumnName = (typeof LEADS_COLUMNS)[LeadsColumnKey]

// -----------------------------------------------------------------------------
// Enum Values
// -----------------------------------------------------------------------------

export const LEAD_STATUS = {
  pending: 'pending',
  processed: 'processed',
  failed: 'failed',
} as const

export type LeadStatusValue = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS]

// -----------------------------------------------------------------------------
// SQL Fragments (for complex/reusable queries)
// -----------------------------------------------------------------------------

const cols = LEADS_COLUMNS

/** Column list for INSERT statements (order matters for bind params) */
export const LEADS_INSERT_COLUMNS = [
  cols.id,
  cols.locale,
  cols.name,
  cols.email,
  cols.phone,
  cols.company,
  cols.message,
  cols.inquiryType,
  cols.productSlug,
  cols.productName,
  cols.formPage,
  cols.createdAt,
  cols.status,
] as const

/** Placeholder string matching LEADS_INSERT_COLUMNS length */
export const LEADS_INSERT_PLACEHOLDERS = LEADS_INSERT_COLUMNS.map(
  () => '?',
).join(', ')
