---
paths: messages/*.json
---

# Translation Messages Rules

## File Structure

```
messages/
├── en.json    # English (default)
├── zh.json    # Chinese
├── es.json    # Spanish
└── ar.json    # Arabic (RTL)
```

## Message Schema

```json
{
  "Site": {
    "brandName": "GlobalTrade",
    "contact": { "address": "...", "phone": "...", "email": "..." },
    "social": { "linkedin": "...", "twitter": "..." }
  },
  "Navigation": {
    "home": "Home",
    "products": "Products",
    "about": "About",
    "contact": "Contact"
  },
  "HomePage": { "title": "...", "description": "...", "cta": "..." },
  "ContactPage": { "title": "...", "form": { ... } },
  "Footer": { "copyright": "...", "themeToggle": "..." },
  "Common": { "backToTop": "Back to top", "loading": "Loading..." }
}
```

## Adding Translations

1. Add keys to **all 4 locale files** with identical structure
2. Use namespace organization: `Namespace.section.key`
3. Run `pnpm typecheck` to verify
4. Test RTL rendering for Arabic

## Accessing Nested Keys

```typescript
const site = useTranslations('Site')
site('contact.phone') // "+1 (555) 123-4567"
```

## Brand/Contact Data

All brand names, addresses, contact info must use `Site` namespace — never hardcode.
