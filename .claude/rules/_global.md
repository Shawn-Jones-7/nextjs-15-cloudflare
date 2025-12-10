# Global Rules

## Project Context

B2B Foreign Trade Enterprise Website | Next.js 15.3 + React 19 + TypeScript 5 + Tailwind CSS 4 + Cloudflare Workers

## Commands

```bash
pnpm dev       # Turbopack dev server
pnpm build     # Production build
pnpm typecheck # TypeScript strict check
pnpm lint      # ESLint (zero warnings)
pnpm test      # Vitest unit tests
pnpm test:e2e  # Playwright E2E
```

## Code Style

- No `console.log` in production — only `console.error`, `console.warn`
- No hardcoded text — use i18n keys or `Site` namespace
- No magic numbers — use named constants
- Conventional Commits: `type(scope): description`

## Complexity Limits

| Metric         | Production | Test |
| -------------- | ---------- | ---- |
| File lines     | 500        | 800  |
| Function lines | 120        | 700  |
| Complexity     | 15         | 20   |

## Security Essentials

- All user input validated with Zod schemas
- Never commit secrets (`.env`, API keys)
- No unfiltered `dangerouslySetInnerHTML`
- URLs validate protocol (`https://` or `/` only)
