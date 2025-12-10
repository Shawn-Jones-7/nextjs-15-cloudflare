import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { Link } from '@/lib/i18n/routing'

import type { Locale } from '@/lib/i18n/config'

interface Properties {
  params: Promise<{ locale: Locale }>
}

export default async function ThankYouPage({ params }: Properties) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ThankYouContent />
}

function ThankYouContent() {
  const t = useTranslations('ThankYouPage')
  const nav = useTranslations('Navigation')

  return (
    <div className='container mx-auto px-4 py-16 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-xl text-center'>
        <div className='mb-6 text-6xl'>✓</div>
        <h1 className='mb-4 text-4xl font-bold tracking-tight'>{t('title')}</h1>
        <p className='text-muted-foreground mb-8 text-lg'>{t('description')}</p>
        <Link
          href='/'
          className='bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-md px-6 py-3 font-medium transition-colors'
        >
          {nav('home')}
        </Link>
      </div>
    </div>
  )
}
