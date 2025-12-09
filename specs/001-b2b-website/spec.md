# Functional Specification

> Traceable to: [Constitution](../../docs/spec/constitution.md)

## 1. Feature Overview

High-performance, multi-language corporate website for international B2B trade. Acts as digital storefront prioritizing speed, accessibility, and discoverability across regions (en/zh/es/ar).

**Key Capabilities:**

| Capability         | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| Global Reach       | Native 4-language support with region-specific SEO                 |
| Lead Capture       | Secure, validated inquiry forms with business workflow integration |
| Content Management | MDX-based structured content system                                |
| Trust Signals      | Certifications, case studies, corporate identity                   |

## 2. Page Specifications

### 2.1 Homepage (`/[locale]/`)

**Purpose:** Immediate value proposition delivery and navigation gateway.

**Content Structure:**

- Hero: High-impact imagery, primary headline, "Contact Us" CTA
- Value Proposition: 3-4 key differentiators
- Featured Products/Services: Core offerings summary
- Trust Bar: Client logos, certification badges
- Footer: Quick links, contact info, social links

**User Story:**

> As a procurement manager, I want to immediately see if this company manufactures the product I need so I don't waste time.

### 2.2 About (`/[locale]/about`)

**Purpose:** Establishing corporate legitimacy and human connection.

**Content Structure:**

- Company Story: Timeline/narrative
- Infrastructure: Factory, production capacity, R&D
- Certifications: ISO, CE, FDA with viewable proofs
- Team: Leadership profiles

**User Story:**

> As a vetting agent, I want to verify factory capabilities and certifications to ensure compliance standards.

### 2.3 News/Blog (`/[locale]/news`)

**Purpose:** Demonstrating industry expertise, improving SEO.

**Content Structure:**

- Index: Articles with thumbnails, dates, excerpts
- Post Detail: Full MDX content with related posts

**User Story:**

> As a potential partner, I want to read about exhibitions or product launches to gauge market activity.

### 2.4 Cases/Portfolio (`/[locale]/cases`)

**Purpose:** Social proof and technical capability demonstration.

**Content Structure:**

- Index: Filterable list by industry/product type
- Case Detail: Problem → Solution → Impact

**User Story:**

> As a client, I want to see similar projects to ensure they can handle my requirements.

### 2.5 Contact (`/[locale]/contact`)

**Purpose:** Conversion and physical verification.

**Content Structure:**

- Inquiry Form: Primary lead capture
- Contact Details: Address, Phone, Email, WhatsApp/WeChat
- Map: Google Maps embed (static image fallback)
- Business Hours: With timezone indicators

**User Story:**

> As a buyer, I want to easily send a formal Request for Quotation (RFQ).

## 3. Multi-language Requirements

| Requirement   | Specification                            |
| ------------- | ---------------------------------------- |
| Locales       | `en`, `zh`, `es`, `ar`                   |
| URL Structure | Subdirectory: `/es/about`, `/ar/contact` |
| RTL Support   | Auto-switch for Arabic                   |
| Fallback      | Missing translation → English or notice  |
| Switcher      | Persistent in header/footer              |

## 4. Form Requirements

### Fields

| Field   | Required | Validation         |
| ------- | -------- | ------------------ |
| Name    | Yes      | Min 2 chars        |
| Company | No       | -                  |
| Email   | Yes      | Format + required  |
| Phone   | No       | Format if provided |
| Message | Yes      | Min 10 chars       |

### Behavior

- **Validation:** Real-time client-side
- **Security:** Cloudflare Turnstile + rate limiting
- **Success:** Redirect to thank-you page or success toast
- **Error:** Descriptive error messages
- **Persistence:** Data stored immediately on submission

## 5. SEO Requirements

| Element         | Requirement                                            |
| --------------- | ------------------------------------------------------ |
| Metadata        | Unique `title`/`description` per page per locale       |
| Hreflang        | `rel="alternate" hreflang="x"` for all pages           |
| Sitemap         | Auto-generated `sitemap.xml` with all localized routes |
| Robots          | Allow crawling, point to sitemap                       |
| Structured Data | JSON-LD: Organization, BreadcrumbList, Article         |
| Canonical       | Self-referencing canonical tags                        |

## 6. Accessibility Requirements

| Requirement    | Standard                                    |
| -------------- | ------------------------------------------- |
| Compliance     | WCAG 2.1 Level AA                           |
| Keyboard       | Tab navigation for all interactive elements |
| Screen Readers | Descriptive alt text, ARIA labels           |
| Contrast       | 4.5:1 for normal text                       |
| Focus          | Visible focus states                        |

## 7. Acceptance Criteria

- [ ] Website fully navigable in all 4 languages; RTL correct for Arabic
- [ ] Lighthouse Performance ≥90 on mobile and desktop
- [ ] Contact form submission recorded in D1, triggers notification
- [ ] Google Rich Results Test validates Structured Data
- [ ] Hreflang tags correctly generated for all pages
- [ ] Zero broken internal/cross-language links
