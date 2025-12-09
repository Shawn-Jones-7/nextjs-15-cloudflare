'use client'

import { useCallback, useEffect, useState } from 'react'

import { ArrowUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'

export function BackToTop() {
  const t = useTranslations('Common')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      type='button'
      aria-label={t('backToTop')}
      onClick={scrollToTop}
      className={cn(
        'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-ring fixed end-8 bottom-8 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-none',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className='h-5 w-5' />
    </button>
  )
}
