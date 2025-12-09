'use client';

import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/forms/contact-modal';

interface HeroCtaProperties {
  label: string;
}

export function HeroCta({ label }: HeroCtaProperties) {
  return (
    <ContactModal
      trigger={
        <Button size="lg" className="w-full shadow-lg shadow-primary/20 sm:w-auto">
          {label}
        </Button>
      }
    />
  );
}
