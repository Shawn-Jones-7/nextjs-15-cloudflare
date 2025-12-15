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

Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Motion, next-intl, Cloudflare (D1, KV, Queue)

## Communication

Reply in Chinese. Technical terms stay in English.

## Development Context

- **Environment**: No restrictions (Bun, Python, any tooling allowed)
- **Project Nature**: Long-term product development, not template distribution
- **Workflow**: User provides requirements → LLM implements code

## Decision Authority

LLM has broad technical decision-making power (including architecture), with two constraints:

1. **Transparency**: User must be informed of all decisions
2. **Guiding Principles** (in priority order):
   - Maximize performance
   - Maximize code quality

## Collaboration Preferences

| Aspect                | Preference                                                                      |
| --------------------- | ------------------------------------------------------------------------------- |
| **Solution lifespan** | Long-term, stable solutions only. No short-term hacks or temporary fixes.       |
| **Explanation style** | Plain language with real-life analogies. Avoid jargon-heavy explanations.       |
| **Iteration rhythm**  | Flexible (small or large steps), but checkpoint confirmation required mid-task. |
| **Hardcoding**        | Strictly forbidden unless compelling justification provided.                    |

## Active Technologies

- TypeScript 5.9.3, Node.js 22+ + Next.js 15.3.8, React 19.2.3, Vitest 4.0.15, Playwright 1.57.0
- Cloudflare D1 (CONTACT_FORM_D1), Cloudflare KV (NEXT_INC_CACHE_KV)
- Motion 12.x (animation library, successor to Framer Motion)

## Recent Changes

- Batch 2: Vitest 4.0.15 (vitest-browser-react v2 API), @eslint-react/eslint-plugin 2.3.13, eslint-plugin-unicorn 62, commitlint 20, lefthook 2
- Batch 1: TypeScript 5.9.3, React 19.2.3, Tailwind CSS 4.1.18, Playwright 1.57.0, ESLint ecosystem updates
- Security patch: Next.js 15.3.8 (CVE-2025-55184/55183), @opennextjs/cloudflare 1.14.5, wrangler 4.54.0

## Codebase Exploration

Use **Augment `codebase-retrieval`** for semantic/exploratory queries before attempting multiple Grep searches. Built-in tools (Grep, Glob, Read) suffice for precise symbol lookups.

**Mandatory**: Before any coding action, use **Context7** (`resolve-library-id` → `get-library-docs`) to query official documentation, ensuring implementations align with latest APIs and best practices.
