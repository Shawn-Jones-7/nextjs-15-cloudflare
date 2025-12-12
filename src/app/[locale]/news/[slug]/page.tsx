import { notFound } from 'next/navigation'

import type { NewsSlug } from '@/data/news'
import type { Locale } from '@/lib/i18n/config'
import type { NewsItemTranslationKey } from '@/types/intl.d'
import type { Metadata } from 'next'

import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getAllNewsSlugs, newsItems } from '@/data/news'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { Link, routing } from '@/lib/i18n/routing'

interface Properties {
  params: Promise<{ locale: Locale; slug: string }>
}

const validSlugs = newsItems.map((item) => item.slug)

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllNewsSlugs().map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale, slug } = await params

  if (!(validSlugs as readonly string[]).includes(slug)) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'NewsPage' })
  const newsSlug = slug as NewsSlug

  return buildPageMetadata({
    title: t(`items.${newsSlug}.title` as NewsItemTranslationKey),
    description: t(`items.${newsSlug}.excerpt` as NewsItemTranslationKey),
    locale,
    pathname: `/news/${slug}`,
    type: 'article',
  })
}

export default async function NewsDetailPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  if (!(validSlugs as readonly string[]).includes(slug)) {
    notFound()
  }

  return <NewsDetailContent slug={slug as NewsSlug} />
}

function NewsDetailContent({ slug }: { slug: NewsSlug }) {
  const t = useTranslations('NewsPage')
  const nav = useTranslations('Navigation')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <Link
        href='/news'
        className='text-muted-foreground hover:text-primary mb-8 inline-flex items-center text-sm'
      >
        &larr; {nav('news')}
      </Link>
      <article className='mx-auto max-w-3xl'>
        <h1 className='mb-4 text-4xl font-bold tracking-tight'>
          {t(`items.${slug}.title` as NewsItemTranslationKey)}
        </h1>
        <div className='prose prose-lg dark:prose-invert'>
          <p>{t(`items.${slug}.content` as NewsItemTranslationKey)}</p>
        </div>
      </article>
    </div>
  )
}
