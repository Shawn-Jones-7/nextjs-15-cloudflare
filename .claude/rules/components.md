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

## Link with Radix UI Components

Use `asChild` pattern to integrate `next-intl` Link with Radix primitives:

```typescript
// NavigationMenuLink
<NavigationMenuLink asChild className={styles}>
  <Link href="/about">{label}</Link>
</NavigationMenuLink>

// Button
<Button asChild>
  <Link href="/contact">Contact</Link>
</Button>

// DropdownMenuItem
<DropdownMenuItem asChild>
  <Link href="/settings">Settings</Link>
</DropdownMenuItem>
```

`asChild` merges styles/props onto the child, letting `Link` render the final `<a>`.

## Motion Animations

Use `motion` (successor to Framer Motion) for animations. Import from `motion/react`:

```typescript
'use client'
import { motion, AnimatePresence } from 'motion/react'

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// Scroll-triggered animation
<motion.section
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
  {content}
</motion.section>

// Page transitions (wrap in layout)
<AnimatePresence mode="wait">
  <motion.div key={pathname} exit={{ opacity: 0 }}>
    {children}
  </motion.div>
</AnimatePresence>
```

### Animation Guidelines

- Use `'use client'` directive for animated components
- Prefer `whileInView` over scroll listeners for performance
- Set `viewport={{ once: true }}` to animate only on first view
- Keep animations subtle for B2B: 0.2-0.4s duration, small transforms
- Use `useReducedMotion` hook to respect user preferences

## Icons

Lucide React, import individually:

```typescript
import { Globe, Menu, X } from 'lucide-react'
```
