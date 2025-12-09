import type { Metadata } from 'next'
import type { Locale } from './config'

import { defaultLocale } from './config'

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_BASE_URL ??
  'https://globaltrade.com'
export const siteUrl = rawSiteUrl.replace(/\/$/, '')

export const siteName = 'GlobalTrade'

export function buildAlternates(
  locale: Locale,
  pathname: string,
): Metadata['alternates'] {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  const localizedPath = normalizedPath === '/' ? '' : normalizedPath

  const buildUrl = (loc: string) => `${siteUrl}/${loc}${localizedPath}`

  const languages = {
    'x-default': buildUrl(defaultLocale),
    en: buildUrl('en'),
    zh: buildUrl('zh'),
    es: buildUrl('es'),
    ar: buildUrl('ar'),
  } as const

  const canonical = buildUrl(locale)

  return {
    canonical,
    languages,
  }
}

export interface PageMetadataOptions {
  title: string
  description: string
  locale: Locale
  pathname: string
  image?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
}

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    locale,
    pathname,
    image = `${siteUrl}/og-image.png`,
    type = 'website',
    publishedTime,
    modifiedTime,
    authors,
    tags,
  } = options

  const url = `${siteUrl}/${locale}${pathname === '/' ? '' : pathname}`

  return {
    title,
    description,
    alternates: buildAlternates(locale, pathname),
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: locale === 'zh' ? 'zh_CN' : locale === 'ar' ? 'ar_AE' : locale,
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
