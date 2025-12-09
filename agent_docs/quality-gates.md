# Quality Gates & CI/CD

## CI Pipeline

Runs on every PR (`.github/workflows/ci.yml`):

1. **Spellcheck** — cspell
2. **Markdown lint** — markdownlint-cli2
3. **Format** — Prettier
4. **Lint** — ESLint (zero warnings)
5. **TypeScript** — tsc (zero errors)
6. **Unused code** — Knip
7. **Duplication** — jscpd
8. **Dependencies** — dependency-cruiser
9. **Security** — Semgrep
10. **Unit tests** — Vitest
11. **E2E tests** — Playwright

## Complexity Limits

| File Type  | Lines | Function Lines | Complexity |
| ---------- | ----- | -------------- | ---------- |
| Production | 500   | 120            | 15         |
| Config     | 800   | 250            | 18         |
| Test       | 800   | 700            | 20         |

## Local CI

```bash
pnpm typecheck && pnpm lint && pnpm test
```

## Thresholds (per Constitution)

| Gate               | Threshold                          |
| ------------------ | ---------------------------------- |
| TypeScript         | Zero errors (strict options)       |
| ESLint             | Zero warnings (`--max-warnings=0`) |
| Semgrep            | High/Medium severity = 0           |
| Knip               | Unused exports = 0                 |
| dependency-cruiser | Cross-layer violations = 0         |
| jscpd              | Duplication ≤ 1%                   |
| Lighthouse P       | ≥ 90                               |
| Lighthouse A       | ≥ 90                               |
| Lighthouse BP      | ≥ 95                               |
| Lighthouse SEO     | ≥ 95                               |

## Quality Tools

| Tool               | Config                          | Purpose        |
| ------------------ | ------------------------------- | -------------- |
| ESLint             | `eslint.config.js`              | Code quality   |
| Prettier           | `prettier.config.js`            | Formatting     |
| cspell             | `cspell.config.yaml`            | Spelling       |
| Knip               | `config/knip.jsonc`             | Unused exports |
| jscpd              | `config/jscpd.json`             | Duplication    |
| dependency-cruiser | `config/dependency-cruiser.cjs` | Circular deps  |
| Lighthouse CI      | `config/lighthouserc.js`        | Performance    |
| Semgrep            | `config/semgrep.yml`            | Security       |

## Branch Strategy

- CI configured for `main` branch
- Release via Changesets (`pnpm changeset`)
