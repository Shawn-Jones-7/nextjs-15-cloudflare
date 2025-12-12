import type { Locale } from '@/lib/i18n/config'
import type { Metadata } from 'next'

import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { newsItems } from '@/data/news'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { Link } from '@/lib/i18n/routing'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'NewsPage' })

  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/news',
  })
}

export default async function NewsPage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <NewsPageContent />
}

function NewsPageContent() {
  const t = useTranslations('NewsPage')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <h1 className='mb-8 text-4xl font-bold tracking-tight'>{t('title')}</h1>
      <p className='text-muted-foreground mb-12 text-lg'>{t('description')}</p>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {newsItems.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className='group border-border bg-card hover:border-primary rounded-lg border p-6 transition-colors'
          >
            <time className='text-muted-foreground text-sm'>{item.date}</time>
            <h2 className='group-hover:text-primary mt-2 text-xl font-semibold'>
              {t(`items.${item.slug}.title`)}
            </h2>
            <p className='text-muted-foreground mt-2'>
              {t(`items.${item.slug}.excerpt`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
