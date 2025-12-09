import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { BlogCard } from '@/components/blog/blog-card';
import { getAllPosts } from '@/lib/blog';
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
  const t = await getTranslations({ locale, namespace: 'BlogPage' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/blog'),
  };
}

export default async function BlogPage({ params }: Properties) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'BlogPage' });
  const posts = await getAllPosts(locale);

  return (
    <div className="container ms-auto me-auto py-16 ps-4 pe-4 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">{t('noPosts')}</p>
        </div>
      )}
    </div>
  );
}
