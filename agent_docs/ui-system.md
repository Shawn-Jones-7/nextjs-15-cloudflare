# UI Design System

## Styling

- **Framework**: Tailwind CSS 4
- **Utility**: `cn()` from `@/lib/cn` for conditional classes
- **Colors**: CSS variables in `src/app/globals.css`

## Component Organization

```
src/components/
├── layout/     # Header, Footer
├── forms/      # ContactForm, form inputs
└── i18n/       # LocaleSwitcher
```

## Tailwind Patterns

### Conditional Classes

```typescript
import { cn } from '@/lib/cn';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  variant === 'primary' ? 'bg-primary' : 'bg-secondary'
)} />
```

### Dynamic Class Names Forbidden

Tailwind purges dynamic classes:

```typescript
// ❌ Will be purged
<span className={`bg-${color}-100`} />

// ✅ Use literal mapping
const colors = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
} as const;
<span className={colors[status]} />
```

## RTL Support

Arabic locale uses RTL. Use Tailwind RTL variants:

```tsx
<button className="right-4 rtl:left-4 rtl:right-auto">
```

## Responsive Design

Mobile-first with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Accessibility

- Keyboard accessible interactive elements
- Semantic HTML
- Color contrast ≥ 4.5:1
- Forms: `label` + `aria-invalid` + `aria-describedby`
- Screen reader text: `sr-only` class

## Icons

Lucide React, import individually:

```typescript
import { Globe, Menu, X } from 'lucide-react';
```

## Dark Mode

Uses `next-themes`:

```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

Theme toggle in Footer, uses `mounted` state for hydration safety.

## Images

- Use `next/image`
- Set `priority` for above-fold
- Always set `sizes` for responsive loading
