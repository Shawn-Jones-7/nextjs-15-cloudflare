import { notFound } from 'next/navigation'

import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import { Link, routing } from '@/lib/i18n/routing'

interface Properties {
  params: Promise<{ locale: string; slug: string }>
}

const validSlugs = [
  'logistics-optimization',
  'supply-chain-integration',
  'global-expansion',
] as const

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    validSlugs.map((slug) => ({ locale, slug })),
  )
}

export default async function CaseDetailPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  if (!(validSlugs as readonly string[]).includes(slug)) {
    notFound()
  }

  return <CaseDetailContent slug={slug as (typeof validSlugs)[number]} />
}

function CaseDetailContent({ slug }: { slug: (typeof validSlugs)[number] }) {
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
          {t(`items.${slug}.title`)}
        </h1>
        <div className='prose prose-lg dark:prose-invert'>
          <p>{t(`items.${slug}.content`)}</p>
        </div>
      </article>
    </div>
  )
}
