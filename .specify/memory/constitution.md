<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0
Modified sections:
  - II. i18n Completeness: Added routing rules, CSS logical properties requirement
Added: localePrefix strategy, language detection priority, slug translation policy, hreflang requirement
Removed sections: None
Templates requiring updates: ✅ All templates are generic and compatible
Follow-up TODOs: None
-->

# B2B Corporate Website Constitution

## Core Principles

### I. Server Components First

All pages and components MUST be Server Components by default. The `"use client"` directive is ONLY permitted when the component requires:

- Browser APIs (window, document, localStorage)
- React hooks (useState, useEffect, useRef)
- Event handlers (onClick, onChange, onSubmit)

**Rationale**: Server Components reduce bundle size, improve SEO, and enable direct access to Cloudflare bindings (D1, KV, Queue).

### II. i18n Completeness (NON-NEGOTIABLE)

All user-facing text MUST use translation keys from `messages/*.json`. Hardcoded strings in components are forbidden.

- Translation keys MUST exist in ALL 4 locales (en, zh, es, ar)
- Brand/contact information MUST use the `Site` namespace
- RTL support MUST be tested for Arabic locale
- CSS MUST use logical properties (ms/me/start/end), NOT physical directions (ml/mr/left/right)

**Routing Rules**:

- `localePrefix: 'always'` - All URLs include locale prefix (/en/..., /zh/...)
- Root path `/` detects language: URL > Cookie > Accept-Language > default (en)
- Product/blog slugs are NOT translated (same slug across all locales)
- Each page MUST generate hreflang tags for all locale variants + x-default

**Rationale**: Enterprise websites serve global audiences. Incomplete i18n breaks user trust and market reach. Consistent URL structure improves SEO and maintainability.

### III. Type Safety

TypeScript strict mode is mandatory. No `any` types in production code.

- Use `interface` for object shapes
- Use `as const` for literal unions (no `enum`)
- Validate all external input with Zod schemas
- Environment variables validated via `src/env.ts`
- tsconfig MUST enable: `strict`, `noImplicitAny`, `strictNullChecks`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`, `noUncheckedIndexedAccess`

**Rationale**: Type errors caught at compile time prevent runtime failures in production.

### IV. Edge-First Architecture

All features MUST be compatible with Cloudflare Workers runtime.

- No Node.js-only APIs (fs, path, child_process)
- Database access via D1 only
- Caching via KV only
- Async processing via Queue only
- CAPTCHA via Turnstile only

**Rationale**: Edge deployment provides global low-latency access and cost efficiency.

### V. Quality Gates

All code MUST pass CI pipeline before merge:

- TypeScript: Zero errors (strict options enforced)
- ESLint: Zero warnings (Flat Config single entrypoint)
- Prettier: Formatted
- Semgrep: High/Medium severity findings = 0
- Knip: Unused exports = 0
- dependency-cruiser: No cross-layer violations
- jscpd: Code duplication ≤ 1%
- Lighthouse CI: Performance ≥90, Accessibility ≥90, Best Practices ≥95, SEO ≥95
- Vitest: All tests pass
- Playwright: E2E tests pass

**Rationale**: Automated quality gates prevent regression and maintain codebase health.

## Technical Constraints

### Stack Requirements

- **Framework**: Next.js 15.x (App Router only)
- **Runtime**: Cloudflare Workers via @opennextjs/cloudflare
- **Styling**: Tailwind CSS 4.x only (no CSS-in-JS)
- **i18n**: next-intl (no other i18n libraries)
- **Validation**: Zod for schemas, arktype for env

### Complexity Limits

| Metric                | Production | Test | Config |
| --------------------- | ---------- | ---- | ------ |
| File lines            | ≤500       | ≤800 | ≤800   |
| Function lines        | ≤120       | ≤700 | ≤250   |
| Cyclomatic complexity | ≤15        | ≤20  | ≤18    |

### Bundle Budgets

- First Load JS: <100KB (gzipped)
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `feature/*`: New features
- `fix/*`: Bug fixes

### Commit Convention

Conventional Commits required: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

### Review Requirements

- All PRs require passing CI
- Constitution compliance verified via checklist
- No merge without approval

### Release Process

- Versioning via Changesets
- Automated releases on `main` push
- Cloudflare Pages deployment

## Governance

This constitution supersedes all other development practices. Amendments require:

1. Documented justification for change
2. Impact analysis on existing code
3. Migration plan if breaking
4. Version increment per semantic versioning

All PRs and code reviews MUST verify compliance with these principles. Complexity beyond limits MUST be justified in PR description with rejected alternatives.

For runtime development guidance, consult `CLAUDE.md` and `agent_docs/`.

**Version**: 1.2.0 | **Ratified**: 2025-01-08 | **Last Amended**: 2025-01-08
