# Coding Standards

## TypeScript

### Strict Mode

- `strict: true`, `noImplicitAny: true`
- **No `any`** — use `unknown` + type guards
- Prefer `interface` over `type`
- Use `satisfies` for type-safe object literals
- Avoid `enum`, use `as const` objects

### Optional Properties

`exactOptionalPropertyTypes` is not enabled in `tsconfig.json`. Explicit `undefined` on optional fields is allowed. Enable the compiler option first if stricter behavior is needed.

## Naming Conventions

| Type           | Convention          | Example            |
| -------------- | ------------------- | ------------------ |
| Components     | PascalCase          | `ContactForm.tsx`  |
| Utilities      | camelCase           | `formatPrice.ts`   |
| Constants      | SCREAMING_SNAKE     | `MAX_ITEMS`        |
| Directories    | kebab-case          | `locale-switcher/` |
| Booleans       | `is/has/can/should` | `isLoading`        |
| Event handlers | `handle` prefix     | `handleSubmit`     |

## Imports

### Path Aliases

Always use `@/` alias. No deep relative imports.

```typescript
// ✅ Good
import { cn } from '@/lib/cn'

// ❌ Bad
import { cn } from '../../../lib/cn'
```

### Import Order

1. React/Next.js
2. Third-party
3. `@/` aliases
4. Relative (same directory)
5. Types (`type` keyword)

## No Hardcoding

- Brand name, contact info → `Site` namespace in messages
- User-facing text → i18n translation keys
- Magic numbers → named constants

## Logging

- **No `console.log` in production**
- Only `console.error`, `console.warn` allowed

## Git Commits

Conventional Commits: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

## Complexity Limits

| Metric                | Limit |
| --------------------- | ----- |
| File lines            | ≤ 500 |
| Function lines        | ≤ 120 |
| Cyclomatic complexity | ≤ 15  |
