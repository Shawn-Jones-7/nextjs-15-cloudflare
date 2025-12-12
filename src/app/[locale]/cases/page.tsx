import type { Locale } from '@/lib/i18n/config'
import type { Metadata } from 'next'

import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { caseStudies } from '@/data/cases'
import { buildPageMetadata } from '@/lib/i18n/metadata'
import { Link } from '@/lib/i18n/routing'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CasesPage' })

  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/cases',
  })
}

export default async function CasesPage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CasesPageContent />
}

function CasesPageContent() {
  const t = useTranslations('CasesPage')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <h1 className='mb-8 text-4xl font-bold tracking-tight'>{t('title')}</h1>
      <p className='text-muted-foreground mb-12 text-lg'>{t('description')}</p>
      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {caseStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/cases/${study.slug}`}
            className='group border-border bg-card hover:border-primary overflow-hidden rounded-lg border transition-colors'
          >
            <div className='bg-muted aspect-video' />
            <div className='p-6'>
              <span className='text-primary text-xs font-medium tracking-wider uppercase'>
                {t(`industries.${study.industry}`)}
              </span>
              <h2 className='group-hover:text-primary mt-2 text-xl font-semibold'>
                {t(`items.${study.slug}.title`)}
              </h2>
              <p className='text-muted-foreground mt-2'>
                {t(`items.${study.slug}.excerpt`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
