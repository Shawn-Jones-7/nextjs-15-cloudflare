import Image from 'next/image'
import { notFound } from 'next/navigation'

import type { Locale } from '@/lib/i18n/config'
import type { ProductSpecKey } from '@/types/intl.d'
import type { Metadata } from 'next'

import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ProductActions } from '@/components/products/product-actions'
import {
  getAllProducts,
  getCategoryBySlug,
  getProductBySlug,
} from '@/data/products'
import { locales } from '@/lib/i18n/config'
import { buildAlternates } from '@/lib/i18n/metadata'

interface Properties {
  params: Promise<{ locale: Locale; slug: string }>
}

export function generateStaticParams() {
  const products = getAllProducts()
  return locales.flatMap((locale) =>
    products.map((product) => ({
      locale,
      slug: product.slug,
    })),
  )
}

export async function generateMetadata({
  params,
}: Properties): Promise<Metadata> {
  const { locale, slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {}
  }

  const t = await getTranslations({ locale, namespace: 'Products.items' })

  return {
    title: t(`${product.slug}.name`),
    description: t(`${product.slug}.description`),
    alternates: buildAlternates(locale, `/products/${slug}`),
  }
}

export default async function ProductDetailPage({ params }: Properties) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'Products.items' })
  const tSpecs = await getTranslations({ locale, namespace: 'Products.specs' })
  const tNav = await getTranslations({
    locale,
    namespace: 'Navigation.categories',
  })
  const tPage = await getTranslations({ locale, namespace: 'ProductsPage' })

  const category = getCategoryBySlug(product.categorySlug)
  const categoryName = category ? tNav(category.i18nKey) : product.categorySlug
  const productName = t(`${product.slug}.name`)

  return (
    <div className='container ms-auto me-auto py-16 ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8'>
      <div className='grid gap-12 lg:grid-cols-2'>
        <div className='bg-muted relative aspect-square w-full overflow-hidden rounded-lg border lg:aspect-[4/3]'>
          <Image
            src={product.image}
            alt={productName}
            fill
            className='object-cover'
            sizes='(max-width: 1024px) 100vw, 50vw'
            priority
          />
        </div>

        <div className='flex flex-col'>
          <div className='mb-4'>
            <span className='bg-secondary text-secondary-foreground inline-flex items-center rounded-full border py-0.5 ps-2.5 pe-2.5 text-xs font-semibold'>
              {categoryName}
            </span>
          </div>

          <h1 className='mb-4 text-4xl font-bold tracking-tight lg:text-5xl'>
            {productName}
          </h1>

          <div className='mb-8 max-w-none'>
            <p className='text-muted-foreground text-lg leading-relaxed'>
              {t(`${product.slug}.description`)}
            </p>
          </div>

          <div className='mb-10 overflow-hidden rounded-lg border'>
            <table className='w-full text-sm'>
              <tbody className='divide-y'>
                {product.specKeys.map((specKey) => (
                  <tr
                    key={specKey}
                    className='group hover:bg-muted/50 transition-colors'
                  >
                    <td className='text-muted-foreground bg-muted/20 w-1/3 p-4 font-medium'>
                      {tSpecs(specKey as ProductSpecKey)}
                    </td>
                    <td className='p-4 font-medium'>
                      {/* @ts-expect-error - Dynamic nested key; validated by Product.slug typing */}
                      {t.raw(`${product.slug}.specs.${specKey}`)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-auto'>
            <ProductActions
              product={{ slug: product.slug, name: productName }}
              label={tPage('getQuote')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
