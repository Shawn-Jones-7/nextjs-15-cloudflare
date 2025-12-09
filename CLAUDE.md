# CLAUDE.md

## WHAT

- **Project**: B2B Foreign Trade Enterprise Website
- **Stack**: Next.js 15.3 + React 19 + TypeScript 5 + Tailwind CSS 4 + next-intl + Cloudflare Workers
- **Scope**: Multi-locale SSR marketing site (en/zh/es/ar) deployed on Cloudflare

## WHY

- Business goal: Present marketing site and collect leads across locales
- Platform: Cloudflare with D1/KV/Queue bindings (see `wrangler.toml`)
- i18n: Locales defined in `src/lib/i18n/config.ts`; translations in `messages/*.json`
- Quality: CI in `.github/workflows/ci.yml` runs lint, typecheck, Vitest, Playwright

## HOW

### Commands

```bash
pnpm dev       # Turbopack dev server
pnpm build     # Production build
pnpm typecheck # TypeScript
pnpm lint      # ESLint
pnpm test      # Vitest unit tests
pnpm test:e2e  # Playwright E2E
```

### Structure

```
src/
├── app/[locale]/   # Pages + layouts
├── components/     # UI (layout/, forms/, i18n/)
├── lib/            # Utilities, D1, KV, Turnstile, schemas
├── actions/        # Server Actions
├── queue/          # Cloudflare Queue consumer
└── middleware.ts   # next-intl middleware
messages/*.json     # Translations (en/zh/es/ar)
config/             # Quality tools config
```

### Cloudflare Bindings

- D1: `NEXT_TAG_CACHE_D1`, `CONTACT_FORM_D1`
- KV: `NEXT_INC_CACHE_KV`
- Queue: `lead-notifications`

### Constraints

- User-facing text must use translation keys
- Server Components by default; `"use client"` only for interactivity
- Brand/contact data in `Site` namespace (`messages/*`)
- Type safety enforced by strict tsconfig + ESLint

### Progressive Detail

Read `agent_docs/` as needed:
- `architecture.md` — Routing, async APIs, RSC
- `i18n.md` — Translations, RTL
- `coding-standards.md` — Naming, imports
- `testing.md` — Vitest, Playwright
- `security.md` — Validation, rate limiting
- `ui-system.md` — Tailwind, accessibility
- `quality-gates.md` — CI pipeline

### Communication

Reply in Chinese. Technical terms stay in English.

## Active Technologies
- TypeScript 5.8.3 + Next.js 15.3.2, Vitest 3.1.4, ESLint 9.27.0, Tailwind CSS 4.1.7, next-intl 4.5.8 (002-config-optimization)
- D1 (Cloudflare), KV (Cloudflare) (002-config-optimization)

## Recent Changes
- 002-config-optimization: Added TypeScript 5.8.3 + Next.js 15.3.2, Vitest 3.1.4, ESLint 9.27.0, Tailwind CSS 4.1.7, next-intl 4.5.8
