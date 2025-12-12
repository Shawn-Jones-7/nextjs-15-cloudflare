'use client'

import { useActionState, useEffect, useRef, useState } from 'react'

import type { SubmitLeadState } from '@/actions/submit-lead'
import type { TurnstileInstance } from '@marsidev/react-turnstile'

import { Turnstile } from '@marsidev/react-turnstile'
import { useLocale, useTranslations } from 'next-intl'

import { submitLead } from '@/actions/submit-lead'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/cn'
import { inquiryTypes } from '@/lib/schemas/lead'

interface ContactFormProperties {
  productContext?: {
    slug: string
    name: string
  }
  formPage?: string
  onSuccess?: () => void
  className?: string
}

export default function ContactForm({
  productContext,
  formPage,
  onSuccess,
  className,
}: ContactFormProperties) {
  const t = useTranslations('ContactPage.form')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const formReference = useRef<HTMLFormElement>(null)
  const turnstileReference = useRef<TurnstileInstance>(null)
  const [turnstileToken, setTurnstileToken] = useState<string>()

  const [state, action, isPending] = useActionState(submitLead, {
    success: undefined,
  } as SubmitLeadState)

  // Handle success state change in effect (React 19 compliant)
  useEffect(() => {
    if (state.success) {
      formReference.current?.reset()
      turnstileReference.current?.reset()
      onSuccess?.()
    }
  }, [state.success, onSuccess])

  return (
    <form
      ref={formReference}
      action={action}
      lang={locale}
      dir={direction}
      className={cn('space-y-6', className)}
    >
      {/* Hidden Context Fields */}
      {productContext && (
        <>
          <input type='hidden' name='productSlug' value={productContext.slug} />
          <input type='hidden' name='productName' value={productContext.name} />
        </>
      )}
      {formPage && <input type='hidden' name='formPage' value={formPage} />}

      {state.success === true && (
        <div
          className='rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
          role='status'
          aria-live='polite'
        >
          {t('success_message')}
        </div>
      )}

      {state.success === false && state.message && (
        <div
          className='border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-4'
          role='alert'
          aria-live='assertive'
        >
          {t(`errors.${state.message}` as const)}
        </div>
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <label
            htmlFor='name'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {t('name')} <span className='text-destructive'>*</span>
          </label>
          <Input
            id='name'
            name='name'
            required
            disabled={isPending}
            aria-invalid={Boolean(state.errors?.name)}
          />
          {state.errors?.name && (
            <p className='text-destructive text-sm'>{state.errors.name[0]}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='email'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {t('email')} <span className='text-destructive'>*</span>
          </label>
          <Input
            id='email'
            name='email'
            type='email'
            required
            disabled={isPending}
            aria-invalid={Boolean(state.errors?.email)}
          />
          {state.errors?.email && (
            <p className='text-destructive text-sm'>{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <label
            htmlFor='company'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {t('company')}
          </label>
          <Input
            id='company'
            name='company'
            disabled={isPending}
            aria-invalid={Boolean(state.errors?.company)}
          />
          {state.errors?.company && (
            <p className='text-destructive text-sm'>
              {state.errors.company[0]}
            </p>
          )}
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='inquiryType'
            className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {t('inquiryType')}
          </label>
          <Select name='inquiryType' disabled={isPending}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder={t('selectInquiryType')} />
            </SelectTrigger>
            <SelectContent>
              {inquiryTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`types.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <label
          htmlFor='message'
          className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
        >
          {t('message')}
        </label>
        <Textarea
          id='message'
          name='message'
          rows={4}
          disabled={isPending}
          aria-invalid={Boolean(state.errors?.message)}
          className={cn(
            state.errors?.message &&
              'border-destructive focus-visible:ring-destructive',
          )}
        />
        {state.errors?.message && (
          <p className='text-destructive text-sm'>{state.errors.message[0]}</p>
        )}
      </div>

      <div className='space-y-4 pt-2'>
        <Turnstile
          ref={turnstileReference}
          siteKey={
            process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
            '1x00000000000000000000AA'
          }
          onSuccess={setTurnstileToken}
          options={{ theme: 'auto', size: 'flexible' }}
        />

        <Button
          type='submit'
          className='w-full'
          disabled={isPending || turnstileToken === undefined}
        >
          {isPending ? t('loading') : t('submit')}
        </Button>
      </div>
    </form>
  )
}
