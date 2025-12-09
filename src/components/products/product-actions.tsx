'use client';

import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/forms/contact-modal';

interface ProductActionsProperties {
  product: {
    slug: string;
    name: string;
  };
  label: string;
}

export function ProductActions({ product, label }: ProductActionsProperties) {
  return (
    <ContactModal
      trigger={<Button className="w-full">{label}</Button>}
      productContext={product}
    />
  );
}
