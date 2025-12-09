import type { Locale } from '@/lib/i18n/config'
import type { MetadataRoute } from 'next'

import { defaultLocale, locales } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/i18n/metadata'

const staticRoutes = ['', '/about', '/contact', '/news', '/cases']

const newsSlugs = [
  'expansion-2024',
  'partnership-announcement',
  'industry-award',
]

const casesSlugs = [
  'logistics-optimization',
  'supply-chain-integration',
  'global-expansion',
]

function generateEntry(
  locale: Locale,
  route: string,
  priority = 0.8,
): MetadataRoute.Sitemap[number] {
  const path = route === '' ? '' : route
  const url = `${siteUrl}/${locale}${path}`

  const languages: Record<string, string> = {
    'x-default': `${siteUrl}/${defaultLocale}${path}`,
  }
  for (const l of locales) {
    // Safe: `l` is from the validated `locales` array, not user input
    // eslint-disable-next-line security/detect-object-injection
    languages[l] = `${siteUrl}/${l}${path}`
  }

  return {
    url,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority,
    alternates: { languages },
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const route of staticRoutes) {
    const priority = route === '' ? 1 : 0.8
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, priority))
    }
  }

  for (const slug of newsSlugs) {
    const route = `/news/${slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.6))
    }
  }

  for (const slug of casesSlugs) {
    const route = `/cases/${slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.6))
    }
  }

  return entries
}
