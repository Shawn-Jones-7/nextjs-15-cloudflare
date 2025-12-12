import '../globals.css'

import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'

import type { Locale } from '@/lib/i18n/config'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { NextIntlClientProvider } from 'next-intl'
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server'
import { ThemeProvider } from 'next-themes'

import Footer from '@/components/layout/footer'
import Header from '@/components/layout/header'
import { OrganizationJsonLd } from '@/components/seo/structured-data'
import { FEATURE_FLAGS } from '@/lib/feature-flags'
import { isRtl } from '@/lib/i18n/config'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { routing } from '@/lib/i18n/routing'

/**
 * Dynamic imports for low-frequency interaction components.
 * These components are client-only and hidden by default (scroll-triggered or conditional),
 * so lazy loading reduces initial JS bundle size.
 */
const ProgressBar = dynamic(() =>
  import('@/components/common/progress-bar').then(
    (module_) => module_.ProgressBar,
  ),
)

const BackToTop = dynamic(() =>
  import('@/components/common/back-to-top').then(
    (module_) => module_.BackToTop,
  ),
)

const WhatsAppButton = dynamic(() =>
  import('@/components/whatsapp').then((module_) => module_.WhatsAppButton),
)

interface Properties {
  children: ReactNode
  params: Promise<{ locale: Locale }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'HomePage' })

  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/',
  })
}

export default async function LocaleLayout({ children, params }: Properties) {
  const { locale } = await params

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  // Messages payload analysis (2024-12):
  // - Total size: ~11-15 KB per locale (gzipped: ~3-5 KB)
  // - Client namespaces: Site, Navigation, Common, Footer, LocaleSwitcher,
  //   WhatsApp, ContactPage.modal/form
  // - Server-only: HomePage, AboutPage, NewsPage, CasesPage, BlogPage,
  //   ProductsPage, Products, ThankYouPage
  // Decision: No namespace filtering needed. Payload is small (<20KB) and
  // complexity of maintaining per-page namespace maps outweighs benefits.
  // Re-evaluate if messages exceed 30KB or add heavy content namespaces.
  const messages = await getMessages()
  const direction = isRtl(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className='flex min-h-screen flex-col'>
        <ThemeProvider attribute='class' disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ProgressBar />
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
            <BackToTop />
            {FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT && <WhatsAppButton />}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
