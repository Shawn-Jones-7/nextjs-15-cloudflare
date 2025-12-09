import { type Product } from '@/data/products'
import { type Locale } from '@/lib/i18n/config'

import { ProductCard } from './product-card'

interface ProductGridProperties {
  products: Product[]
  locale: Locale
}

export function ProductGrid({ products, locale }: ProductGridProperties) {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} locale={locale} />
      ))}
    </div>
  )
}
