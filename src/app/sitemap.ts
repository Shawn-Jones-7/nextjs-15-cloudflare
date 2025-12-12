import type { Locale } from '@/lib/i18n/config'
import type { MetadataRoute } from 'next'

import { getAllCaseSlugs } from '@/data/cases'
import { getAllNewsSlugs } from '@/data/news'
import { getAllProducts, productCategories } from '@/data/products'
import { getAllPostSlugs } from '@/lib/blog'
import { defaultLocale, locales } from '@/lib/i18n/config'
import { siteUrl } from '@/lib/i18n/metadata'

export const dynamic = 'force-static'

// Build-time constant for deterministic sitemap generation
const BUILD_DATE = new Date().toISOString().split('T')[0]

const staticRoutes = [
  '',
  '/about',
  '/contact',
  '/news',
  '/cases',
  '/products',
  '/blog',
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
    lastModified: BUILD_DATE,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority,
    alternates: { languages },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static routes
  for (const route of staticRoutes) {
    const priority = route === '' ? 1 : 0.8
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, priority))
    }
  }

  // News pages
  for (const slug of getAllNewsSlugs()) {
    const route = `/news/${slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.6))
    }
  }

  // Case study pages
  for (const slug of getAllCaseSlugs()) {
    const route = `/cases/${slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.6))
    }
  }

  // Product category pages
  for (const category of productCategories) {
    const route = `/products/${category.slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.7))
    }
  }

  // Product detail pages
  for (const product of getAllProducts()) {
    const route = `/products/${product.categorySlug}/${product.slug}`
    for (const locale of locales) {
      entries.push(generateEntry(locale, route, 0.6))
    }
  }

  // Blog posts (async - from velite)
  const blogSlugs = await getAllPostSlugs()
  for (const { slug, locale } of blogSlugs) {
    entries.push(generateEntry(locale, `/blog/${slug}`, 0.6))
  }

  return entries
}
