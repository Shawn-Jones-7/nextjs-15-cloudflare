import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import ContactForm from '@/components/forms/contact-form';

interface Properties {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: Properties) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactPageContent />;
}

function ContactPageContent() {
  const t = useTranslations('ContactPage');

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{t('description')}</p>
        <ContactForm />
      </div>
    </div>
  );
}
