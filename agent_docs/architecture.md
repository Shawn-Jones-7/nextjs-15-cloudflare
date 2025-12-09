# Architecture Guide

## Next.js 15 App Router

### Async Request APIs

These APIs **must be awaited** in Next.js 15:

| API            | Usage                                  |
| -------------- | -------------------------------------- |
| `params`       | `const { locale } = await params`      |
| `searchParams` | `const { query } = await searchParams` |
| `cookies()`    | `await cookies()`                      |
| `headers()`    | `await headers()`                      |

### Page Props Pattern

```typescript
interface PageProps {
  params: Promise<{ locale: string }>
  searchParams?: Promise<Record<string, string | undefined>>
}
```

## Routing

- **Pattern**: `/[locale]/page-name`
- **Locales**: `en`, `zh`, `es`, `ar` (defined in `src/lib/i18n/routing.ts`)
- **RTL**: Arabic (`ar`) uses RTL layout
- **Middleware**: `src/middleware.ts` handles locale detection

## Layout Hierarchy

```
src/app/
├── globals.css
├── favicon.ico
└── [locale]/
    ├── layout.tsx          # Providers (NextIntl + ThemeProvider) + SEO
    ├── page.tsx            # Home
    ├── about/page.tsx
    ├── news/
    │   ├── page.tsx        # Listing
    │   └── [slug]/page.tsx # Detail
    ├── cases/
    │   ├── page.tsx
    │   └── [slug]/page.tsx
    └── contact/
        ├── page.tsx        # Form
        └── thank-you/page.tsx
```

## Server vs Client Components

| Server (default)    | Client (`"use client"`) |
| ------------------- | ----------------------- |
| Data fetching, SEO  | Interactivity, hooks    |
| async/await         | useState, useEffect     |
| Direct D1/KV access | onClick, browser APIs   |

**Rule**: Push Client boundaries as low as possible.

### Data Serialization

Server → Client props must be serializable:

- ✅ string, number, boolean, plain objects, arrays
- ❌ functions, class instances, Date objects

## Cloudflare Integration

- Server Actions access D1/KV/Queue via `getCloudflareContext` (see `src/actions/submit-lead.ts`)
- D1 helpers in `src/lib/d1/`
- Queue consumer in `src/queue/consumer.ts` handles Resend/Airtable syncs

## Key Files

| File                      | Purpose                      |
| ------------------------- | ---------------------------- |
| `src/lib/i18n/routing.ts` | Locale config, pathnames     |
| `src/lib/i18n/config.ts`  | Locale labels, RTL detection |
| `src/middleware.ts`       | next-intl middleware         |
| `wrangler.toml`           | Cloudflare bindings          |
