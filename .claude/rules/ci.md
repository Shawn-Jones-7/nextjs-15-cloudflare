---
paths: .github/**/*.yml, config/**/*
---

# CI/CD Rules

## Pipeline Steps

Runs on every PR (`.github/workflows/ci.yml`):

1. Spellcheck (cspell)
2. Markdown lint (markdownlint-cli2)
3. Format (Prettier)
4. Velite content generation
5. Lint (ESLint, zero warnings)
6. TypeScript (tsc, zero errors)
7. Unused code (Knip)
8. Duplication (jscpd)
9. Dependencies (dependency-cruiser)
10. Circular dependencies (Madge)
11. Translation validation
12. Security (Semgrep)
13. Unit tests (Vitest)
14. E2E tests (Playwright)

## Quality Thresholds

| Gate               | Threshold           |
| ------------------ | ------------------- |
| TypeScript         | Zero errors         |
| ESLint             | `--max-warnings=0`  |
| Semgrep            | High/Medium = 0     |
| Knip               | Unused exports = 0  |
| dependency-cruiser | Circular deps = 0   |
| jscpd              | Duplication ≤ 1%    |
| Lighthouse P       | ≥ 90                |
| Lighthouse A       | ≥ 90                |
| Lighthouse BP      | ≥ 95                |
| Lighthouse SEO     | ≥ 90 (temp from 95) |

## Config Files

| Tool               | Config                          |
| ------------------ | ------------------------------- |
| ESLint             | `eslint.config.js`              |
| Prettier           | `prettier.config.js`            |
| cspell             | `cspell.config.yaml`            |
| Knip               | `config/knip.jsonc`             |
| jscpd              | `config/jscpd.json`             |
| dependency-cruiser | `config/dependency-cruiser.cjs` |
| Lighthouse CI      | `config/lighthouserc.js`        |
| Semgrep            | `config/semgrep.yml`            |

## Local Verification

```bash
pnpm typecheck && pnpm lint && pnpm test
```
