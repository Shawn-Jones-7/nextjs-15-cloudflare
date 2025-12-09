'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

import type { ReactNode } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import ContactForm from '@/components/forms/contact-form'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { isRtl } from '@/lib/i18n/config'

interface ContactModalProperties {
  trigger: ReactNode
  productContext?: {
    slug: string
    name: string
  }
}

export function ContactModal({
  trigger,
  productContext,
}: ContactModalProperties) {
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const t = useTranslations('ContactPage.modal')
  const sheetSide = isRtl(locale) ? 'left' : 'right'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={sheetSide}
        className='w-full overflow-y-auto sm:max-w-lg'
      >
        <SheetHeader className='mb-6 text-start'>
          <SheetTitle>
            {productContext
              ? t('titleWithProduct', { product: productContext.name })
              : t('title')}
          </SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>
        <ContactForm
          productContext={productContext}
          formPage={pathname}
          onSuccess={() => {
            // Close modal after successful submission with a small delay
            setTimeout(() => {
              setOpen(false)
            }, 2000)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
