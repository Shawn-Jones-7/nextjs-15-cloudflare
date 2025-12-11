---
paths: src/lib/i18n/**/*.ts, src/middleware.ts, src/app/[locale]/**/layout.tsx
---

# i18n Routing Rules

## Configuration

| Setting     | Value                                  |
| ----------- | -------------------------------------- |
| Library     | next-intl ^4.5                         |
| Locales     | `en` (default), `zh`, `es`, `ar`       |
| Prefix Mode | `always` (all URLs have locale prefix) |
| RTL Support | Arabic (`ar`) uses `dir="rtl"`         |

## URL Pattern

```
/en              → English home
/zh              → Chinese home
/ar              → Arabic home (RTL)
/en/products     → English products
```

Slugs are NOT translated — same slug across all locales.

## Detection Priority

```
1. URL Path        /zh/products      → zh (explicit)
2. Cookie          NEXT_LOCALE=zh    → zh (remembered)
3. Accept-Language zh-CN,en;q=0.9    → zh (browser)
4. Default                           → en (fallback)
```

Set `localeDetection: false` in routing config to disable cookie/header detection.

## Page Props Type (Next.js 15)

```typescript
import type { Locale } from '@/lib/i18n/config'

interface PageProps {
  params: Promise<{ locale: Locale }> // Promise required in Next.js 15
}
```

**Important**: Always use `Locale` type (not `string`) for type safety. Import from `@/lib/i18n/config`.

## Server Components

```typescript
import { getTranslations } from 'next-intl/server'
import { setRequestLocale } from 'next-intl/server'

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)  // Required for static rendering optimization

  const t = await getTranslations({ locale, namespace: 'HomePage' })
  return <h1>{t('title')}</h1>
}
```

## Static Generation

```typescript
import { routing } from '@/lib/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}
```

## Layout with Messages

```typescript
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

## Client Components

```typescript
'use client'
import { useTranslations } from 'next-intl'

export function Header() {
  const t = useTranslations('Navigation')
  return <nav>{t('home')}</nav>
}
```

## RTL Layout

Set in `app/[locale]/layout.tsx`:

```typescript
import { isRtl } from '@/lib/i18n/config'

const direction = isRtl(locale) ? 'rtl' : 'ltr'
<html lang={locale} dir={direction}>
```

## Key Files

| File                      | Purpose                    |
| ------------------------- | -------------------------- |
| `src/lib/i18n/config.ts`  | Locale list, RTL detection |
| `src/lib/i18n/routing.ts` | Route definition           |
| `src/i18n/request.ts`     | Message loading            |
| `src/middleware.ts`       | Locale detection           |
