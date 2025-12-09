# Project Constitution

## 1. Project Identity

- **Name**: B2B Foreign Trade Corporate Website
- **Purpose**: Establish a high-performance, professional digital presence for international B2B trade, optimized for lead generation and global trust.
- **Target Audience**: Global B2B clients, procurement managers, and international trade partners.
- **Localization**: Multi-language support (en/zh/es/ar) with strict `hreflang` implementation for international SEO.

## 2. Runtime & Infrastructure

| Component     | Technology                                       |
| ------------- | ------------------------------------------------ |
| Framework     | Next.js 15 (App Router)                          |
| Runtime       | Cloudflare Workers via `@opennextjs/cloudflare`  |
| Content       | MDX static files (architected for CMS migration) |
| Form Security | Cloudflare Turnstile                             |
| Validation    | Zod                                              |
| Persistence   | Cloudflare D1 (Primary System of Record)         |
| Email         | Resend (Transactional)                           |
| CRM Sync      | Airtable (Async background processing)           |

### Wrangler Configuration Requirements

```toml
compatibility_flags = ["nodejs_compat"]
compatibility_date >= "2024-09-23"
```

## 3. Quality Thresholds (CI Gates)

All code changes **must pass** before merging:

### Lighthouse CI

| Metric         | Threshold |
| -------------- | --------- |
| Performance    | ≥ 90      |
| Accessibility  | ≥ 90      |
| Best Practices | ≥ 95      |
| SEO            | ≥ 95      |

### Static Analysis

| Tool               | Threshold              |
| ------------------ | ---------------------- |
| Semgrep            | 0 high/medium severity |
| Knip               | 0 unused exports       |
| dependency-cruiser | No layer violations    |
| jscpd              | ≤ 1% duplication       |

## 4. Development Standards

- **Linting**: ESLint Flat Config (`eslint.config.js`) single entry point
- **Formatting**: Prettier as single source of truth
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`, `strictNullChecks`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Package Manager**: pnpm

## 5. Workflow & Process

```
feature branch → PR → Quality Gate → Review → Squash Merge
```

1. Create short-lived feature branches from `main` (e.g., `feat/hero-section`)
2. Develop locally, adhering to Development Standards
3. Open PR with descriptive title and summary
4. CI pipeline executes all Quality Threshold checks
5. Code review required by at least one peer
6. Squash and merge only after all gates pass

## 6. Non-functional Requirements

### Performance

- Core Web Vitals (LCP, CLS, INP) within "Good" range
- Edge caching for static assets and MDX content
- ISR with tag-based revalidation

### Accessibility

- WCAG 2.1 AA Compliance
- Full keyboard navigability
- Screen reader support

### SEO

- Automated sitemap.xml and robots.txt generation
- JSON-LD Structured Data (Organization, Product, Breadcrumb)
- Proper canonicalization and localized URL structures
- Multi-language sitemap with hreflang

### Resilience

- Form submissions stored in D1 synchronously before external API calls
- Async queue for Resend/Airtable to prevent data loss
- Graceful degradation on external service failures
