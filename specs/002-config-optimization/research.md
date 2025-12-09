# Research: Configuration Optimization

**Date**: 2025-12-09 | **Branch**: `002-config-optimization`

## 1. React Compiler ESLint Rule

### Question

Is `babel-plugin-react-compiler` configured in this project?

### Finding

**NO** - The project does not have React Compiler configured.

- `eslint.config.js:145` has `'react-hooks/react-compiler': 'error'`
- No `babel-plugin-react-compiler` in `package.json`
- No babel config file exists

### Decision

**Remove the rule** - The `react-hooks/react-compiler` rule is only useful when React Compiler is actively used. Without the compiler, this rule may cause false positives or confusion.

### Alternative Considered

- Conditionally enable the rule → Rejected (adds complexity for no benefit)
- Install React Compiler → Rejected (out of scope, requires significant testing)

---

## 2. Vitest Projects Migration

### Question

What's the exact migration syntax from `defineWorkspace` to `projects` in Vitest 3.x?

### Finding

Vitest 3.x supports inline `projects` array in `vitest.config.ts`:

```typescript
// OLD: vitest.workspace.ts
import { defineWorkspace } from 'vitest/config'
export default defineWorkspace([...])

// NEW: vitest.config.ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
          exclude: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['./src/**/*.browser.{test,spec}.?(c|m)[jt]s?(x)'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
```

### Decision

**Migrate to inline projects** - Single config file, better maintainability.

### Alternative Considered

- Keep separate workspace file → Rejected (deprecated in Vitest 3.x)

---

## 3. verbatimModuleSyntax Impact

### Question

Which files need import style changes when enabling `verbatimModuleSyntax`?

### Finding

- 15 files use `import type` syntax (already correct)
- Project already uses `@typescript-eslint/consistent-type-imports` with `prefer: 'type-imports'`
- ESLint auto-fixes will handle any issues

### Decision

**Safe to enable** - Existing code already follows type-import conventions. Any edge cases will be caught by ESLint.

### Risk

Low - ESLint provides auto-fix for inconsistent imports.

---

## 4. @cloudflare/workers-types Compatibility

### Question

What version is compatible with wrangler 4.16.1?

### Finding

- Current wrangler version: `4.16.1`
- `@cloudflare/workers-types` latest version is compatible
- Installation: `pnpm add -D @cloudflare/workers-types`

### Decision

**Install latest version** - No version pinning needed, types track wrangler releases.

### Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@cloudflare/workers-types"]
  }
}
```

---

## 5. next-intl Lazy Loading Pattern

### Question

Best pattern for namespace-based message splitting?

### Finding

next-intl supports dynamic imports in `getRequestConfig`:

```typescript
// Option A: Split by namespace files
const messages = {
  ...(await import(`../../messages/${locale}/common.json`)).default,
  ...(await import(`../../messages/${locale}/products.json`)).default,
}

// Option B: Single file with selective namespace passing
// In layout.tsx, pass only needed namespaces to NextIntlClientProvider
```

### Decision

**Defer to P2** - Current translations (~12KB/locale) are below performance threshold (30KB). Document as future optimization when translations grow.

### Rationale

- Current bundle impact is minimal
- Splitting adds complexity
- Premature optimization

---

## Summary

| Topic                  | Decision                 | Risk |
| ---------------------- | ------------------------ | ---- |
| React Compiler         | Remove ESLint rule       | None |
| Vitest projects        | Migrate to inline config | Low  |
| verbatimModuleSyntax   | Enable                   | Low  |
| workers-types          | Install latest           | None |
| next-intl lazy loading | Defer to future          | None |
