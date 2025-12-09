import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { Link } from '@/lib/i18n/routing';

interface Properties {
  params: Promise<{ locale: string }>;
}

const caseStudies = [
  { slug: 'logistics-optimization', industry: 'logistics' },
  { slug: 'supply-chain-integration', industry: 'manufacturing' },
  { slug: 'global-expansion', industry: 'retail' },
];

export default async function CasesPage({ params }: Properties) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CasesPageContent />;
}

function CasesPageContent() {
  const t = useTranslations('CasesPage');

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">
        {t('title')}
      </h1>
      <p className="mb-12 text-lg text-muted-foreground">
        {t('description')}
      </p>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((study) => (
          <Link
            key={study.slug}
            href={`/cases/${study.slug}`}
            className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
          >
            <div className="aspect-video bg-muted" />
            <div className="p-6">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">
                {t(`industries.${study.industry}`)}
              </span>
              <h2 className="mt-2 text-xl font-semibold group-hover:text-primary">
                {t(`items.${study.slug}.title`)}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t(`items.${study.slug}.excerpt`)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
