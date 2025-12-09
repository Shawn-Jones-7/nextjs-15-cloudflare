# Implementation Plan: Configuration Optimization

**Branch**: `002-config-optimization` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-config-optimization/spec.md`

## Summary

Optimize Next.js 15 + Cloudflare Workers project configuration to restore build quality gates, improve type safety, and align with ecosystem best practices. Changes span `next.config.ts`, `tsconfig.json`, `vitest.*.ts`, `eslint.config.js`, CI workflow, and i18n loading strategy.

## Technical Context

**Language/Version**: TypeScript 5.8.3
**Primary Dependencies**: Next.js 15.3.2, Vitest 3.1.4, ESLint 9.27.0, Tailwind CSS 4.1.7, next-intl 4.5.8
**Storage**: D1 (Cloudflare), KV (Cloudflare)
**Testing**: Vitest (unit/browser), Playwright (E2E)
**Target Platform**: Cloudflare Workers (Edge Runtime)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: First Load JS <100KB, LCP <2.5s
**Constraints**: Edge-compatible only, no Node.js APIs
**Scale/Scope**: 4 locales (en/zh/es/ar), ~50KB translations total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server Components First | ✅ PASS | Config changes only, no component impact |
| II. i18n Completeness | ✅ PASS | P1-5 improves i18n loading, no translation changes |
| III. Type Safety | ✅ PASS | Enhances type safety (verbatimModuleSyntax, workers-types) |
| IV. Edge-First Architecture | ✅ PASS | Improves Edge compatibility (images.unoptimized) |
| V. Quality Gates | ✅ PASS | Restores build-time checks (P0-1) |

## Project Structure

### Documentation (this feature)

```text
specs/002-config-optimization/
├── spec.md              # Feature specification ✅
├── plan.md              # This file
├── research.md          # Phase 0 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (files to modify)

```text
/                              # Repository root
├── next.config.ts             # P0-1, P0-2, P1-1
├── tsconfig.json              # P1-2, P1-4
├── vitest.config.ts           # P1-3
├── vitest.workspace.ts        # P1-3 (delete)
├── eslint.config.js           # P0-3
├── package.json               # P1-2
├── src/
│   ├── app/[locale]/layout.tsx  # P1-5: messages loading
│   └── i18n/request.ts          # P1-5: namespace splitting
└── .github/workflows/ci.yml   # P2-1
```

**Structure Decision**: Single Next.js web application. Config files at root, i18n logic in `src/i18n/`.

## Phase 0: Research ✅

See [research.md](./research.md) for full details.

| Topic | Decision | Risk |
|-------|----------|------|
| React Compiler | Remove ESLint rule (not configured) | None |
| Vitest projects | Migrate to inline `test.projects` config | Low |
| verbatimModuleSyntax | Safe to enable (code already compliant) | Low |
| @cloudflare/workers-types | Install latest version | None |
| next-intl lazy loading | **Deferred to P2** (current size acceptable) | None |

---

## Phase 1: Design

### P0-1: Restore next.config.ts Build Checks

**File**: `next.config.ts`

```diff
const nextConfig: NextConfig = {
  reactStrictMode: true,
-  eslint: {
-    ignoreDuringBuilds: true,
-  },
-  typescript: {
-    ignoreBuildErrors: true,
-  },
  webpack: (config) => { ... }
};
```

**Verification**: `pnpm typecheck && pnpm lint && pnpm build`

---

### P0-2: Reorganize VeliteWebpackPlugin

**File**: `next.config.ts`

```typescript
// BEFORE: Class defined after usage (hoisting)
// AFTER: Class defined before nextConfig

class VeliteWebpackPlugin {
  static started = false;
  apply(compiler: { hooks: { beforeCompile: { tapPromise: (name: string, callback: () => Promise<void>) => void } } }) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const development = process.env.NODE_ENV !== 'production';
      const { build } = await import('velite');
      await build({ watch: development, clean: !development });
    });
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
};
```

---

### P0-3: Fix react-compiler ESLint Rule

**File**: `eslint.config.js`

```diff
  {
    rules: {
-      'react-hooks/react-compiler': 'error',
      'n/exports-style': ['error', 'exports'],
```

**Rationale**: Rule requires `babel-plugin-react-compiler` which is not configured.

---

### P1-1: Add Cloudflare Workers Config

**File**: `next.config.ts`

```diff
const nextConfig: NextConfig = {
  reactStrictMode: true,
+  poweredByHeader: false,
+  images: {
+    unoptimized: true,
+  },
  webpack: (config) => { ... }
};
```

**Rationale**:
- `poweredByHeader: false` - Security best practice
- `images.unoptimized: true` - Cloudflare Workers doesn't support Next.js Image Optimization

---

### P1-2: Add TypeScript Cloudflare Types

**Commands**:
```bash
pnpm add -D @cloudflare/workers-types
```

**File**: `tsconfig.json`

```diff
{
  "compilerOptions": {
+    "types": ["@cloudflare/workers-types"],
    "strict": true,
```

---

### P1-3: Migrate Vitest to Projects Config

**Delete**: `vitest.workspace.ts`

**File**: `vitest.config.ts`

```typescript
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: [
            ...defaultExclude,
            './src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)',
          ],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: defaultExclude,
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
```

**Update**: `package.json` scripts

```diff
-    "test": "vitest --workspace=vitest.workspace.ts --browser.headless --run",
-    "test:browser": "vitest --workspace=vitest.workspace.ts",
-    "test:watch": "vitest --workspace=vitest.workspace.ts --browser.headless",
+    "test": "vitest --browser.headless --run",
+    "test:browser": "vitest",
+    "test:watch": "vitest --browser.headless",
```

---

### P1-4: Add verbatimModuleSyntax

**File**: `tsconfig.json`

```diff
{
  "compilerOptions": {
+    "verbatimModuleSyntax": true,
    "strict": true,
```

**Rationale**: Ensures explicit `import type` for type-only imports, improving tree-shaking and module semantics.

---

### P1-5: Optimize next-intl Messages Loading

**Status**: **DEFERRED TO P2**

**Rationale**: Current translation files (~12KB/locale) are well below the 30KB performance threshold. Implementing namespace-based lazy loading adds complexity without measurable benefit.

**Future Trigger**: When any locale file exceeds 30KB.

---

### P2 Tasks (Future)

| ID | Task | Notes |
|----|------|-------|
| P2-1 | Optimize Playwright CI install | Change to `chromium` only |
| P2-2 | Document ESLint flat config status | Track @next/eslint-plugin-next native support |
| P2-3 | Verify tw-animate-css v4 compatibility | Test and document |
| P2-4 | Evaluate Zod vs Arktype | Analyze consolidation path |

---

## Verification Checklist

| Task | Command | Expected |
|------|---------|----------|
| P0-1 | `pnpm typecheck && pnpm lint` | Exit 0 |
| P0-2 | `pnpm build` | Success |
| P0-3 | `pnpm lint` | No react-compiler errors |
| P1-1 | `pnpm build` | No image warnings |
| P1-2 | `pnpm typecheck` | CloudflareEnv resolved |
| P1-3 | `pnpm test` | All tests pass |
| P1-4 | `pnpm typecheck` | No import errors |
| **All** | **Full CI** | **All checks green** |

---

## Complexity Tracking

No constitution violations. All changes within limits:
- File modifications: Config files only (<500 lines each)
- No new runtime dependencies
- No architectural changes
