import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/routing';
import { getCategoryBySlug, type Product } from '@/data/products';
import { type Locale } from '@/lib/i18n/config';
import { ProductActions } from './product-actions';

interface ProductCardProperties {
  product: Product;
  locale: Locale;
}

export async function ProductCard({ product, locale }: ProductCardProperties) {
  const t = await getTranslations({ locale, namespace: 'Products.items' });
  const tNav = await getTranslations({ locale, namespace: 'Navigation.categories' });
  const tPage = await getTranslations({ locale, namespace: 'ProductsPage' });

  const category = getCategoryBySlug(product.categorySlug);
  const categoryName = category ? tNav(category.i18nKey) : product.categorySlug;
  const productName = t(`${product.slug}.name`);

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={productName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col ps-6 pe-6 pt-6 pb-6">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full border bg-secondary ps-2.5 pe-2.5 py-0.5 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80">
            {categoryName}
          </span>
        </div>
        <Link href={`/products/${product.slug}`} className="mb-2 block">
          <h3 className="text-xl font-semibold leading-none tracking-tight hover:underline">
            {productName}
          </h3>
        </Link>
        <p className="mb-6 line-clamp-3 flex-1 text-sm text-muted-foreground">
          {t(`${product.slug}.description`)}
        </p>
        <div className="mt-auto">
          <ProductActions
            product={{ slug: product.slug, name: productName }}
            label={tPage('getQuote')}
          />
        </div>
      </div>
    </div>
  );
}
