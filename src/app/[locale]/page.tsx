import { setRequestLocale } from 'next-intl/server'

import { Hero } from '@/components/sections/hero'
import { type Locale } from '@/lib/i18n/config'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <Hero locale={locale} />
}
