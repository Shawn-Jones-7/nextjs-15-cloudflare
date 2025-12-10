---
paths: "**/*.{ts,tsx}"
---

# TypeScript Rules

## Strict Mode

- `strict: true`, `noImplicitAny: true` enforced
- No `any` — use `unknown` + type guards
- Avoid `enum`, use `as const` objects

## Type Declarations

- Use `type` for unions, mapped types, utility type compositions
- Use `interface` for object shapes and component props (project convention)
- Use `interface` for inheritance (`extends` performs better than `&`)
- Avoid `interface` declaration merging — can cause unexpected behavior

```typescript
// ✅ Good - interface for component props
interface ContactFormProperties {
  className?: string
  locale: Locale
}

// ✅ Good - type for unions
type Status = 'pending' | 'completed' | 'failed'

// ✅ Good - interface for inheritance
interface Lead extends Omit<LeadInput, 'turnstileToken'> {
  id: string
}
```

## `satisfies` Operator

Ensure type safety while preserving literal types:

```typescript
// ✅ Preserves exact types
const routes = {
  home: '/',
  about: '/about',
} satisfies Record<string, string>
// Type: { home: '/', about: '/about' } — NOT Record<string, string>

// ✅ Combined with as const
const config = {
  locales: ['en', 'zh', 'es', 'ar'],
  defaultLocale: 'en',
} as const satisfies {
  locales: readonly string[]
  defaultLocale: string
}
```

## Naming Conventions

| Type           | Convention          | Example            |
| -------------- | ------------------- | ------------------ |
| Components     | PascalCase          | `ContactForm.tsx`  |
| Utilities      | camelCase           | `formatPrice.ts`   |
| Constants      | SCREAMING_SNAKE     | `MAX_ITEMS`        |
| Directories    | kebab-case          | `locale-switcher/` |
| Booleans       | `is/has/can/should` | `isLoading`        |
| Event handlers | `handle` prefix     | `handleSubmit`     |

## Utility Types

```typescript
// Omit - exclude properties
interface Lead extends Omit<LeadInput, 'turnstileToken'> {
  id: string
}

// Pick - select properties
type UserBasic = Pick<User, 'id' | 'name'>

// Partial - make all optional
type UpdateUser = Partial<User>

// Record - key-value maps
type Translations = Record<Locale, string>
```

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
