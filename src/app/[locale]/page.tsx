import type { Metadata } from 'next'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Hero } from '@/components/sections/hero'
import { type Locale } from '@/lib/i18n/config'
import { buildPageMetadata } from '@/lib/i18n/metadata'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })

  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/',
  })
}

export default async function HomePage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <Hero locale={locale} />
}
