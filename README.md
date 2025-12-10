# B2B GlobalTrade Website

[![CI](https://github.com/Shawn-Jones-7/nextjs-15-cloudflare/actions/workflows/ci.yml/badge.svg)](https://github.com/Shawn-Jones-7/nextjs-15-cloudflare/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Shawn-Jones-7/nextjs-15-cloudflare/graph/badge.svg)](https://codecov.io/gh/Shawn-Jones-7/nextjs-15-cloudflare)

Modern B2B corporate website template for international trade businesses. Built with Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS 4, featuring 4-language internationalization (en/zh/es/ar with RTL support) and Cloudflare Workers deployment.

## Features

- **Modern Tech Stack**: Next.js 15.3 + React 19 + TypeScript 5 + Tailwind CSS 4
- **Cloud-Native**: Cloudflare Workers + D1 Database + KV Storage + Queue
- **4-Language i18n**: English, Chinese, Spanish, Arabic with RTL support
- **Lead Capture**: Secure contact forms with Turnstile protection
- **SEO Optimized**: Sitemap, robots.txt, JSON-LD structured data, OG tags
- **Content Management**: Velite MDX for blog, JSON data layer for products
- **Enterprise Quality**: ESLint 9, TypeScript strict mode, comprehensive CI/CD

## Environment Requirements

- **Node.js**: 22.x (specified in `.nvmrc` and `volta` config)
- **Package Manager**: pnpm 10.x (specified in `packageManager` field)
- **Cloudflare Account**: For D1, KV, and Workers deployment

> Tip: Use nvm/fnm/volta to automatically switch to the correct Node version.

## Environment Variables

### Required for Development

Create a `.env.local` file:

```bash
# Turnstile - Get from https://dash.cloudflare.com/turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key

# Resend - Get from https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_TO_EMAIL=sales@yourdomain.com
```

### Optional Features

```bash
# Airtable Integration - Get from https://airtable.com/create/tokens
AIRTABLE_API_KEY=your_airtable_key
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_NAME=Leads

# WhatsApp Business - Official Business API number
NEXT_PUBLIC_WHATSAPP_NUMBER=+1234567890
```

### Cloudflare Worker Secrets

Use `scripts/setup-secrets.sh` to configure production secrets:

```bash
pnpm wrangler login
bash scripts/setup-secrets.sh
```

## Configuration-Driven Features

### Contact Form

Form fields and validation are configured in the form schema (`src/lib/schemas/lead.ts`).

### WhatsApp Support

When `NEXT_PUBLIC_WHATSAPP_NUMBER` is set, a floating WhatsApp button appears on all pages.

### Brand Customization

Edit `messages/[locale].json` to customize:

```json
{
  "Site": {
    "brandName": "Your Company",
    "contact": {
      "address": "Your Address",
      "phone": "+1 (555) 123-4567",
      "email": "contact@yourcompany.com"
    }
  }
}
```

### Translation Validation

```bash
pnpm validate:translations
```

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd nextjs-15-cloudflare
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Setup Cloudflare Resources

```bash
# Login to Cloudflare
pnpm wrangler login

# Create D1 databases
pnpm wrangler d1 create b2b-website-tag-cache
pnpm wrangler d1 create b2b-website-contact-forms

# Create KV namespace
pnpm wrangler kv:namespace create NEXT_INC_CACHE_KV

# Update wrangler.toml with the IDs from above commands
```

### 4. Start Development

```bash
pnpm dev          # Start dev server with Turbopack
```

### 5. Access Application

- **Main Site**: [http://localhost:3000](http://localhost:3000)
- **English**: [http://localhost:3000/en](http://localhost:3000/en)
- **Chinese**: [http://localhost:3000/zh](http://localhost:3000/zh)
- **Spanish**: [http://localhost:3000/es](http://localhost:3000/es)
- **Arabic (RTL)**: [http://localhost:3000/ar](http://localhost:3000/ar)

## Project Structure

```text
src/
├── app/[locale]/       # Next.js App Router with i18n
│   ├── page.tsx        # Homepage
│   ├── about/          # About page
│   ├── blog/           # Blog listing and posts
│   ├── products/       # Product catalog
│   ├── cases/          # Case studies
│   ├── contact/        # Contact page
│   └── thank-you/      # Form submission success
├── components/
│   ├── layout/         # Header, Footer, Navigation
│   ├── forms/          # ContactForm, ContactModal
│   ├── products/       # ProductCard, ProductGrid
│   ├── blog/           # BlogCard, MDXContent
│   ├── seo/            # StructuredData
│   └── i18n/           # LocaleSwitcher
├── lib/
│   ├── i18n/           # config.ts, routing.ts, metadata.ts
│   ├── d1/             # D1 database client
│   ├── turnstile/      # Turnstile verification
│   ├── api/            # Resend, Airtable helpers
│   ├── schemas/        # Zod validation schemas
│   └── rate-limit.ts   # KV-based rate limiting
├── actions/            # Server Actions (submit-lead.ts)
├── queue/              # Cloudflare Queue consumer
├── data/               # Product data layer
└── middleware.ts       # next-intl locale middleware

messages/               # Translation files
├── en.json             # English (baseline)
├── zh.json             # Chinese
├── es.json             # Spanish
└── ar.json             # Arabic

src/content/            # MDX blog content
├── en/blog/            # English articles
├── zh/blog/            # Chinese articles
├── es/blog/            # Spanish articles
└── ar/blog/            # Arabic articles

config/                 # Quality tool configs
├── dependency-cruiser.cjs
├── jscpd.json
├── knip.jsonc
├── lighthouserc.js
└── semgrep.yml

scripts/                # Utility scripts
├── setup-secrets.sh    # Cloudflare secrets setup
└── validate-translations.ts
```

## Available Scripts

### Development

```bash
pnpm dev               # Start dev server (Turbopack)
pnpm build             # Production build
pnpm start             # Start production server
pnpm preview           # Build and preview locally
```

### Code Quality

```bash
pnpm lint              # ESLint check
pnpm format            # Prettier format
pnpm format:check      # Prettier check
pnpm typecheck         # TypeScript check
pnpm spellcheck        # CSpell check
pnpm lint:md           # Markdownlint check
```

### Quality & Security

```bash
pnpm quality           # Run all quality checks
pnpm lint:unused       # Knip unused code check
pnpm lint:dup          # jscpd duplication check
pnpm lint:deps         # dependency-cruiser check
pnpm circular:check    # Madge circular dependency check
pnpm lint:security     # Semgrep security scan
pnpm validate:translations  # Translation consistency check
```

### Testing

```bash
pnpm test              # Vitest unit tests
pnpm test:watch        # Vitest watch mode
pnpm test:e2e          # Playwright E2E tests
pnpm audit:seo         # Lighthouse CI audit
```

### Deploy Commands

```bash
pnpm deploy            # Build and deploy to Cloudflare
pnpm upload            # Build and upload without deploying
```

## Content Management

### Blog (Velite MDX)

Create blog posts in `src/content/[locale]/blog/`:

```yaml
---
title: 'Article Title'
description: 'Article summary'
publishedAt: '2024-01-15'
author: 'Author Name'
tags: ['Trade', 'Export']
coverImage: '/images/blog/cover.jpg'
---
Article content in MDX format...
```

### Products (JSON Data Layer)

Products are defined in `src/data/products.ts` with translations in `messages/*.json`:

```json
{
  "Products": {
    "items": {
      "product-slug": {
        "name": "Product Name",
        "description": "Product description",
        "specs": {
          "flowRate": "500-2000 m³/h"
        }
      }
    }
  }
}
```

### i18n Rules

1. **Consistent Keys**: All 4 locale files must have identical key structure
2. **RTL Support**: Arabic layout automatically switches to RTL
3. **Validation**: Run `pnpm validate:translations` before committing

## Technical Stack

### Core Framework

- **Next.js 15.3**: App Router, Server Components, Server Actions
- **React 19**: Latest React features
- **TypeScript 5**: Strict mode enabled

### Cloudflare Bindings

- **D1 Database**: `NEXT_TAG_CACHE_D1`, `CONTACT_FORM_D1`
- **KV Storage**: `NEXT_INC_CACHE_KV` (ISR cache)
- **Queue**: `lead-notifications` (async lead processing)

### Development Tools

- **ESLint 9**: 10+ plugins for comprehensive linting
- **Prettier**: Code formatting
- **Lefthook**: Git hooks (pre-commit, commit-msg)
- **Commitlint**: Conventional commit enforcement

### Quality Assurance

- **Knip**: Unused code detection
- **jscpd**: Code duplication check (≤2% threshold)
- **dependency-cruiser**: Architecture validation
- **Madge**: Circular dependency detection
- **Semgrep**: Security scanning
- **Lighthouse CI**: Performance auditing

## Deployment

### Cloudflare Workers

```bash
# First-time setup
pnpm wrangler login
bash scripts/setup-secrets.sh

# Deploy
pnpm deploy
```

### CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. TypeScript check
2. ESLint
3. Quality tools (Knip, jscpd, dep-cruise, Madge)
4. Translation validation
5. Semgrep security scan
6. Vitest unit tests
7. Playwright E2E tests

### Branch Protection

Recommended settings:

- Required status check: `ci`
- Require branches to be up to date
- Require 1 approving review

## Troubleshooting

### Common Issues

**Node version mismatch**:

```bash
nvm use  # or fnm use
```

**Cloudflare binding errors**:

```bash
pnpm cf-typegen  # Regenerate Cloudflare types
```

**Translation validation fails**:

```bash
pnpm validate:translations  # Check which keys are missing
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Based on [Unverceled Next.js](https://github.com/ixahmedxi/unverceled-nextjs) template
- Powered by [OpenNext](https://opennext.js.org/cloudflare) for Cloudflare deployment
