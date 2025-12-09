import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/lib/i18n/routing';

interface Properties {
  params: Promise<{ locale: string }>;
}

const newsItems = [
  { slug: 'expansion-2024', date: '2024-12-01' },
  { slug: 'partnership-announcement', date: '2024-11-15' },
  { slug: 'industry-award', date: '2024-10-20' },
];

export default async function NewsPage({ params }: Properties) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewsPageContent />;
}

function NewsPageContent() {
  const t = useTranslations('NewsPage');

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        {t('title')}
      </h1>
      <p className="mb-12 text-lg text-muted-foreground">
        {t('description')}
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {newsItems.map((item) => (
          <Link
            key={item.slug}
            href={`/news/${item.slug}`}
            className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <time className="text-sm text-muted-foreground">{item.date}</time>
            <h2 className="mt-2 text-xl font-semibold group-hover:text-primary">
              {t(`items.${item.slug}.title`)}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t(`items.${item.slug}.excerpt`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
