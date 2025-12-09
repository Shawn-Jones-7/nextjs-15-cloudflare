import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductGrid } from '@/components/products/product-grid';
import { getAllProducts } from '@/data/products';
import { locales, type Locale } from '@/lib/i18n/config';
import { buildAlternates } from '@/lib/i18n/metadata';

interface Properties {
  params: Promise<{ locale: Locale }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ProductsPage' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/products'),
  };
}

export default async function ProductsPage({ params }: Properties) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'ProductsPage' });
  const products = getAllProducts();

  return (
    <div className="container ms-auto me-auto py-16 ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>
      <ProductGrid products={products} locale={locale} />
    </div>
  );
}
