'use client';

import { Button } from '@/components/ui/button';
import { ContactModal } from '@/components/forms/contact-modal';
import { WhatsAppButton } from '@/components/whatsapp';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

interface ProductActionsProperties {
  product: {
    slug: string;
    name: string;
  };
  label: string;
}

export function ProductActions({ product, label }: ProductActionsProperties) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ContactModal
        trigger={<Button className="w-full sm:flex-1">{label}</Button>}
        productContext={product}
      />
      {FEATURE_FLAGS.ENABLE_WHATSAPP_CHAT && (
        <WhatsAppButton
          productName={product.name}
          variant="inline"
          className="w-full sm:flex-1"
        />
      )}
    </div>
  );
}
