# Implementation Plan: Configuration Optimization & Test Coverage 85%

**Branch**: `002-config-optimization` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-config-optimization/spec.md`

## Summary

Optimize project configuration files (Next.js, TypeScript, Vitest, ESLint) and establish comprehensive test coverage infrastructure targeting 85% global coverage. This combines technical debt reduction with quality assurance foundation for AI-assisted development.

## Technical Context

**Language/Version**: TypeScript 5.8.3, Node.js 22+
**Primary Dependencies**: Next.js 15.3.2, React 19.1.0, Vitest 3.2.4, Playwright 1.52.0
**Storage**: Cloudflare D1 (CONTACT_FORM_D1), Cloudflare KV (NEXT_INC_CACHE_KV)
**Testing**: Vitest (unit + browser), Playwright (E2E)
**Target Platform**: Cloudflare Workers (Edge Runtime)
**Project Type**: Web application (Next.js App Router, SSG/SSR)
**Performance Goals**: Lighthouse ≥90, First Load JS <100KB
**Constraints**: Edge-compatible only (no Node.js-only APIs), 85% test coverage threshold
**Scale/Scope**: ~59 source files, ~12 testable lib files, ~70-90 test cases needed

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Server Components First | ✅ PASS | Tests don't affect component architecture |
| II. i18n Completeness | ✅ PASS | Tests will validate i18n config & RTL detection |
| III. Type Safety | ✅ PASS | Tests enforce strict TypeScript, no `any` in mocks |
| IV. Edge-First Architecture | ✅ PASS | Mocks simulate Cloudflare bindings (D1, KV) |
| V. Quality Gates | ✅ PASS | Coverage thresholds added to CI pipeline |

**Complexity Limits Check**:
| Metric | Limit | Expected | Status |
|--------|-------|----------|--------|
| Test file lines | ≤800 | ~100-200 per file | ✅ PASS |
| Test function lines | ≤700 | ~10-30 per test | ✅ PASS |
| Cyclomatic complexity | ≤20 | Low (test assertions) | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/002-config-optimization/
├── plan.md              # This file
├── spec.md              # Feature specification (updated)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (test data models)
├── quickstart.md        # Phase 1 output (test writing guide)
├── contracts/           # Phase 1 output (mock interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── tests/                          # Test infrastructure (NEW)
│   ├── setup.ts                    # Global test setup
│   ├── mocks/
│   │   ├── cloudflare.ts           # D1/KV/Env bindings mock
│   │   ├── turnstile.ts            # Turnstile API mock
│   │   └── resend.ts               # Resend API mock
│   ├── fixtures/
│   │   ├── leads.ts                # Lead data factory
│   │   └── forms.ts                # Form payload fixtures
│   └── utils/
│       └── server-action.ts        # Server Action test helper
├── lib/
│   ├── cn.ts                       # TO_TEST: className utility
│   ├── cn.spec.ts                  # NEW: cn tests
│   ├── rate-limit.ts               # TO_TEST: rate limiting
│   ├── rate-limit.spec.ts          # NEW: rate-limit tests
│   ├── schemas/
│   │   ├── lead.ts                 # TO_TEST: Zod schemas
│   │   └── lead.spec.ts            # NEW: lead schema tests
│   ├── i18n/
│   │   ├── config.ts               # TO_TEST: locale config
│   │   └── config.spec.ts          # NEW: i18n config tests
│   ├── turnstile/
│   │   ├── verify.ts               # TO_TEST: Turnstile verification
│   │   └── verify.spec.ts          # NEW: turnstile tests
│   ├── api/
│   │   ├── resend.ts               # TO_TEST: Resend API
│   │   └── resend.spec.ts          # NEW: resend tests
│   └── d1/
│       ├── client.ts               # TO_TEST: D1 operations
│       └── client.spec.ts          # NEW: D1 client tests
├── actions/
│   ├── submit-lead.ts              # TO_TEST: Server Action
│   └── submit-lead.spec.ts         # NEW: submit-lead tests
└── components/
    ├── forms/
    │   └── contact-form.browser.spec.tsx    # NEW: form browser tests
    ├── i18n/
    │   └── locale-switcher.browser.spec.tsx # NEW: locale tests
    └── layout/
        └── header.browser.spec.tsx          # NEW: header tests
```

**Structure Decision**: Single Next.js application with test files co-located alongside source files (*.spec.ts pattern). Test infrastructure centralized in `src/tests/`.

## Test Coverage Strategy

### Global Thresholds (vitest.config.ts)

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| Statements | 85% | High for template reusability |
| Lines | 85% | Matches statements |
| Functions | 85% | Ensures all functions tested |
| Branches | 82% | Slightly lower (hardest to achieve) |

### Per-File Minimum (prevent single file from dragging down)

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Lines | 70% |
| Functions | 65% |
| Branches | 65% |

### Differential Coverage (new/modified code)

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| All | ≥85% | Hard gate (blocks PR) |

### Coverage by Category

| Category | Target | Files |
|----------|--------|-------|
| Pure functions (schemas, i18n, cn) | 90%+ | 3 files |
| Utility with mocks (rate-limit, turnstile, api) | 78-82% | 4 files |
| Server Actions | 80% | 1 file |
| Custom components with logic | 70% | 3 files |
| shadcn/ui wrappers | Excluded | ~25 files |
| Pages/Server Components | Excluded | ~15 files |

## Test File Inventory

| Priority | Test File | Source File | Est. Cases | Complexity |
|----------|-----------|-------------|------------|------------|
| 1 | `lib/cn.spec.ts` | `lib/cn.ts` | 3-4 | Very Low |
| 2 | `lib/schemas/lead.spec.ts` | `lib/schemas/lead.ts` | 8-10 | Low |
| 3 | `lib/i18n/config.spec.ts` | `lib/i18n/config.ts` | 6-7 | Low |
| 4 | `lib/rate-limit.spec.ts` | `lib/rate-limit.ts` | 8-10 | Medium |
| 5 | `lib/turnstile/verify.spec.ts` | `lib/turnstile/verify.ts` | 6-8 | Medium |
| 6 | `lib/api/resend.spec.ts` | `lib/api/resend.ts` | 5-6 | Medium |
| 7 | `lib/d1/client.spec.ts` | `lib/d1/client.ts` | 6-8 | Medium-High |
| 8 | `actions/submit-lead.spec.ts` | `actions/submit-lead.ts` | 10-12 | High |
| 9 | `components/forms/contact-form.browser.spec.tsx` | `components/forms/contact-form.tsx` | 8-10 | Medium |
| 10 | `components/i18n/locale-switcher.browser.spec.tsx` | `components/i18n/locale-switcher.tsx` | 4-5 | Low |
| 11 | `components/layout/header.browser.spec.tsx` | `components/layout/header.tsx` | 4-5 | Low |

**Total**: ~12 test files, ~70-90 test cases

## E2E Scenarios (Playwright)

Must-have scenarios (not percentage-based):

1. Homepage load + key sections visible
2. Language switching (LTR ↔ RTL routing)
3. Lead form happy path (Turnstile test key)
4. Form validation failure + error messages
5. External service failure handling
6. Rate limit feedback
7. Main CTA navigation (products, contact)
8. Mobile viewport smoke
9. Accessibility basics (keyboard focus, ARIA on forms)
10. SEO meta/structured data presence

## Complexity Tracking

> No violations expected. Test infrastructure follows standard patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 0: Research (research.md)
- Vitest v8 coverage provider compatibility with ESM/Next.js 15
- Cloudflare bindings mock patterns
- Server Action testing best practices
- Browser component testing with Vitest + Playwright provider

### Phase 1: Design (data-model.md, contracts/, quickstart.md)
- Test data models (Lead fixtures, form payloads)
- Mock interfaces (CloudflareEnv, Turnstile, Resend)
- Test quickstart guide for contributors

### Phase 2: Tasks (tasks.md via /speckit.tasks)
- Detailed implementation tasks with dependencies
