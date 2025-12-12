import { FileQuestion } from 'lucide-react'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'

import { Button } from '@/components/ui/button'
import { Link } from '@/lib/i18n/routing'

export default async function NotFound() {
  const locale = await getLocale()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'NotFound' })
  const nav = await getTranslations({ locale, namespace: 'Navigation' })

  return (
    <div className='container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8'>
      <div className='bg-muted mb-6 rounded-full p-4'>
        <FileQuestion className='text-muted-foreground h-10 w-10' />
      </div>
      <h1 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
        {t('title')}
      </h1>
      <p className='text-muted-foreground mb-8 text-lg'>{t('description')}</p>
      <Button asChild>
        <Link href='/'>{nav('home')}</Link>
      </Button>
    </div>
  )
}
