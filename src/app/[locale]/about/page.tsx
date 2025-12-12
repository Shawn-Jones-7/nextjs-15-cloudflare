import type { Locale } from '@/lib/i18n/config'
import type { Metadata } from 'next'

import { useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { buildPageMetadata } from '@/lib/i18n/metadata'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'AboutPage' })

  return buildPageMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '/about',
  })
}

export default async function AboutPage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AboutPageContent />
}

function AboutPageContent() {
  const t = useTranslations('AboutPage')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-6 text-4xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground mb-8 text-lg'>{t('description')}</p>
        <div className='prose prose-lg dark:prose-invert'>
          <p>{t('content')}</p>
        </div>
      </div>
    </div>
  )
}
