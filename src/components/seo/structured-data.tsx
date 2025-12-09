import type { Locale } from '@/lib/i18n/config';
import { siteUrl } from '@/lib/i18n/metadata';

interface OrganizationJsonLdProperties {
  name?: string;
  url?: string;
  logo?: string;
}

export function OrganizationJsonLd({
  name = 'GlobalTrade',
  url = siteUrl,
  logo = `${siteUrl}/logo.png`,
}: OrganizationJsonLdProperties) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1 (555) 123-4567',
      contactType: 'Customer Service',
      areaServed: ['US', 'CN', 'ES', 'AE'],
      availableLanguage: ['en', 'zh', 'es', 'ar'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProperties {
  items: BreadcrumbItem[];
  locale: Locale;
}

export function BreadcrumbJsonLd({ items, locale }: BreadcrumbJsonLdProperties) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http')
        ? item.href
        : `${siteUrl}/${locale}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleJsonLdProperties {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  locale: Locale;
  slug: string;
  section: 'news' | 'cases';
}

export function ArticleJsonLd({
  title,
  description,
  datePublished,
  dateModified,
  locale,
  slug,
  section,
}: ArticleJsonLdProperties) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      '@type': 'Organization',
      name: 'GlobalTrade',
    },
    publisher: {
      '@type': 'Organization',
      name: 'GlobalTrade',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${locale}/${section}/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
