# Feature Specification: Configuration Optimization

**Branch**: `002-config-optimization` | **Date**: 2025-12-09

## Overview

Optimize project configuration files to align with Next.js 15, Cloudflare Workers, and ecosystem best practices. This is a technical debt reduction initiative focusing on build quality, type safety, and developer experience.

## Problem Statement

Current configuration has several issues:

1. **Build checks disabled** - `ignoreDuringBuilds` and `ignoreBuildErrors` bypass quality gates
2. **Code organization** - VeliteWebpackPlugin defined after use (relies on hoisting)
3. **Missing Cloudflare optimizations** - No `images.unoptimized`, no `poweredByHeader: false`
4. **Outdated Vitest config** - Uses deprecated `defineWorkspace` instead of `projects`
5. **ESLint rule issue** - `react-hooks/react-compiler` may cause errors without React Compiler
6. **Missing TypeScript options** - No `verbatimModuleSyntax`, no `@cloudflare/workers-types`

## Requirements

### P0 - Critical (Blocking)

| ID   | Requirement                            | Acceptance Criteria                                                                        |
| ---- | -------------------------------------- | ------------------------------------------------------------------------------------------ |
| P0-1 | Restore build checks in next.config.ts | Remove `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors`; `pnpm build` passes |
| P0-2 | Reorganize VeliteWebpackPlugin         | Move class definition before usage; maintain functionality                                 |
| P0-3 | Fix react-compiler ESLint rule         | Remove or conditionally enable `react-hooks/react-compiler` rule                           |

### P1 - High (This Iteration)

| ID   | Requirement                         | Acceptance Criteria                                                      |
| ---- | ----------------------------------- | ------------------------------------------------------------------------ |
| P1-1 | Add Cloudflare Workers config       | Add `poweredByHeader: false`, `images.unoptimized: true`                 |
| P1-2 | Add TypeScript Cloudflare types     | Install `@cloudflare/workers-types`; add to tsconfig `types`             |
| P1-3 | Migrate Vitest to projects config   | Replace `vitest.workspace.ts` with `test.projects` in `vitest.config.ts` |
| P1-4 | Add verbatimModuleSyntax            | Enable in tsconfig for explicit import/export semantics                  |
| P1-5 | Optimize next-intl messages loading | Implement per-namespace lazy loading for translations                    |

### P2 - Low (Future)

| ID   | Requirement                         | Acceptance Criteria                                      |
| ---- | ----------------------------------- | -------------------------------------------------------- |
| P2-1 | Optimize Playwright CI install      | Change to `pnpm playwright install chromium --with-deps` |
| P2-2 | Document ESLint migration status    | Create tracking issue for flat config native support     |
| P2-3 | Verify tw-animate-css compatibility | Test with Tailwind v4; document findings                 |
| P2-4 | Evaluate Zod vs Arktype             | Analyze overlap; recommend consolidation path            |

## Out of Scope

- New feature development
- Major refactoring
- Dependency version upgrades (beyond type definitions)

## Technical Constraints

- Must maintain compatibility with Cloudflare Workers runtime
- Must pass all existing CI quality gates
- Zero downtime for development workflow

## Dependencies

```
P0-1 ─┬─► P0-2 ─► P1-1
      │
      └─► P1-2 ─► P1-4

P0-3 (independent)

P1-3 (independent)

P1-5 (independent, after P0-1 verified)

P2-* (deferred, no blocking dependencies)
```

| Task | Depends On | Reason                              |
| ---- | ---------- | ----------------------------------- |
| P0-2 | P0-1       | Build must pass before reorganizing |
| P1-1 | P0-2       | Add to reorganized config           |
| P1-4 | P1-2       | Types must be installed first       |

## Success Metrics

| Metric         | Target             | Measurement                  |
| -------------- | ------------------ | ---------------------------- |
| CI Pipeline    | All checks green   | GitHub Actions status        |
| Build Time     | ≤ current baseline | `pnpm build` duration        |
| Type Coverage  | 100% strict        | `pnpm typecheck` exit 0      |
| Bundle Size    | No regression      | First Load JS <100KB         |
| Test Pass Rate | 100%               | `pnpm test && pnpm test:e2e` |

## Risks

| Risk                                   | Impact | Mitigation                                  |
| -------------------------------------- | ------ | ------------------------------------------- |
| `verbatimModuleSyntax` breaks imports  | Medium | Audit existing imports before enabling      |
| Vitest projects migration fails        | Low    | Keep workspace.ts as fallback               |
| next-intl lazy loading complexity      | Medium | Measure bundle impact first                 |
| Build check restoration exposes errors | High   | Fix all errors before removing ignore flags |
