import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

interface Properties {
  params: Promise<{ locale: string }>
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
