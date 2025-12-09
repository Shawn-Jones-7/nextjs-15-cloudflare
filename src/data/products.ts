export type ProductCategorySlug =
  | 'industrial-pumps'
  | 'valves'
  | 'pipes'
  | 'fittings'
  | 'accessories';

export interface Product {
  slug: string;
  categorySlug: ProductCategorySlug;
  image: string;
  specKeys: string[];
}

export interface ProductCategory {
  slug: ProductCategorySlug;
  i18nKey: string;
  icon: string;
  products: Product[];
}

export const productCategories: ProductCategory[] = [
  {
    slug: 'industrial-pumps',
    i18nKey: 'industrialPumps',
    icon: 'factory',
    products: [
      {
        slug: 'centrifugal-pump-pro',
        categorySlug: 'industrial-pumps',
        image: '/products/placeholder.svg',
        specKeys: ['flowRate', 'head', 'power'],
      },
      {
        slug: 'vertical-turbine-pump',
        categorySlug: 'industrial-pumps',
        image: '/products/placeholder.svg',
        specKeys: ['flowRate', 'stages', 'motor'],
      },
    ],
  },
  {
    slug: 'valves',
    i18nKey: 'valves',
    icon: 'gauge',
    products: [
      {
        slug: 'gate-valve-hd',
        categorySlug: 'valves',
        image: '/products/placeholder.svg',
        specKeys: ['pressureRating', 'size', 'material'],
      },
      {
        slug: 'butterfly-valve-xl',
        categorySlug: 'valves',
        image: '/products/placeholder.svg',
        specKeys: ['pressureRating', 'discMaterial', 'seatMaterial'],
      },
    ],
  },
  {
    slug: 'pipes',
    i18nKey: 'pipes',
    icon: 'cylinder',
    products: [
      {
        slug: 'ss-welded-pipe',
        categorySlug: 'pipes',
        image: '/products/placeholder.svg',
        specKeys: ['diameter', 'schedule', 'material'],
      },
      {
        slug: 'hdpe-pressure-pipe',
        categorySlug: 'pipes',
        image: '/products/placeholder.svg',
        specKeys: ['diameter', 'pressureClass', 'coilLength'],
      },
    ],
  },
  {
    slug: 'fittings',
    i18nKey: 'fittings',
    icon: 'wrench',
    products: [
      {
        slug: 'stainless-elbow-90',
        categorySlug: 'fittings',
        image: '/products/placeholder.svg',
        specKeys: ['diameter', 'schedule', 'radius'],
      },
      {
        slug: 'carbon-steel-flange',
        categorySlug: 'fittings',
        image: '/products/placeholder.svg',
        specKeys: ['pressureClass', 'connection', 'material'],
      },
    ],
  },
  {
    slug: 'accessories',
    i18nKey: 'accessories',
    icon: 'settings',
    products: [
      {
        slug: 'pressure-gauge-industrial',
        categorySlug: 'accessories',
        image: '/products/placeholder.svg',
        specKeys: ['range', 'connection', 'caseMaterial'],
      },
      {
        slug: 'mechanical-seal-kit',
        categorySlug: 'accessories',
        image: '/products/placeholder.svg',
        specKeys: ['shaftSize', 'material', 'temperature'],
      },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  for (const category of productCategories) {
    const product = category.products.find((item) => item.slug === slug);
    if (product) {
      return product;
    }
  }
  return undefined;
}

export function getCategoryBySlug(
  slug: ProductCategorySlug
): ProductCategory | undefined {
  return productCategories.find((category) => category.slug === slug);
}

export function getAllProducts(): Product[] {
  return productCategories.flatMap((category) => category.products);
}
