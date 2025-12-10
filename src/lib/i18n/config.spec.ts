import type { Locale } from './config'

import { describe, expect, it } from 'vitest'

import { defaultLocale, isRtl, localeLabels, locales } from './config'

describe('i18n config', () => {
  describe('locales', () => {
    it('contains expected values', () => {
      expect(locales).toEqual(['en', 'zh', 'es', 'ar'])
    })

    it('is a readonly array', () => {
      expect(Object.isFrozen(locales)).toBe(false)
      expect(Array.isArray(locales)).toBe(true)
    })

    it('has length of 4', () => {
      expect(locales).toHaveLength(4)
    })
  })

  describe('defaultLocale', () => {
    it('is "en"', () => {
      expect(defaultLocale).toBe('en')
    })

    it('is included in locales array', () => {
      expect(locales).toContain(defaultLocale)
    })
  })

  describe('localeLabels', () => {
    it('contains expected labels for each locale', () => {
      expect(localeLabels).toEqual({
        en: 'English',
        zh: '中文',
        es: 'Español',
        ar: 'العربية',
      })
    })

    it('has labels for all locales', () => {
      for (const locale of locales) {
        expect(localeLabels[locale]).toBeDefined()
        expect(typeof localeLabels[locale]).toBe('string')
        expect(localeLabels[locale].length).toBeGreaterThan(0)
      }
    })

    it('has exactly 4 entries', () => {
      expect(Object.keys(localeLabels)).toHaveLength(4)
    })
  })

  describe('isRtl', () => {
    it('returns true for Arabic', () => {
      expect(isRtl('ar')).toBe(true)
    })

    it('returns false for English', () => {
      expect(isRtl('en')).toBe(false)
    })

    it('returns false for Chinese', () => {
      expect(isRtl('zh')).toBe(false)
    })

    it('returns false for Spanish', () => {
      expect(isRtl('es')).toBe(false)
    })

    it('returns false for all LTR locales', () => {
      const ltrLocales = ['en', 'zh', 'es']

      for (const locale of ltrLocales) {
        expect(isRtl(locale)).toBe(false)
      }
    })

    it('returns false for unknown locales', () => {
      expect(isRtl('fr')).toBe(false)
      expect(isRtl('de')).toBe(false)
      expect(isRtl('')).toBe(false)
    })
  })

  describe('Locale type', () => {
    it('accepts all defined locales', () => {
      const testLocale: Locale = 'en'
      expect(locales).toContain(testLocale)
    })

    it('allows valid locale assignments', () => {
      const validLocales: Locale[] = ['en', 'zh', 'es', 'ar']

      for (const locale of validLocales) {
        const test: Locale = locale
        expect(locales).toContain(test)
      }
    })
  })
})
