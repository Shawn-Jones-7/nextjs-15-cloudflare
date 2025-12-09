'use client'

import { ContactModal } from '@/components/forms/contact-modal'
import { Button } from '@/components/ui/button'

interface HeroCtaProperties {
  label: string
}

export function HeroCta({ label }: HeroCtaProperties) {
  return (
    <ContactModal
      trigger={
        <Button
          size='lg'
          className='shadow-primary/20 w-full shadow-lg sm:w-auto'
        >
          {label}
        </Button>
      }
    />
  )
}
