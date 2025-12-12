/**
 * Type-safe i18n configuration for next-intl
 *
 * This module augmentation provides compile-time type checking for:
 * - Translation keys (via Messages type)
 * - Locale values (via Locale type)
 *
 * English messages (en.json) serve as the source of truth for the message schema.
 *
 * @see https://next-intl.dev/docs/workflows/typescript
 */

import type { routing } from '@/lib/i18n/routing'
import type en from '../../messages/en.json'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof en
  }
}

// Type aliases for dynamic translation keys
type MessagesType = typeof en

// Product item keys (used for Product.slug typing)
export type ProductItemKey = keyof MessagesType['Products']['items']

// Product spec keys (used for dynamic spec label access)
export type ProductSpecKey = keyof MessagesType['Products']['specs']

// Navigation category keys (used for ProductCategory.i18nKey typing)
export type CategoryI18nKey = keyof MessagesType['Navigation']['categories']

// Case study item keys (used for case slug validation)
export type CaseItemKey = keyof MessagesType['CasesPage']['items']
export type CaseItemTranslationKey =
  | `items.${CaseItemKey}.title`
  | `items.${CaseItemKey}.excerpt`
  | `items.${CaseItemKey}.content`

// News item keys (used for news slug validation)
export type NewsItemKey = keyof MessagesType['NewsPage']['items']
export type NewsItemTranslationKey =
  | `items.${NewsItemKey}.title`
  | `items.${NewsItemKey}.excerpt`
  | `items.${NewsItemKey}.content`

// Contact form error keys (used for SubmitLeadState.message typing)
export type ContactFormErrorKey =
  keyof MessagesType['ContactPage']['form']['errors']
