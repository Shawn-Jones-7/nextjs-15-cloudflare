import { notFound } from 'next/navigation'

import type { CaseSlug } from '@/data/cases'
import type { Locale } from '@/lib/i18n/config'
import type { CaseItemTranslationKey } from '@/types/intl.d'
import type { Metadata } from 'next'

import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { caseStudies, getAllCaseSlugs } from '@/data/cases'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { Link, routing } from '@/lib/i18n/routing'

interface Properties {
  params: Promise<{ locale: Locale; slug: string }>
}

const validSlugs = caseStudies.map((item) => item.slug)

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllCaseSlugs().map((slug) => ({ locale, slug })),
  )
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale, slug } = await params

  if (!(validSlugs as readonly string[]).includes(slug)) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'CasesPage' })
  const caseSlug = slug as CaseSlug

  return buildPageMetadata({
    title: t(`items.${caseSlug}.title` as CaseItemTranslationKey),
    description: t(`items.${caseSlug}.excerpt` as CaseItemTranslationKey),
    locale,
    pathname: `/cases/${slug}`,
    type: 'article',
  })
}

export default async function CaseDetailPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  if (!(validSlugs as readonly string[]).includes(slug)) {
    notFound()
  }

  return <CaseDetailContent slug={slug as CaseSlug} />
}

function CaseDetailContent({ slug }: { slug: CaseSlug }) {
  const t = useTranslations('CasesPage')
  const nav = useTranslations('Navigation')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <Link
        href='/cases'
        className='text-muted-foreground hover:text-primary mb-8 inline-flex items-center text-sm'
      >
        &larr; {nav('cases')}
      </Link>
      <article className='mx-auto max-w-4xl'>
        <div className='bg-muted mb-8 aspect-video rounded-lg' />
        <h1 className='mb-4 text-4xl font-bold tracking-tight'>
          {t(`items.${slug}.title` as CaseItemTranslationKey)}
        </h1>
        <div className='prose prose-lg dark:prose-invert'>
          <p>{t(`items.${slug}.content` as CaseItemTranslationKey)}</p>
        </div>
      </article>
    </div>
  )
}
