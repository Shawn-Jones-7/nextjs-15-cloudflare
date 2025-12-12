'use client'

import { useEffect } from 'react'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

interface Properties {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: Properties) {
  const t = useTranslations('Error')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8'>
      <div className='bg-destructive/10 mb-6 rounded-full p-4'>
        <AlertTriangle className='text-destructive h-10 w-10' />
      </div>
      <h2 className='mb-4 text-3xl font-bold tracking-tight sm:text-4xl'>
        {t('title')}
      </h2>
      <p className='text-muted-foreground mb-8 text-lg'>{t('description')}</p>
      <Button onClick={reset} className='gap-2'>
        <RotateCcw className='h-4 w-4' />
        {t('retry')}
      </Button>
    </div>
  )
}
