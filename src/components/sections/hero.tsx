import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/lib/i18n/config';
import { HeroCta } from './hero-cta';

interface HeroProperties {
  locale: Locale;
}

export async function Hero({ locale }: HeroProperties) {
  const t = await getTranslations({ locale, namespace: 'HomePage.hero' });

  return (
    <section className="container ms-auto me-auto ps-4 pe-4 py-16 sm:ps-6 sm:pe-6 lg:ps-8 lg:pe-8 lg:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
        {/* Content Column */}
        <div className="flex flex-col items-start text-start space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <HeroCta label={t('cta')} />
          </div>
        </div>

        {/* Visual Column */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/50 bg-muted/20 lg:aspect-[4/3]">
          {/* Dot Pattern Grid */}
          <div
            className="absolute inset-0 text-muted-foreground/30"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Gradient Glow - Start/Bottom */}
          <div className="absolute -bottom-1/4 -start-1/4 h-2/3 w-2/3 rounded-full bg-primary/20 blur-3xl" />

          {/* Gradient Glow - End/Top */}
          <div className="absolute -end-1/4 -top-1/4 h-2/3 w-2/3 rounded-full bg-blue-400/10 blur-3xl" />

          {/* Glassmorphism Card */}
          <div className="absolute inset-12 rounded-xl border border-white/20 bg-white/5 shadow-sm backdrop-blur-sm" />
        </div>
      </div>
    </section>
  );
}
