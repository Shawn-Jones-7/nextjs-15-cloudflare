import type { Product } from '@/data/products'
import type { Locale } from '@/lib/i18n/config'

import { getTranslations } from 'next-intl/server'

import { getCategoryBySlug } from '@/data/products'

export interface ProductDisplayData {
  productName: string
  categoryName: string
  description: string
  getQuoteLabel: string
}

/**
 * Get localized display data for a product.
 * Consolidates translation fetching and category derivation logic.
 */
export async function getProductDisplayData(
  product: Product,
  locale: Locale,
): Promise<ProductDisplayData> {
  const [t, tNav, tPage] = await Promise.all([
    getTranslations({ locale, namespace: 'Products.items' }),
    getTranslations({ locale, namespace: 'Navigation.categories' }),
    getTranslations({ locale, namespace: 'ProductsPage' }),
  ])

  const category = getCategoryBySlug(product.categorySlug)
  const categoryName = category ? tNav(category.i18nKey) : product.categorySlug

  return {
    productName: t(`${product.slug}.name`),
    categoryName,
    description: t(`${product.slug}.description`),
    getQuoteLabel: tPage('getQuote'),
  }
}
