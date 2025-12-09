'use client'

import { useTransition } from 'react'

import type { ChangeEvent } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { localeLabels, locales } from '@/lib/i18n/config'
import { usePathname, useRouter } from '@/lib/i18n/routing'

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function onSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <label className='flex items-center gap-2 text-sm'>
      <span className='sr-only'>{t('label')}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={onSelectChange}
        className='cursor-pointer rounded border bg-transparent px-2 py-1'
      >
        {locales.map((current) => (
          <option key={current} value={current}>
            {/* Safe: `current` is from the validated `locales` array */}
            {/* eslint-disable-next-line security/detect-object-injection */}
            {localeLabels[current]}
          </option>
        ))}
      </select>
    </label>
  )
}
