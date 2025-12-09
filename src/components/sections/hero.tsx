import { getTranslations } from 'next-intl/server'

import { type Locale } from '@/lib/i18n/config'

import { HeroCta } from './hero-cta'

interface HeroProperties {
  locale: Locale
}

export async function Hero({ locale }: HeroProperties) {
  const t = await getTranslations({ locale, namespace: 'HomePage.hero' })

  return (
    <section className='container ms-auto me-auto py-16 ps-4 pe-4 sm:ps-6 sm:pe-6 lg:py-24 lg:ps-8 lg:pe-8'>
      <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
        {/* Content Column */}
        <div className='flex flex-col items-start space-y-6 text-start'>
          <h1 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground max-w-prose text-lg leading-relaxed'>
            {t('subtitle')}
          </p>
          <div className='flex flex-wrap gap-4 pt-2'>
            <HeroCta label={t('cta')} />
          </div>
        </div>

        {/* Visual Column */}
        <div className='border-border/50 bg-muted/20 relative aspect-square w-full overflow-hidden rounded-2xl border lg:aspect-[4/3]'>
          {/* Dot Pattern Grid */}
          <div
            className='text-muted-foreground/30 absolute inset-0'
            style={{
              backgroundImage:
                'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Gradient Glow - Start/Bottom */}
          <div className='bg-primary/20 absolute -start-1/4 -bottom-1/4 h-2/3 w-2/3 rounded-full blur-3xl' />

          {/* Gradient Glow - End/Top */}
          <div className='absolute -end-1/4 -top-1/4 h-2/3 w-2/3 rounded-full bg-blue-400/10 blur-3xl' />

          {/* Glassmorphism Card */}
          <div className='absolute inset-12 rounded-xl border border-white/20 bg-white/5 shadow-sm backdrop-blur-sm' />
        </div>
      </div>
    </section>
  )
}
