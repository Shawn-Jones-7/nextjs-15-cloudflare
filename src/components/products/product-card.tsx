import Image from 'next/image'

import type { Product } from '@/data/products'

import { type Locale } from '@/lib/i18n/config'
import { Link } from '@/lib/i18n/routing'
import { getProductDisplayData } from '@/lib/products/get-product-display'

import { ProductActions } from './product-actions'

interface ProductCardProperties {
  product: Product
  locale: Locale
}

export async function ProductCard({ product, locale }: ProductCardProperties) {
  const { productName, categoryName, description, getQuoteLabel } =
    await getProductDisplayData(product, locale)

  return (
    <div className='group bg-card text-card-foreground flex h-full flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md'>
      <div className='bg-muted relative aspect-video w-full overflow-hidden'>
        <Image
          src={product.image}
          alt={productName}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
      </div>
      <div className='flex flex-1 flex-col ps-6 pe-6 pt-6 pb-6'>
        <div className='mb-4'>
          <span className='bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border py-0.5 ps-2.5 pe-2.5 text-xs font-semibold transition-colors'>
            {categoryName}
          </span>
        </div>
        <Link href={`/products/${product.slug}`} className='mb-2 block'>
          <h3 className='text-xl leading-none font-semibold tracking-tight hover:underline'>
            {productName}
          </h3>
        </Link>
        <p className='text-muted-foreground mb-6 line-clamp-3 flex-1 text-sm'>
          {description}
        </p>
        <div className='mt-auto'>
          <ProductActions
            product={{ slug: product.slug, name: productName }}
            label={getQuoteLabel}
          />
        </div>
      </div>
    </div>
  )
}
