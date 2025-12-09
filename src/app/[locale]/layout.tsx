import '../globals.css';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { notFound } from 'next/navigation';

import { BackToTop } from '@/components/common/back-to-top';
import { ProgressBar } from '@/components/common/progress-bar';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { OrganizationJsonLd } from '@/components/seo/structured-data';
import { isRtl, type Locale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/i18n/metadata';
import { routing } from '@/lib/i18n/routing';

interface Properties {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  return buildPageMetadata({
    title: 'B2B Corporate Website',
    description: 'Your trusted partner for international trade solutions.',
    locale: locale as Locale,
    pathname: '/',
  });
}

export default async function LocaleLayout({ children, params }: Properties) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const direction = isRtl(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class" disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ProgressBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
