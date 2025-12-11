---
paths: src/components/**/*.tsx
---

# React Component Rules

## Server vs Client

| Server (default)    | Client (`"use client"`) |
| ------------------- | ----------------------- |
| Data fetching, SEO  | Interactivity, hooks    |
| async/await         | useState, useEffect     |
| Direct D1/KV access | onClick, browser APIs   |

**Rule**: Push Client boundaries as low as possible.

## Data Serialization

Server → Client props must be serializable:

- ✅ string, number, boolean, plain objects, arrays
- ❌ functions, class instances, Date objects, Symbols

### Date Handling

```typescript
// ❌ Server Component - Error!
return <ClientComponent data={{ createdAt: new Date() }} />

// ✅ Convert to ISO string
return <ClientComponent data={{ createdAt: new Date().toISOString() }} />

// Client Component - parse back
const date = new Date(data.createdAt)
```

## React 19 Form Hooks

### useActionState

Manage Server Action state in Client Components:

```typescript
'use client'
import { useActionState } from 'react'
import { submitLead } from '@/actions/submit-lead'

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitLead, null)

  return (
    <form action={formAction}>
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>Submit</button>
    </form>
  )
}
```

### useFormStatus

Access parent form status (must be nested within `<form>`):

```typescript
'use client'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>Submit</button>
}
```

## Tailwind Patterns

### Conditional Classes

```typescript
import { cn } from '@/lib/cn'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'bg-primary' : 'bg-secondary'
)} />
```

### Dynamic Class Names Forbidden

Tailwind scans source files as plain text:

```typescript
// ❌ Will be purged - cannot detect
<span className={`bg-${color}-100`} />

// ✅ Use literal mapping
const colors = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
} as const

<span className={colors[status]} />
```

## RTL Support (Arabic)

Always use logical properties:

| Physical     | Logical      |
| ------------ | ------------ |
| `ml-*`       | `ms-*`       |
| `mr-*`       | `me-*`       |
| `pl-*`       | `ps-*`       |
| `pr-*`       | `pe-*`       |
| `left-*`     | `start-*`    |
| `right-*`    | `end-*`      |
| `text-left`  | `text-start` |
| `text-right` | `text-end`   |

## Accessibility

- Keyboard accessible interactive elements
- Semantic HTML
- Color contrast ≥ 4.5:1
- Forms: `label` + `aria-invalid` + `aria-describedby`
- Screen reader text: `sr-only` class

## Icons

Lucide React, import individually:

```typescript
import { Globe, Menu, X } from 'lucide-react'
```
