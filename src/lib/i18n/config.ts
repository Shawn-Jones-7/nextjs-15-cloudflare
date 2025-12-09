export const locales = ['en', 'zh', 'es', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  ar: 'العربية',
}

export function isRtl(locale: string): boolean {
  return locale === 'ar'
}
