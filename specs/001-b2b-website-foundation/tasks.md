# Tasks: B2B Website Foundation

**Input**: Design documents from `/specs/001-b2b-website-foundation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)
**Branch**: `001-b2b-website-foundation`

**Tests**: E2E tests included in Phase 9 (Polish) per spec requirements.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) ✓

**Purpose**: Project initialization, dependencies, and foundational components

- [x] T001 Install shadcn components: navigation-menu, sheet, button, sonner, dropdown-menu
- [x] T002 Install npm dependency: next-nprogress-bar in package.json
- [x] T003 [P] Update routing config with localeDetection in src/lib/i18n/routing.ts
- [x] T004 [P] Create progress bar component in src/components/common/progress-bar.tsx
- [x] T005 [P] Create back-to-top component with logical properties in src/components/common/back-to-top.tsx
- [x] T006 [P] Add ::selection highlighting in src/app/globals.css
- [x] T007 [P] Create hreflang utility buildAlternates() in src/lib/i18n/metadata.ts
- [x] T008 Update root layout with progress bar, back-to-top, hreflang in src/app/[locale]/layout.tsx
- [x] T009 [P] Create product data configuration in src/data/products.ts
- [x] T010 [P] Add navigation translations in messages/*.json (4 languages)

**Checkpoint**: ✓ Foundation infrastructure complete

---

## Phase 2: Foundational (Blocking Prerequisites) ✓

**Purpose**: Core components that MUST be complete before user stories

**⚠️ CRITICAL**: User stories depend on these components

- [x] T011 Update lead schema with inquiryType, productSlug, formPage in src/lib/schemas/lead.ts
- [x] T012 [P] Update contact form with new fields in src/components/forms/contact-form.tsx
- [x] T013 [P] Create contact modal wrapper in src/components/forms/contact-modal.tsx
- [x] T014 Update submit-lead action with new fields in src/actions/submit-lead.ts
- [x] T015 [P] Create D1 migration for leads table in migrations/001-add-lead-columns.sql
- [x] T016 [P] Add form translations (inquiryType, modal) in messages/*.json
- [x] T017 [P] Update header with desktop NavigationMenu in src/components/layout/header.tsx
- [x] T018 [P] Update header with mobile Sheet navigation in src/components/layout/header.tsx

**Checkpoint**: ✓ Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - 访客浏览产品目录 (Priority: P1) 🎯 MVP ✓

**Goal**: 访客通过导航栏下拉菜单浏览产品分类，查看产品详情页

**Independent Test**: 访问 /products 和 /products/[slug]，验证产品展示和 CTA Modal

### Implementation for User Story 1

- [x] T019 [P] [US1] Create product-actions client component in src/components/products/product-actions.tsx
- [x] T020 [P] [US1] Create product-card server component in src/components/products/product-card.tsx
- [x] T021 [P] [US1] Create product-grid server component in src/components/products/product-grid.tsx
- [x] T022 [US1] Create products listing page with generateMetadata in src/app/[locale]/products/page.tsx
- [x] T023 [US1] Create product detail page with CTA Modal in src/app/[locale]/products/[slug]/page.tsx
- [x] T024 [P] [US1] Add product translations (ProductsPage.*, Products.items.*) in messages/*.json
- [x] T025 [P] [US1] Add placeholder product images (5 categories) in public/products/

**Checkpoint**: ✓ Product browsing fully functional with inquiry modal

---

## Phase 4: User Story 2 - 访客提交询盘 (Priority: P1)

**Goal**: 访客通过 Modal 表单提交询盘，企业收到邮件通知

**Independent Test**: 填写并提交表单，验证 D1 存储和邮件发送

### Implementation for User Story 2

- [ ] T026 [US2] Verify Turnstile integration works in deployed environment
- [ ] T027 [US2] Verify rate limiting works with KV storage
- [ ] T028 [US2] Test form submission with product context pre-fill
- [ ] T029 [US2] Verify email notification via Resend API (requires deployment)

**Checkpoint**: Lead capture system fully operational

---

## Phase 5: User Story 3 - 访客阅读博客内容 (Priority: P2)

**Goal**: 访客通过博客页面阅读 MDX 内容

**Independent Test**: 访问 /blog 和 /blog/[slug]，验证 MDX 渲染

### Implementation for User Story 3

- [ ] T030 [US3] Research MDX solution for Next 15 + Cloudflare Workers compatibility
- [ ] T031 [US3] Configure MDX support (@next/mdx or next-mdx-remote) in next.config.ts
- [ ] T032 [P] [US3] Create blog utilities for build-time MDX parsing in src/lib/blog.ts
- [ ] T033 [P] [US3] Create blog-card server component in src/components/features/blog/blog-card.tsx
- [ ] T034 [US3] Create blog listing page with generateMetadata in src/app/[locale]/blog/page.tsx
- [ ] T035 [US3] Create blog detail page with MDX rendering in src/app/[locale]/blog/[slug]/page.tsx
- [ ] T036 [P] [US3] Create sample MDX articles (1 per language) in src/content/blog/
- [ ] T037 [P] [US3] Add blog translations (BlogPage.*) in messages/*.json

**Checkpoint**: Blog system fully functional with multi-language support

---

## Phase 6: User Story 4 - 访客浏览公司信息 (Priority: P2) ✓

**Goal**: 首页 Hero 和关于页展示公司信息

**Independent Test**: 访问首页和 /about，验证内容展示

### Implementation for User Story 4

- [x] T038 [P] [US4] Create hero-cta client component in src/components/sections/hero-cta.tsx
- [x] T039 [P] [US4] Create hero server component (2-column grid) in src/components/sections/hero.tsx
- [x] T040 [US4] Update homepage with Hero + CTA Modal in src/app/[locale]/page.tsx
- [x] T041 [P] [US4] Add homepage translations (HomePage.hero.*) in messages/*.json

**Checkpoint**: ✓ Homepage and company info pages complete

---

## Phase 7: User Story 5 - 多语言切换体验 (Priority: P2)

**Goal**: 4 语言切换正常工作，RTL 布局正确

**Independent Test**: 切换语言并验证 URL、内容、布局变化

### Implementation for User Story 5

- [ ] T042 [US5] Verify locale switcher preserves current page path
- [ ] T043 [US5] Verify RTL layout for Arabic (dir="rtl", logical properties)
- [ ] T044 [US5] Verify all pages have correct hreflang tags
- [ ] T045 [P] [US5] Review and complete missing translations in messages/*.json

**Checkpoint**: Full i18n support verified

---

## Phase 8: User Story 6 + 7 - 体验优化 + 移动端导航 (Priority: P2-P3) ✓

**Goal**: 进度条、返回顶部、移动端 Sheet 导航

**Independent Test**: 页面跳转验证进度条，滚动验证返回顶部，移动端验证 Sheet

### Implementation (Already Completed in Phase 1)

- [x] T046 [US6] Progress bar displays during page navigation
- [x] T047 [US6] Back-to-top button appears after 300px scroll (RTL-compatible)
- [x] T048 [US6] Text selection uses primary theme color
- [x] T049 [US7] Mobile hamburger menu opens Sheet navigation
- [x] T050 [US7] Sheet slides from correct side in RTL mode

**Checkpoint**: ✓ UX enhancements complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, quality gates, and E2E tests

### Cleanup

- [ ] T051 [P] Delete News pages directory: src/app/[locale]/news/
- [ ] T052 [P] Delete Cases pages directory: src/app/[locale]/cases/
- [ ] T053 Clean unused translation keys (NewsPage, CasesPage) in messages/*.json
- [ ] T054 Run pnpm lint:unused and fix issues
- [ ] T055 Update sitemap with all localized routes in src/app/sitemap.ts

### E2E Tests

- [ ] T056 [P] Create E2E test for product browsing flow in e2e/products.spec.ts
- [ ] T057 [P] Create E2E test for contact form submission in e2e/contact.spec.ts
- [ ] T058 [P] Create E2E test for locale switching in e2e/i18n.spec.ts
- [ ] T059 [P] Create E2E test for RTL layout verification in e2e/rtl.spec.ts

### Quality Gates

- [ ] T060 Run typecheck: pnpm typecheck (0 errors)
- [ ] T061 Run lint: pnpm lint (0 warnings)
- [ ] T062 Run unused check: pnpm lint:unused (0 unused)
- [ ] T063 Run duplication check: pnpm lint:dup (≤1%)
- [ ] T064 Fix any quality issues found

### Constitution Compliance

- [ ] T065 Verify no `any` types in production code
- [ ] T066 Verify CSS uses logical properties (ms/me/start/end)
- [ ] T067 Verify Server Components by default
- [ ] T068 Verify file/function complexity limits

**Checkpoint**: All quality gates passed, ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Foundational) ──┬──► Phase 3 (US1: Products) 🎯 MVP
                                             │
                                             ├──► Phase 4 (US2: Inquiry) ──► [Depends on deployment]
                                             │
                                             ├──► Phase 5 (US3: Blog)
                                             │
                                             ├──► Phase 6 (US4: Homepage)
                                             │
                                             └──► Phase 7 (US5: i18n)
                                                          │
                                                          └──► Phase 9 (Polish)
```

### User Story Dependencies

| Story | Can Start After | Dependencies on Other Stories |
|-------|----------------|-------------------------------|
| US1 (Products) | Phase 2 | None - fully independent |
| US2 (Inquiry) | Phase 2 | Uses ContactModal (Phase 2) |
| US3 (Blog) | Phase 2 | None - fully independent |
| US4 (Homepage) | Phase 2 | Uses ContactModal (Phase 2) |
| US5 (i18n) | Phase 2 | Verify all pages from other stories |
| US6/7 | Phase 1 | ✓ Already complete |

### Parallel Opportunities

```bash
# After Phase 2 completes, launch in parallel:
Phase 3 (US1) ─────────────────────►
Phase 5 (US3) ─────────────────────►
Phase 6 (US4) ─────────────────────►

# These can run simultaneously on different files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Phase 1: Setup (COMPLETE)
2. ✅ Phase 2: Foundational (COMPLETE)
3. ⏳ Phase 3: User Story 1 - Products
4. **STOP and VALIDATE**: Test product browsing independently
5. Deploy if ready

### Incremental Delivery

1. ✅ Setup + Foundational → Foundation ready
2. Add US1 (Products) → Test → Deploy (MVP!)
3. Add US4 (Homepage) → Test → Deploy
4. Add US3 (Blog) → Test → Deploy
5. Add Phase 9 (Polish) → Final quality gates

---

## Progress Summary

| Phase | Total | Pending | Complete | % |
|-------|-------|---------|----------|---|
| Phase 1: Setup | 10 | 0 | 10 | 100% |
| Phase 2: Foundational | 8 | 0 | 8 | 100% |
| Phase 3: US1 Products | 7 | 7 | 0 | 0% |
| Phase 4: US2 Inquiry | 4 | 4 | 0 | 0% |
| Phase 5: US3 Blog | 8 | 8 | 0 | 0% |
| Phase 6: US4 Homepage | 4 | 4 | 0 | 0% |
| Phase 7: US5 i18n | 4 | 4 | 0 | 0% |
| Phase 8: US6+7 UX | 5 | 0 | 5 | 100% |
| Phase 9: Polish | 18 | 18 | 0 | 0% |
| **Total** | **68** | **45** | **23** | **34%** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
