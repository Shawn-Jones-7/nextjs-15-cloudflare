# Implementation Plan: B2B Website Foundation

**Branch**: `001-b2b-website-foundation` | **Date**: 2025-01-08 | **Spec**: `specs/001-b2b-website-foundation.md`
**Input**: Feature specification from `specs/001-b2b-website-foundation.md`

## Summary

构建 B2B 外贸企业官网模板的基础功能：页面结构（首页、产品、博客、关于、联系）、组件系统（导航下拉、Modal 表单、进度条、返回顶部）、多语言支持（4 语言 + RTL）、联系表单（Modal 交互 + D1 存储）。

**技术方案**：基于现有 Next.js 15 + Cloudflare Workers 架构，使用 next-intl 路由、shadcn/ui 组件、静态产品配置 + MDX 博客。

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Next.js 15.3
**Primary Dependencies**: next-intl ^4.5, shadcn/ui (new-york), Tailwind CSS 4, Zod
**Storage**: Cloudflare D1 (leads), KV (rate-limit), static config (products), MDX (blog)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Cloudflare Workers (Edge), 全球 CDN
**Project Type**: Web application (SSR/SSG hybrid)
**Performance Goals**: Lighthouse P≥90, A≥90, BP≥95, SEO≥95; FCP <1.8s
**Constraints**: 文件 ≤500 行, 函数 ≤120 行, 复杂度 ≤15; 无 Node.js-only API
**Scale/Scope**: 4 语言, 5 产品分类, 模板化可复用

## Constitution Check

*GATE: Must pass before implementation. Based on Constitution v1.2.0*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| Server Components First | 仅交互组件使用 "use client" | ⏳ 待实施 |
| i18n Completeness | 4 语言 100% 覆盖, 无硬编码 | ⏳ 待实施 |
| i18n Routing | localePrefix='always', hreflang, 逻辑属性 | ⏳ 待实施 |
| Type Safety | strict 模式, 无 any, Zod 校验 | ⏳ 待实施 |
| Edge-First | 兼容 Cloudflare Workers | ⏳ 待实施 |
| Quality Gates | ESLint 0 警告, TypeScript 0 错误 | ⏳ 待实施 |
| Complexity Limits | 文件/函数/复杂度符合限制 | ⏳ 待实施 |

## Project Structure

### Documentation (this feature)

```text
specs/001-b2b-website-foundation/
├── plan.md              # This file
└── ../001-b2b-website-foundation.md  # Spec document
```

### Source Code (repository root)

```text
src/
├── app/[locale]/
│   ├── layout.tsx           # 更新：hreflang 生成
│   ├── page.tsx             # 更新：Hero section
│   ├── products/
│   │   ├── page.tsx         # 新建：产品列表
│   │   └── [slug]/page.tsx  # 新建：产品详情
│   ├── blog/
│   │   ├── page.tsx         # 新建：博客列表
│   │   └── [slug]/page.tsx  # 新建：博客详情
│   ├── about/page.tsx       # 保留
│   └── contact/
│       ├── page.tsx         # 更新：表单字段
│       └── thank-you/page.tsx
├── components/
│   ├── common/              # 新建
│   │   ├── progress-bar.tsx
│   │   ├── back-to-top.tsx
│   │   └── logo.tsx
│   ├── features/            # 新建
│   │   ├── products/
│   │   │   ├── product-card.tsx
│   │   │   └── product-grid.tsx
│   │   └── blog/
│   │       ├── blog-card.tsx
│   │       └── blog-list.tsx
│   ├── forms/
│   │   ├── contact-form.tsx # 更新：新字段
│   │   └── contact-modal.tsx # 新建
│   ├── layout/
│   │   ├── header.tsx       # 更新：下拉菜单
│   │   └── footer.tsx       # 保留
│   ├── sections/            # 新建
│   │   └── hero.tsx
│   └── ui/                  # shadcn 组件
│       ├── navigation-menu.tsx # 新增
│       ├── sheet.tsx        # 新增
│       ├── button.tsx       # 新增
│       └── toast.tsx        # 新增
├── data/                    # 新建
│   └── products.ts          # 静态产品配置
├── lib/
│   ├── i18n/
│   │   ├── config.ts        # 保留
│   │   └── routing.ts       # 更新：localeDetection
│   └── schemas/
│       └── lead.ts          # 更新：新字段
├── actions/
│   └── submit-lead.ts       # 更新：新字段
└── content/                 # 新建
    └── blog/
        ├── en/
        ├── zh/
        ├── es/
        └── ar/

messages/
├── en.json                  # 更新：新翻译键
├── zh.json
├── es.json
└── ar.json
```

**Structure Decision**: 保持现有 Next.js App Router 结构，新增 `components/common/`、`components/features/`、`components/sections/`、`src/data/`、`src/content/` 目录。

## Implementation Phases

### Phase 1: 基础设施 + 导航 (P0)

**目标**: 安装依赖、配置组件系统、更新路由、实现导航

| 任务 | 文件 | 说明 |
|------|------|------|
| 1.1 安装 shadcn 组件 | - | `npx shadcn@latest add navigation-menu sheet button toast` |
| 1.2 安装 npm 依赖 | package.json | `pnpm add next-nprogress-bar` |
| 1.3 更新路由配置 | src/lib/i18n/routing.ts | 添加 localeDetection: true |
| 1.4 创建进度条组件 | src/components/common/progress-bar.tsx | 页面加载指示 |
| 1.5 创建返回顶部组件 | src/components/common/back-to-top.tsx | 浮动按钮，使用逻辑属性 end-8 |
| 1.6 更新全局样式 | src/app/globals.css | 添加 ::selection 高亮 |
| 1.7 生成 hreflang 工具函数 | src/lib/i18n/metadata.ts | buildAlternates() 生成多语言链接 |
| 1.8 更新根布局 | src/app/[locale]/layout.tsx | 集成进度条、返回顶部、hreflang/canonical |
| 1.9 创建产品数据配置 | src/data/products.ts | 静态产品分类和列表（导航共用） |
| 1.10 更新导航栏（桌面端） | src/components/layout/header.tsx | NavigationMenu + 产品下拉 |
| 1.11 更新导航栏（移动端） | src/components/layout/header.tsx | Sheet + 折叠菜单 |
| 1.12 添加导航翻译键 | messages/*.json | Navigation.categories.*, Common.backToTop 等 |

**验收**:
- 进度条在页面跳转时显示
- 返回顶部按钮在滚动后出现（RTL 自动适配）
- 文字选中显示主题色
- 桌面端 hover 显示产品下拉
- 移动端点击展开 Sheet
- 页面 HTML 包含正确的 hreflang 标签

### Phase 2: 联系表单 Modal (P1)

**目标**: 实现 Modal 形式的联系表单

| 任务 | 文件 | 说明 |
|------|------|------|
| 2.1 更新表单 Schema | src/lib/schemas/lead.ts | 添加 inquiryType, productSlug, formPage 等 |
| 2.2 更新表单组件 | src/components/forms/contact-form.tsx | 新字段、可选 message、产品预填 |
| 2.3 创建 Modal 封装 | src/components/forms/contact-modal.tsx | Sheet/Dialog 封装 + 产品上下文 Props |
| 2.4 更新 Server Action | src/actions/submit-lead.ts | 处理新字段 |
| 2.5 更新 D1 Schema | - | ALTER TABLE 添加字段（见依赖章节） |
| 2.6 添加表单翻译键 | messages/*.json | ContactPage.form.inquiryType.* 等 |
| 2.7 验证 Turnstile + 频率限制 | - | 回归测试现有安全机制 |

**验收**:
- 点击 CTA 打开 Modal
- 填写提交后 Toast 提示成功
- 数据正确入库（含新字段）
- Turnstile 验证正常工作
- 频率限制正常工作

### Phase 3: 产品模块 (P1)

**目标**: 实现产品列表和详情页

| 任务 | 文件 | 说明 |
|------|------|------|
| 3.1 创建产品卡片组件 | src/components/features/products/product-card.tsx | 产品展示卡片（Server Component） |
| 3.2 创建产品网格组件 | src/components/features/products/product-grid.tsx | 网格布局 |
| 3.3 创建产品列表页 | src/app/[locale]/products/page.tsx | SSG 产品列表 + generateMetadata |
| 3.4 创建产品详情页 | src/app/[locale]/products/[slug]/page.tsx | SSG 详情 + CTA Modal + generateMetadata |
| 3.5 添加产品翻译键 | messages/*.json | ProductsPage.*, Products.items.* |
| 3.6 添加产品图片 | public/products/ | 占位图片（5 分类各 1 张） |
| 3.7 生成产品页 hreflang | - | 复用 buildAlternates() |

**验收**:
- 产品列表按分类显示
- 详情页有完整信息（图片、名称、描述、规格）
- CTA 打开预填产品的 Modal
- 页面包含正确的 hreflang/canonical

### Phase 4: 博客模块 (P2)

**目标**: 实现 MDX 博客系统

| 任务 | 文件 | 说明 |
|------|------|------|
| 4.1 验证 MDX 方案 | - | 确认 Next 15 + Cloudflare Workers 兼容方案 |
| 4.2 配置 MDX 支持 | next.config.ts | @next/mdx 或 next-mdx-remote |
| 4.3 创建博客工具函数 | src/lib/blog.ts | 构建期读取/解析 MDX（非运行时 fs） |
| 4.4 创建博客卡片组件 | src/components/features/blog/blog-card.tsx | 文章卡片（Server Component） |
| 4.5 创建博客列表页 | src/app/[locale]/blog/page.tsx | 文章列表 + generateMetadata |
| 4.6 创建博客详情页 | src/app/[locale]/blog/[slug]/page.tsx | MDX 渲染 + generateMetadata |
| 4.7 创建示例文章 | src/content/blog/ | 每语言 1 篇示例文章 |
| 4.8 添加博客翻译键 | messages/*.json | BlogPage.* |
| 4.9 生成博客页 hreflang | - | 复用 buildAlternates() |

**验收**:
- 博客列表显示文章
- 详情页正确渲染 MDX 内容
- 多语言 frontmatter 工作
- 页面包含正确的 hreflang/canonical
- 构建成功（无运行时 fs 访问）

### Phase 5: 首页增强 (P2)

**目标**: 增强首页 Hero 和内容区域

| 任务 | 文件 | 说明 |
|------|------|------|
| 5.1 创建 Hero 组件 | src/components/sections/hero.tsx | 简约文字风格（Server Component） |
| 5.2 更新首页 | src/app/[locale]/page.tsx | 集成 Hero + CTA Modal |
| 5.3 添加首页翻译键 | messages/*.json | HomePage.hero.* |

**验收**:
- 首页显示 Hero 区域
- CTA 按钮打开联系 Modal

### Phase 6: 清理与测试 (P3)

**目标**: 删除旧页面，完成测试，确保质量门禁通过

| 任务 | 文件 | 说明 |
|------|------|------|
| 6.1 删除 News 页面 | src/app/[locale]/news/ | 删除目录 |
| 6.2 删除 Cases 页面 | src/app/[locale]/cases/ | 删除目录 |
| 6.3 清理旧翻译键 | messages/*.json | 移除 NewsPage, CasesPage |
| 6.4 清理未使用代码 | - | 运行 `pnpm lint:unused` 并修复 |
| 6.5 生成多语言 Sitemap | src/app/sitemap.ts | 包含所有页面的 4 语言变体 |
| 6.6 更新 E2E 测试 | e2e/*.spec.ts | 新页面测试 |
| 6.7 RTL 测试 | e2e/*.spec.ts | 导航、Modal、卡片、浮层的 RTL 验证 |
| 6.8 运行完整质量检查 | - | `pnpm typecheck && pnpm lint && pnpm lint:unused && pnpm lint:dup && pnpm lint:deps` |
| 6.9 修复质量问题 | - | 根据检查结果修复所有问题 |
| 6.10 验证 Constitution 合规 | - | 检查清单：无 any、逻辑属性、RSC 默认、行数限制 |

**验收**:
- 所有质量门禁通过（ESLint 0 警告、TypeScript 0 错误、Knip 0 未用、jscpd ≤1%）
- E2E 测试覆盖主要用户流程
- RTL 布局正确（导航、Modal、卡片、浮动按钮）
- Sitemap 包含所有多语言页面
- 无 Constitution 违规

## Dependencies

### npm 包

```bash
# shadcn/ui 组件
npx shadcn@latest add navigation-menu sheet button toast

# 进度条
pnpm add next-nprogress-bar
```

### D1 Schema 变更

```sql
ALTER TABLE leads ADD COLUMN inquiry_type TEXT;
ALTER TABLE leads ADD COLUMN product_slug TEXT;
ALTER TABLE leads ADD COLUMN product_name TEXT;
ALTER TABLE leads ADD COLUMN form_page TEXT;
```

## Component Architecture (Phase 3 & 5)

> Based on Constitution: Server Components First + Interactive Islands Pattern

### Product Module Components

```text
src/components/products/
├── product-grid.tsx      (Server) - Grid layout, receives filtered products
├── product-card.tsx      (Server) - Display card, links to detail page
├── product-actions.tsx   (Client) - "Get Quote" button + ContactModal trigger
└── product-specs.tsx     (Server) - Specifications table
```

**ProductActions (Client Component)**:
```tsx
interface ProductActionsProps {
  product: { slug: string; name: string };
  label: string; // i18n: "Get Quote"
}
```
- Wraps existing `ContactModal`
- Only client-side state: modal open/close
- Keeps product card as pure Server Component

**ProductCard (Server Component)**:
```tsx
interface ProductCardProps {
  product: Product;
  locale: Locale;
}
```
- Uses `Link` for navigation to detail page
- Embeds `ProductActions` for CTA
- Logical properties for RTL (`ps-4`, `text-start`)

### Hero Section Components

```text
src/components/sections/
├── hero.tsx              (Server) - Layout + text content
└── hero-cta.tsx          (Client) - CTA button + ContactModal
```

**Hero Design**:
- 2-column grid: text (start) + visual (end)
- Auto-swaps in RTL via CSS Grid
- CTA triggers ContactModal without product context

## Risk Assessment

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| next-nprogress-bar 与 Next 15/React 19 兼容性 | 中 | 测试验证，备选自建实现 |
| MDX 构建时间过长 | 低 | 限制文章数量，优化构建配置 |
| RTL 布局问题 | 中 | 严格使用逻辑属性，E2E 测试 |
| shadcn 组件与 Tailwind 4 兼容性 | 低 | 使用最新版本，必要时调整样式 |

## Complexity Tracking

> 无宪法违规需要证明

## Estimated Effort

| Phase | 任务数 | 复杂度 | 依赖 |
|-------|--------|--------|------|
| Phase 1: 基础设施 + 导航 | 12 | 中 | 无 |
| Phase 2: 联系表单 Modal | 7 | 中 | Phase 1 |
| Phase 3: 产品模块 | 7 | 中 | Phase 1, 2 |
| Phase 4: 博客模块 | 9 | 高 | Phase 1 |
| Phase 5: 首页增强 | 3 | 低 | Phase 1, 2 |
| Phase 6: 清理与测试 | 10 | 中 | 全部 |

**总计**: 48 个任务，6 个阶段

## Parallel Execution

```
Phase 1 (P0) ─────────────────────────────►
                    │
                    ├──► Phase 2 (P1) ────►
                    │         │
                    │         └──► Phase 3 (P1) ──►
                    │                    │
                    ├──► Phase 4 (P2) ────────────►
                    │                    │
                    └──► Phase 5 (P2) ────────────►
                                         │
                                         └──► Phase 6 (P3) ──► Done
```

- Phase 2, 4, 5 可在 Phase 1 完成后并行启动
- Phase 3 依赖 Phase 2 的 Modal 组件
- Phase 6 需要等待所有功能完成
