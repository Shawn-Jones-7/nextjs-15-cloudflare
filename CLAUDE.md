# CLAUDE.md

## What

Enterprise website template | Next.js 15 + Cloudflare Workers | Multi-locale SSR/SSG

## Why

**Philosophy**: Adopt latest compatible Next.js + Cloudflare stack to maximize new features for performance.

**Purpose**: Production-ready template featuring:
- Multi-locale i18n with SSR/SSG (en/zh primary, es/ar extended)
- Enterprise-grade quality gates (14-step CI, strict TypeScript, Lighthouse 90+)
- Edge deployment on Cloudflare (D1, KV, Queue bindings)

## How

```bash
pnpm dev       # Turbopack dev server
pnpm build     # Production build
pnpm typecheck # TypeScript strict check
pnpm lint      # ESLint (zero warnings)
pnpm test      # Vitest unit tests
pnpm test:e2e  # Playwright E2E
```

## Structure

```text
src/
├── app/[locale]/   # Pages + layouts (SSR/SSG)
├── components/     # UI (layout/, forms/, i18n/)
├── lib/            # Utilities, D1, KV, schemas
├── actions/        # Server Actions (lead submission)
└── middleware.ts   # next-intl locale detection
messages/*.json     # Translations (en/zh/es/ar)
```

## Rules

Contextual rules in `.claude/rules/` auto-load based on file path patterns. Read as needed.

## Stack

Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, next-intl, Cloudflare (D1, KV, Queue)

## Communication

Reply in Chinese. Technical terms stay in English.

## Active Technologies
- TypeScript 5.8.3, Node.js 22+ + Next.js 15.3.2, React 19.1.0, Vitest 3.2.4, Playwright 1.52.0 (002-config-optimization)
- Cloudflare D1 (CONTACT_FORM_D1), Cloudflare KV (NEXT_INC_CACHE_KV) (002-config-optimization)

## Recent Changes
- 002-config-optimization: Added TypeScript 5.8.3, Node.js 22+ + Next.js 15.3.2, React 19.1.0, Vitest 3.2.4, Playwright 1.52.0
