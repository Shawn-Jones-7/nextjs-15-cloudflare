'use client'

import type React from 'react'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/cn'
import { buildWhatsAppUrl, getWhatsAppNumber } from '@/lib/feature-flags'

import { WhatsAppIcon } from './whatsapp-icon'

interface WhatsAppButtonProperties {
  /** Custom message to prefill (overrides default) */
  message?: string
  /** Product name for product-specific inquiries */
  productName?: string
  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left'
  /** Whether this is a floating button or inline CTA */
  variant?: 'floating' | 'inline'
  /** Additional CSS classes */
  className?: string
}

export function WhatsAppButton({
  message,
  productName,
  position = 'bottom-right',
  variant = 'floating',
  className,
}: WhatsAppButtonProperties): React.JSX.Element | null {
  const t = useTranslations('WhatsApp')
  const phoneNumber = getWhatsAppNumber()

  if (!phoneNumber) {
    // eslint-disable-next-line unicorn/no-null -- React components must return null, not undefined
    return null
  }

  // Determine the message to use
  const finalMessage =
    message ??
    (productName ? t('productInquiry', { productName }) : t('defaultMessage'))

  const url = buildWhatsAppUrl(phoneNumber, finalMessage)

  if (!url) {
    // eslint-disable-next-line unicorn/no-null -- React components must return null, not undefined
    return null
  }

  if (variant === 'inline') {
    return (
      <a
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 font-medium text-white transition-colors hover:bg-[#128C7E]',
          className,
        )}
        aria-label={t('buttonLabel')}
      >
        <WhatsAppIcon className='size-5' />
        <span>{t('buttonLabel')}</span>
      </a>
    )
  }

  // Floating button
  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'fixed z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#128C7E] focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:outline-none',
        position === 'bottom-right' &&
          'right-4 bottom-4 rtl:right-auto rtl:left-4',
        position === 'bottom-left' &&
          'bottom-4 left-4 rtl:right-4 rtl:left-auto',
        className,
      )}
      aria-label={t('buttonLabel')}
    >
      <WhatsAppIcon className='size-7' />
    </a>
  )
}
