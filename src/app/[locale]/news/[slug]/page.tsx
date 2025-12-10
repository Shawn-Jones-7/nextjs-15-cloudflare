import { notFound } from 'next/navigation'

import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { Link, routing } from '@/lib/i18n/routing'

import type { Locale } from '@/lib/i18n/config'

interface Properties {
  params: Promise<{ locale: Locale; slug: string }>
}

const validSlugs = [
  'expansion-2024',
  'partnership-announcement',
  'industry-award',
] as const

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    validSlugs.map((slug) => ({ locale, slug })),
  )
}

export default async function NewsDetailPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  if (!(validSlugs as readonly string[]).includes(slug)) {
    notFound()
  }

  return <NewsDetailContent slug={slug as (typeof validSlugs)[number]} />
}

function NewsDetailContent({ slug }: { slug: (typeof validSlugs)[number] }) {
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
          {t(`items.${slug}.title`)}
        </h1>
        <div className='prose prose-lg dark:prose-invert'>
          <p>{t(`items.${slug}.content`)}</p>
        </div>
      </article>
    </div>
  )
}
