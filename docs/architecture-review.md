# Next.js 15 + Cloudflare 项目连续架构审查记录

说明：本文件用于“连续模式”架构审查。每完成一个模块深挖，会在对应章节补充现状、问题、优化方案与优先级建议，然后再进入下一模块。

审查范围与优先级：

1. 核心架构层
2. 数据层（Cloudflare D1/KV 等）
3. 国际化层（next-intl）
4. UI/组件层（Tailwind）
5. 性能层
6. 质量保障层
7. DevOps 层

---

## 核心架构层

### 现状

- 关键文件：`src/app/[locale]/layout.tsx`、`src/app/[locale]/**/page.tsx`、`src/app/robots.ts`、`src/app/sitemap.ts`、`src/middleware.ts`、`src/lib/i18n/routing.ts`、`src/actions/submit-lead.ts`、`src/lib/blog.ts`
- 当前模式：
  - App Router 位于 `src/app`，所有页面均在 `[locale]` 动态段下，`localePrefix: 'always'`
  - 页面默认 Server Components；在每个 page 中 `await params` 后调用 `setRequestLocale(locale)`
  - Client Components 边界集中在 `src/components/**`（Header/Footer/表单/交互小组件），由 `src/app/[locale]/layout.tsx` 统一引入
  - 数据获取以静态数据/Velite 内容为主：`src/data/products.ts` 静态数组，`src/lib/blog.ts` 动态 import `#velite`
  - 静态生成：`layout.tsx` 为 locale 段提供 `generateStaticParams`；动态 slug 页面也提供 `generateStaticParams`
  - 元数据：仅 `layout.tsx` 与少数 slug 页（`products/[slug]`、`blog/[slug]`）实现 `generateMetadata`
  - 中间件：`src/middleware.ts` 使用 `next-intl/middleware`，matcher 为 `/` 与 `/(en|zh|es|ar)/:path*`
  - API 层：未使用 route handlers/pages API，表单提交走 Server Actions（`submitLead`）

### 发现的问题

1. 元数据过度集中且未随路由/locale 变化，导致多数页面 SEO/社媒预览信息相同且英文硬编码 - 严重程度：中/高 - 文件：`src/app/[locale]/layout.tsx:33`、缺失 `src/app/[locale]/{about,contact,news,cases,products,blog}/page.tsx` 的 `generateMetadata`
2. `sitemap.ts` 每次生成均使用 `new Date()` 作为 `lastModified`，使 sitemap 非确定性且难以缓存 - 严重程度：中 - 文件：`src/app/sitemap.ts:34`
3. Velite 内容加载无缓存/去重，`loadPosts()` 在同一请求或构建阶段可能重复动态 import - 严重程度：中 - 文件：`src/lib/blog.ts:11`
4. `[locale]` 子树缺少 `not-found.tsx` / `error.tsx` 等错误边界，404 与异常体验偏弱 - 严重程度：低/中 - 文件：`src/app/[locale]/**`（缺失文件）
5. 全局布局引入多处 Client Components（Header/Footer/ProgressBar/BackToTop/WhatsAppButton），可能抬高首屏 JS 与水合成本 - 严重程度：中 - 文件：`src/app/[locale]/layout.tsx:9-18`、`src/components/layout/{header,footer}.tsx`

### 优化方案

**选项 B（稳健）**：

- 抽象“路由+元数据+静态参数”配置层，减少各页重复的 `setRequestLocale/generateStaticParams` 模板代码
- 将 Header/Footer 拆为 Server Shell + 小型 Client Islands（仅保留交互逻辑），降低全局水合体积
- 为内容类路由（blog/news/cases/products）引入统一的内容访问层与缓存标签（与 OpenNext tag cache 对齐）
- 工作量：约 16 小时 - 风险：中/高（涉及路由/渲染边界调整）
  **推荐**：B - 理由：作为长期演进方案，可系统性解决 SEO、缓存语义、渲染边界与共享 JS 成本问题

### 优先级：P0/P1/P2

- P0：问题 1（按路由/locale 补齐元数据）
- P1：问题 2、3（sitemap 稳定/可缓存、Velite 加载缓存）
- P2：问题 4、5（错误边界与 Client Islands 优化）

### 子域深挖（实现细节与预期变更结果）

- 路由拓扑：
  - 顶层仅有 `[locale]` 段页面与根 special routes；无 `src/app/layout.tsx`
  - 页面路由：`/[[locale]]`、`/[locale]/about`、`/[locale]/contact`、`/[locale]/contact/thank-you`、`/[locale]/products`、`/[locale]/products/[slug]`、`/[locale]/blog`、`/[locale]/blog/[slug]`、`/[locale]/news`、`/[locale]/news/[slug]`、`/[locale]/cases`、`/[locale]/cases/[slug]`
  - 动态段仅用于 `products/blog/news/cases` 的 slug；无 API/route handlers
  - 预期变更：若未来加 root layout，可在 `src/app/layout.tsx` 只做 `/` → 默认 locale redirect/metadata，避免影响现有 `[locale]` 子树
- 元数据覆盖矩阵：
  - 已有：`layout.tsx`（全局默认）、`products/page.tsx`、`products/[slug]/page.tsx`、`blog/page.tsx`、`blog/[slug]/page.tsx`
  - 缺失：`about`、`contact`、`news` 列表/详情、`cases` 列表/详情、`thank-you` 等
  - 预期变更：为缺失页补齐 `generateMetadata`，统一走 `buildPageMetadata + getTranslations` 输出 locale 化 title/description/alternates，并为详情页补 article/section tags
- 静态生成与 dynamic 风险点：
  - locale 维度：`[locale]/layout.tsx` 与各 list 页提供 `generateStaticParams`；并在每个 page 调用 `setRequestLocale(locale)`，符合 next-intl 静态渲染模式
  - slug 维度：`products/[slug]` 基于 `getAllProducts()` 静态数组；`blog/[slug]` 基于 Velite 生成的 slugs；`news/cases` 基于文件内 `validSlugs` 常量
  - 预期变更：将 `news/cases` 的 slugs 抽到 `src/data` 或内容源，避免与 `sitemap.ts`/列表页多点维护
- Server/Client 边界：
  - Server：所有 `src/app/[locale]/**/page.tsx` 与大部分业务展示组件（如 `ProductCard/Hero/BlogCard`）均为 Server Components
  - Client：`src/components/ui/**`、`layout/header.tsx`、`layout/footer.tsx`、`forms/contact-form.tsx`、`blog/mdx-content.tsx` 等
  - 根 layout 在 `<ThemeProvider>` 与 `<NextIntlClientProvider>` 处形成 client boundary，但子树仍可包含 server children
  - 预期变更：Client Islands 方向可把 Header/Footer 的静态壳拆为 server，交互部分下沉
- 路由行为一致性：
  - Header 生成的分类入口使用 `/products?category=...`，但 `products/page.tsx` 未读取 `searchParams` 做过滤
  - 预期变更：要么移除 query 入口，要么在 `ProductsPage` 增加 `searchParams` 过滤与 `generateMetadata` 反映当前分类
- 中间件与根路由：
  - `src/middleware.ts` matcher 仅匹配 `/` 与 locale 前缀路径，不会作用于 `/sitemap.xml`、`/robots.txt` 等 metadata routes
  - 预期变更：若增加更多根级非 locale 路由（如 webhook、health），需同步 matcher 例外列表

### 三轮深挖（Next.js 15 合规性与长期演进）

- Next.js 15 Request APIs 合规：
  - `src/app/[locale]/**/page.tsx` 与 `src/app/[locale]/layout.tsx` 均采用 `params: Promise<...>` 且 `await params`（示例：`src/app/[locale]/products/page.tsx:12-23`），符合 `.claude/rules/server-actions.md` 的 Next 15 规范；当前未发现同步访问 `searchParams/cookies/headers` 的用例
  - 预期变更：若未来引入 `searchParams`（如 products 分类过滤），必须改为 Promise 类型并显式 await，避免 Next 16 破坏性变更
- RSC/Client Islands 方向的可量化目标：
  - 以 `.claude/rules/components.md` “Push Client boundaries as low as possible”为准，优先将 `Header/Footer` 拆成 Server Shell + 交互子组件（菜单开关、ThemeToggle、语言切换等），并把全局 layout 中的可选交互（`WhatsAppButton/ProgressBar/BackToTop`）改为按需路由加载
  - 验收指标（长期）：共享 client chunk 体积下降（目标 < 50KB gzip），Home/内容详情页首屏水合时间下降，Lighthouse TBT/INP 无回退
- 动态数据引入时的缓存语义契约：
  - 依据 Next.js 15 官方缓存标签实践：对内容类 `fetch` 添加 `next: { tags: ['posts'|'products'|...] }`，对 D1 查询用 `unstable_cache(..., { tags, revalidate })` 封装；写操作（Server Actions）完成后调用 `revalidateTag(tag)` 精准失效
  - 预期变更：将 tags 设计与 OpenNext `NEXT_TAG_CACHE_D1` 对齐，使 edge 侧具备增量刷新能力而非全量 dynamic

### 四轮深挖（构建/内容链路与静态路由规模）

- Velite 构建链路与 dev 运行时：
  - `next.config.ts` 通过自定义 `VeliteWebpackPlugin` 在 `beforeCompile` 里触发 `velite.build({ watch, clean })`（`next.config.ts:11-37`），保证内容与 Next build 同步
  - 风险线索：`pnpm dev` 使用 `next dev --turbopack`（`package.json:10`），但存在自定义 `webpack` 配置；需在后续实施阶段确认是否导致 Turbopack 回退/功能受限（以 dev 日志/官方说明为准），避免“内容生成依赖 webpack、但开发期实际用 Turbopack”产生不一致
  - 长期验收：内容生成从“隐式 webpack 钩子”转为“显式脚本/管线步骤”（例如在 CI/本地统一跑 `pnpm velite`），并能在 Turbopack dev 下稳定热更新
- 静态路由规模与构建成本量化：
  - 本地 `pnpm build` 产物显示静态页总数 106（4 locale × 静态页 + 多 slug 详情页），且各路由均为 SSG（构建输出 `●`）（build 输出）
  - 长期风险：当 products/blog/news/cases 的 slug 规模上升时，静态页数按 locale 线性放大，构建时间与 KV incremental cache 占用同步上升
  - 长期方案验收：内容规模化后引入 ISR/PPR（按域设置 `revalidate` + tags），使构建时间与产物增长解耦
- sitemap/slug 的单一来源要求（与静态规模直接耦合）：
  - `src/app/sitemap.ts` 当前内置 `newsSlugs/casesSlugs/staticRoutes`（`src/app/sitemap.ts:8-29`），与列表页/详情页存在多点维护；且 `lastModified: new Date()` 使 sitemap 非确定性（`src/app/sitemap.ts:47-61`）
  - 长期验收：slug 与更新时间由内容源（Velite/D1）驱动，sitemap 变为可缓存、可增量更新的确定性输出

---

## 数据层（Cloudflare D1/KV）

### 现状

- 关键文件：`wrangler.toml`、`open-next.config.ts`、`migrations/001-add-lead-columns.sql`、`src/lib/d1/client.ts`、`src/lib/schemas/lead.ts`、`src/lib/rate-limit.ts`、`src/actions/submit-lead.ts`、`src/queue/consumer.ts`、`src/lib/api/{resend,airtable}.ts`
- 当前模式：
  - Cloudflare 绑定：D1 `CONTACT_FORM_D1`（业务库）、D1 `NEXT_TAG_CACHE_D1`（tag cache）、KV `NEXT_INC_CACHE_KV`（incremental cache + 业务 rate limit）、Queue `lead-notifications`（已写代码但未启用）
  - D1 访问层为轻量手写 SQL：`insertLead/getLeadById/updateLeadStatus`
  - 迁移仅包含 Phase 2 的 ALTER，缺少基础建表/索引迁移
  - KV 仅用于联系表单 rate limit；OpenNext 缓存使用 KV/D1 覆盖但应用侧未显式打 tags
  - 侧效应（邮件/同步 Airtable）当前在 Server Action 中同步执行；Queue consumer 备用

### 发现的问题

1. D1 基础 schema 未版本化：仓库中不存在 `CREATE TABLE leads` 迁移，仅有 ALTER，导致环境不可复现/易漂移 - 严重程度：高 - 文件：`migrations/001-add-lead-columns.sql`（缺失 000-init）、`src/lib/d1/client.ts:20`
2. D1 访问层缺少 schema/列常量与约束映射，SQL 直写在函数里，未来扩展容易产生重复与不一致 - 严重程度：中 - 文件：`src/lib/d1/client.ts:9-96`
3. KV rate limit 参数固定（60s/5 次）不可配置，线上调优需要改代码；KV 非原子读改写在并发下精度有限 - 严重程度：中 - 文件：`src/lib/rate-limit.ts:1-41`
4. OpenNext 的 KV incremental cache / D1 tag cache 已启用，但应用侧未使用 `revalidateTag`/fetch tags 等缓存语义；后续引入动态数据时可能全部走动态渲染 - 严重程度：低（当前静态内容为主） - 文件：`open-next.config.ts`、`src/`（缺失使用点）
5. Queue 绑定未启用时，`submitLead` 同步执行邮件与 Airtable 同步，可能放大请求耗时/失败重试复杂度 - 严重程度：中 - 文件：`wrangler.toml:38-47`、`src/actions/submit-lead.ts:58-110`、`src/queue/consumer.ts`
6. Resend/Airtable 客户端缺少超时/重试/退避策略，边缘环境下遇到 API 波动会拉高尾延迟 - 严重程度：低/中 - 文件：`src/lib/api/resend.ts:12-58`、`src/lib/api/airtable.ts:19-66`
7. Cloudflare 运行时 env 未做严格校验（仅校验 NODE_ENV/PORT），缺少 TURNSTILE/RESEND/AIRTABLE 等必需字段的早失败保护 - 严重程度：中 - 文件：`src/env.ts`

### 优化方案

**选项 B（稳健）**：

- 引入 Drizzle（或等价 ORM）定义 D1 schema + migrations，提供类型安全查询与统一仓储层
- 将所有副作用移入 Cloudflare Queue consumer（或 Durable Object），Server Action 仅写库并投递消息
- 若表单流量高，考虑用 D1/Durable Objects 实现更一致的 rate limit
- 补齐 Cloudflare env 的运行时验证（@t3-oss/env-nextjs 或 Zod）
- 工作量：约 18 小时 - 风险：中/高
  **推荐**：B - 理由：从 schema、访问层、异步副作用与限流一致性上形成可扩展的长期数据架构

### 优先级：P0/P1/P2

- P0：问题 1（补齐基础 schema/migrations）
- P1：问题 3、5、7（rate limit 配置化与副作用异步化、env 校验）
- P2：问题 2、4、6（访问层抽象、应用级缓存语义、外部 API 超时重试）

### 子域深挖（实现细节与预期变更结果）

- D1 业务库 schema 反推（当前代码约束）：
  - `leads` 表字段：`id`(TEXT PK)、`locale`(TEXT)、`name`(TEXT)、`email`(TEXT)、`phone`(TEXT NULL)、`company`(TEXT NULL)、`inquiry_type`(TEXT NULL)、`product_slug`(TEXT NULL)、`product_name`(TEXT NULL)、`form_page`(TEXT NULL)、`message`(TEXT NULL/默认空串)、`created_at`(INTEGER ms)、`status`(TEXT 默认 'pending')
  - 预期变更：在 `000-init.sql` 中补齐：
    - 约束：`CHECK(locale IN ('en','zh','es','ar'))`、`CHECK(status IN ('pending','processed','failed'))`、`CHECK(inquiry_type IN ('product','agency','other'))`
    - 索引：`CREATE INDEX leads_email_idx ON leads(email)`；`CREATE INDEX leads_created_at_idx ON leads(created_at DESC)`（便于后台检索/排序）
- migrations 管理：
  - 当前仅有 `001-add-lead-columns.sql`（ALTER），缺乏建表基线
  - 预期变更：新增 `000-init.sql` 作为首次部署基线，并在 CI/CD 增加 apply/validate 步骤；后续按递增序号管理
- D1 访问层封装：
  - `insertLead` 使用 prepared statement + `.bind` 顺序绑定，`toNullable` 统一空值 → `null`；`getLeadById` 用 `.first<T>()` 映射到 `Lead`
  - 预期变更：当字段继续扩展时，建议把列名/SQL 片段抽常量，避免多处 SQL 与 schema 漂移
- KV 使用与命名空间隔离：
  - 业务限流 key 前缀为 `rate_limit:`，与 OpenNext ISR cache 前缀天然隔离
  - 限流算法为 fixed-window 计数器：读→写非原子，并发下可能轻微超限
  - 预期变更：将窗口/阈值 env 化；高并发场景升级到 Durable Objects 或 D1 原子计数
- OpenNext cache/tag 语义：
  - `incrementalCache: kvIncrementalCache`、`tagCache: d1TagCache` 已启用，但应用侧未设置 fetch tags/`revalidateTag`
  - 预期变更：未来接入动态数据时，按“内容域”设置 tags 与 ISR/PPR 策略，利用 `NEXT_TAG_CACHE_D1` 提升边缘缓存命中
- Queue 生产/消费与幂等：
  - consumer 已实现，逐消息串行处理，失败调用 `message.retry()`，无 dead-letter 设计
  - Server Action 目前同步执行副作用；注释提示未来改为投递 Queue
  - 预期变更：启用 Queue 后：
    - `submitLead` 仅写库并 `env.LEAD_QUEUE.send({ leadId })`
    - consumer 需做幂等（先读 status=processed 则 ack）避免重复发送
    - 明确最大重试/失败告警策略
- 外部 API 在边缘的失败模式：
  - Turnstile/Resend/Airtable 都是边缘 fetch；当前无超时/退避
  - 预期变更：统一 fetch 超时、有限次重试与错误分类；对非关键副作用使用 `waitUntil`（Queue 前的折中）

### 三轮深挖（D1 基线、幂等副作用与边缘失败模型）

- D1 schema 基线应与访问层严格对齐：
  - 当前写入字段见 `insertLead`（`src/lib/d1/client.ts:7-43`），读取/映射见 `getLeadById`（`src/lib/d1/client.ts:45-82`）。基线迁移应至少包含：`id TEXT PRIMARY KEY`、`locale/name/email` NOT NULL、`created_at INTEGER NOT NULL`、`status TEXT NOT NULL` + CHECK(枚举)、以及 `inquiry_type/product_slug/product_name/form_page` 可空列
  - 建议同时在基线中加入索引：`created_at`（后台排序/消费）与 `status`（队列批处理），为后续 Queue 消费提供可扩展性
- 副作用链路的长期一致性：
  - Resend/Airtable 同步目前在 Server Action 内同步执行（`src/lib/api/resend.ts:18-73`、`src/lib/api/airtable.ts:1-76`），且无超时/退避；边缘网络抖动会直接拖慢用户提交路径
  - 长期方案：迁移到 Queue 后采用“Outbox + 幂等消费”模型：写库时记录 `status=pending` + `sent_at/synced_at` 字段；consumer 读取并 CAS 更新状态，重复消息直接 ack
- 边缘 fetch 失败模型补充：
  - 外部 API fetch 均为 POST，Cloudflare 不会默认缓存；风险主要来自无限等待与重试风暴
  - 长期方案：统一在 `src/lib/api/*` 中加超时（如 `AbortSignal.timeout`）+ 有界重试（指数退避 + 抖动）+ 错误分级（可重试/不可重试），并把最终失败写回 D1 以便运维跟踪

### 四轮深挖（类型/约束闭环、OpenNext 行为与可配置化）

- Lead 类型与数据库约束闭环：
  - `Lead` 类型定义 `status: 'pending'|'processed'|'failed'`（`src/lib/schemas/lead.ts:16-20`），而 D1 侧目前无 CHECK/默认值迁移；访问层在 insert 里硬编码 `'pending'`（`src/lib/d1/client.ts:23-32`）
  - 长期验收：基线迁移中显式 `DEFAULT 'pending'` + `CHECK(status IN (...))`，确保类型与存储一致；并为 `locale` 也加 CHECK 约束（与 `leadSchema.locale` 对齐）
- created_at 时间单位一致性：
  - D1 写入使用 `Date.now()`（毫秒）存储 `created_at`（`src/lib/d1/client.ts:18-40`）；外部邮件/同步处再 `new Date(lead.createdAt)` 处理（`src/lib/api/resend.ts:60-63`、`src/lib/api/airtable.ts:32-35`）
  - 长期验收：保持“毫秒存储 + 明确字段注释/类型”或在迁移中改为秒并同步全链路，避免未来分析/排序误读
- OpenNext 后台队列与拦截缓存配置：
  - `open-next.config.ts` 使用 `memoryQueue` 且 `enableCacheInterception: true`（`open-next.config.ts:1-12`），适合当前全静态阶段；未来启用 PPR 或依赖后台 revalidation 时需替换为 Cloudflare durable queue override，并按注释切换拦截开关
  - 长期验收：edge 后台任务在多实例/重启下不丢失；PPR 开启后缓存拦截策略与 Next 语义一致
- KV 限流可配置化与并发精度：
  - 限流窗口/阈值为常量 `RATE_LIMIT_WINDOW=60`、`RATE_LIMIT_MAX=5`（`src/lib/rate-limit.ts:1-2`），并发下为非原子 fixed-window（`src/lib/rate-limit.ts:10-41`）
  - 长期验收：将窗口/阈值 env 化并支持灰度调参；高并发时升级为 Durable Objects 或 D1 原子计数模型

---

## 国际化层（next-intl）

### 现状

- 关键文件：`next.config.ts`（`next-intl/plugin`）、`src/i18n/request.ts`、`src/lib/i18n/{config,routing,metadata}.ts`、`src/middleware.ts`、`src/app/[locale]/layout.tsx`、`src/components/i18n/locale-switcher.tsx`、`messages/{en,zh,es,ar}.json`、`src/content/{en,zh,es,ar}/blog/**`、`scripts/validate-translations.ts`
- 当前模式：
  - locale 配置集中在 `src/lib/i18n/config.ts` 与 `routing.ts`，`localePrefix: 'always'` + `localeDetection: true`
  - `src/i18n/request.ts` 按 locale 动态 import `messages/*.json`，实现按语言分包
  - 根布局 `src/app/[locale]/layout.tsx` 调用 `getMessages()` 并通过 `NextIntlClientProvider` 传递给 client 侧
  - 翻译文件采用命名空间式嵌套 JSON（`Site`/`Navigation`/`*Page`/`*Section`）
  - Velite 从 `src/content/{locale}` 生成多语言 MDX 内容，slug 不翻译
  - `LocaleSwitcher` 使用 `createNavigation` 的 `router.replace(pathname, { locale })`
  - CI/本地可用 `pnpm validate:translations` 校验跨语言 key 一致性

### 发现的问题

1. 仍存在少量用户可见/SEO 文本硬编码未纳入 messages（违反全局规则），且未随 locale 变化：如布局 metadata 与邮件模板 - 严重程度：中/高 - 文件：`src/app/[locale]/layout.tsx:42-47`、`src/lib/api/resend.ts:30-45`、`src/lib/i18n/metadata.ts:12`
2. 翻译 key 缺少 TypeScript 类型约束，使用方无法在编译期发现拼写/命名空间错误 - 严重程度：中 - 文件：`messages/*.json`（缺少类型导出与 module augmentation）
3. `NextIntlClientProvider` 默认向 client 侧下发整份 messages；布局内 client 组件较多时可能推高 payload 与水合成本 - 严重程度：中 - 文件：`src/app/[locale]/layout.tsx:59-76`、`src/i18n/request.ts:15-21`
4. localeLabels 与 RTL 规则硬编码在 config 中，存在与翻译/品牌信息重复维护的风险 - 严重程度：低 - 文件：`src/lib/i18n/config.ts:5-12`
5. `localeDetection: true` 仅对根路径 `/` 生效，边缘缓存需注意 Accept-Language/Cookie 变体导致的缓存碎片化 - 严重程度：低/中 - 文件：`src/lib/i18n/routing.ts:5-9`、`src/middleware.ts`

### 优化方案

**选项 B（稳健）**：

- 进一步按“页面/组件域”拆分 messages 与加载策略（按 namespace 动态 import），降低首屏 payload
- 为多语言内容引入统一内容访问层（可结合 D1/缓存 tags），支持增量更新与更细粒度 revalidate
- 将 localeLabels/站点品牌信息统一由 `Site` messages 驱动，减少重复配置
- 工作量：约 14 小时 - 风险：中
  **推荐**：B - 理由：面向消息规模增长与多语言内容扩展的长期可维护策略

### 优先级：P0/P1/P2

- P0：问题 1（消除硬编码/完善 locale 化 metadata）
- P1：问题 2（messages 类型安全）
- P2：问题 3-5（payload 优化与配置收敛）

### 子域深挖（实现细节与预期变更结果）

- locale 路由与检测链路：
  - `defineRouting({ localePrefix:'always', localeDetection:true })` + `next-intl/middleware` matcher 覆盖 `/` 与 locale 前缀路径
  - 访问 `/` 时 middleware 依据 URL/Cookie/Accept-Language 选择 locale 并重定向到 `/${locale}`；metadata routes（`/sitemap.xml` 等）不走 middleware
  - 预期变更：若需要更强的边缘缓存命中，可考虑 `localeDetection:false` 并只使用 URL 前缀，减少变体
- messages 组织与增长风险：
  - JSON 内嵌页面内容（news/cases items）与站点信息（Site/Navigation），按 namespace 粒度调用
  - `NextIntlClientProvider` 默认下发全量 messages 到 client（当前约 12KB/locale，仍安全）
  - 预期变更：当 items/产品/内容增长后，按 namespace 拆分 messages 或在 layout 端 pick 必需 namespaces
- metadata 与 locales 重复维护：
  - `buildAlternates`/`buildPageMetadata` 的 languages map 固定写死 `en/zh/es/ar`
  - 预期变更：改为基于 `locales` 数组动态构造 alternates，避免新增/删除 locale 时遗漏
- LocaleSwitcher 行为：
  - `router.replace(pathname, { locale })` 能正确替换 locale 前缀，但不会自动保留 query string
  - 预期变更：若产品页引入 `searchParams` 过滤，LocaleSwitcher 需携带当前查询参数（使用对象式 href）
- i18n 在 Server Actions/外部邮件：
  - `submitLead` 通过 `getLocale()` 获取 locale 并入库；邮件模板当前为英文硬编码
  - 预期变更：邮件与其它 server-side 文本（如 layout 默认 metadata）统一由 messages 驱动
- RTL 一致性：
  - 根 layout 用 `isRtl(locale)` 设置 `<html dir>`；个别组件仍用 `locale==='ar'` 分支
  - 预期变更：统一使用 `isRtl` 工具函数，避免逻辑分叉
- 多语言内容（Velite）：
  - MDX content 按 `src/content/{locale}/blog/**` 生成 Post，locale 从路径推断；slug 不翻译
  - 预期变更：若未来把内容迁入 D1/R2，需保持相同 locale 推断与 URL 结构以避免破坏 SEO

### 三轮深挖（规则对齐与跨域文本一致性）

- “无硬编码文本”规则的跨域落地：
  - `.claude/rules/_global.md` 与 `.claude/rules/i18n/messages.md` 要求所有用户可见/品牌文本由 messages 驱动；目前仍有硬编码点：邮件模板（`src/lib/api/resend.ts:30-63`）、结构化数据品牌/电话/区域（`src/components/seo/structured-data.tsx:20-140`）、以及部分默认 metadata（`src/app/[locale]/layout.tsx:39-47`）
  - 长期方案：建立 server-side `getSiteStrings(locale)`（或复用 `getTranslations('Site')`）供 metadata/邮件/JSON-LD 统一使用，避免“页面已多语言、邮件仍英文”的割裂
- Locale 变体与缓存命中：
  - 现启用 `localeDetection: true`（`src/lib/i18n/routing.ts:6-11`），在纯静态阶段影响可忽略；若未来引入动态 ISR/edge 缓存，需要评估 Cookie/Header 变体导致的 KV 命中稀释
  - 长期验收：在 staging 上对比 `localeDetection` on/off 的缓存命中率与 SEO 可用性，再决定是否关闭自动检测

### 四轮深挖（messages 传输边界与 metadata 规范化）

- messages 下发边界与 payload 增长路径：
  - `src/i18n/request.ts` 对每个请求按 locale 动态 import `messages/${locale}.json` 并返回全量 messages（`src/i18n/request.ts:7-23`），layout 侧 `getMessages()` 后整体下发到 `NextIntlClientProvider`（`src/app/[locale]/layout.tsx:52-69`）
  - 长期风险：当 messages 变大（尤其 news/cases items 继续嵌 JSON）时，所有 client 路由共享 payload 线性上升
  - 长期验收：在 layout 侧仅 pick 必需 namespaces 或将 items/长文本移入内容源（Velite/D1），确保 client 侧 messages 体积受控
- metadata/alternates 的自动化与无硬编码落地：
  - `src/lib/i18n/metadata.ts` 中 `siteName='GlobalTrade'` 与 `buildAlternates` 的 `languages` 仍硬编码 en/zh/es/ar（`src/lib/i18n/metadata.ts:8-31`）
  - 长期验收：`siteName/brand` 由 `Site` messages 驱动，`languages` 基于 `locales` 数组动态生成；新增 locale 仅需改 `config.ts` 与 messages 文件，不再改 metadata 代码

---

## UI/组件层（Tailwind）

### 现状

- 关键文件：`src/components/{ui,layout,sections,products,forms,blog,common,seo,i18n,whatsapp}/**`、`src/app/globals.css`、`components.json`
- 当前模式：
  - 组件按域分层清晰：`ui`（Radix+shadcn primitives）、`layout`（Header/Footer）、`sections`（Hero 等）、`products/forms/blog` 等业务域
  - 样式采用 Tailwind CSS 4 CSS-first：`globals.css` 中 `@theme` 定义 tokens + shadcn 变量体系
  - 复用模式：`cn` + `class-variance-authority`（Button/NavigationMenu 等），Radix `asChild`/Slot 集成 `next-intl` Link
  - Server/Client 边界：静态展示组件多为 Server Components，交互/表单/UI primitives 为 Client Components
  - 博客 MDX 由 Velite 生成 code 字符串，`MDXContent` client 侧执行渲染

### 发现的问题

1. `MDXContent` 在 client 侧通过 `new Function(code)` 运行 MDX 字符串（implied-eval），存在性能与安全可维护性隐患 - 严重程度：中/高 - 文件：`src/components/blog/mdx-content.tsx:15-21`
2. 部分 Radix UI 包装组件未显式标记 `'use client'`（当前因仅被 client 组件引用而工作，但未来误用到 Server Components 有风险） - 严重程度：中 - 文件：`src/components/ui/navigation-menu.tsx:1-5`
3. Input/Textarea 等基础表单组件未使用 `forwardRef`，对外部库/可访问性增强场景（如自动聚焦/组合表单库）支持有限 - 严重程度：低/中 - 文件：`src/components/ui/input.tsx:5-21`、`src/components/ui/textarea.tsx`
4. 大量 Tailwind 长串 class 分散在 primitives/业务组件内，缺少更高层的 variants 抽象（除 Button 外），主题迭代成本偏高 - 严重程度：低/中 - 文件：`src/components/ui/{input,textarea,select}.tsx` 等
5. 部分业务组件存在轻微重复逻辑（如 RTL 判断、env fallback）可抽取到 lib 层 - 严重程度：低 - 文件：`src/components/forms/contact-form.tsx:41-46`

### 优化方案

**选项 B（稳健）**：

- 调整 MDX pipeline：在构建期/Server Components 侧渲染 MDX（避免 client eval 与额外 JS）
- 统一表单/卡片/导航等 variants 层（CVA/设计 token），形成轻量设计系统
- 结合全局 Client Islands 优化（Header/Footer 交互下沉），进一步降低水合体积
- 工作量：约 12 小时 - 风险：中
  **推荐**：B - 理由：从内容渲染与设计系统两端提升 UI 层的长期可维护性与性能上限

### 优先级：P0/P1/P2

- P0：问题 1（MDX client eval 的风险/成本）
- P1：问题 2（Radix 组件显式 client 化）
- P2：问题 3-5（forwardRef/variants/重复逻辑收敛）

### 子域深挖（实现细节与预期变更结果）

- `ui/` primitives（shadcn + Radix）：
  - Radix 包装（`select.tsx`、`sheet.tsx`、`dropdown-menu.tsx`、`sonner.tsx` 等）均标记 `'use client'`，可安全在 client 侧使用
  - 唯一例外为 `navigation-menu.tsx`（引 Radix 但未标记），属于高概率误用点
  - 预期变更：对所有 Radix wrappers 维持显式 client 标记策略，避免团队误导
- 表单体系：
  - `ContactForm` 使用 React 19 `useActionState(submitLead)`，Turnstile token gating + aria-invalid 错误展示，模式正确
  - `ContactModal` 通过 Sheet 复用表单；用 `next/navigation` 的 `usePathname()` 记录 `formPage`（包含 locale 前缀）
  - 预期变更：抽常量替代 2s `setTimeout` magic number；如需记录“去 locale 路径”，改用 next-intl `usePathname`
- 业务域组件复用：
  - products/blog/cards 均为 Server Components，内部仅下沉少量 Client CTA（`ProductActions`、`HeroCta`）
  - `ProductActions`/`WhatsAppButton`/`ContactModal` 以 props 注入 context，序列化安全
  - 预期变更：若扩展“分类过滤/排序”能力，建议形成 `ProductsPage`→`ProductGrid`→`ProductCard` 的统一 view-model 层
- SEO/结构化数据：
  - `structured-data.tsx` 用 JSON-LD 注入 Organization/Breadcrumb/Article schema；数据完全硬编码（name/telephone/areaServed 等）
  - 预期变更：将品牌/联系方式/区域/语言迁入 `Site` messages 或 env，并随 locale 输出（尤其 Breadcrumb name）
- MDX 展示：
  - `MDXContent` client eval 由 Velite code 驱动，当前仅用于 blog 详情
  - 预期变更：优先把 MDX 渲染迁到构建期或 server 侧，避免 implied-eval；同时可减少 blog 页 client bundle
- Tailwind 样式系统：
  - `globals.css` 采用 CSS-first tokens（`@theme inline` + CSS vars），与 `components.json` 的 shadcn 变量体系一致
  - 预期变更：当组件数量上升时，把重复的 class 片段抽到 CVA variants（badge/card/input 等），降低主题改动成本

### 三轮深挖（安全边界、Client Islands 与可访问性演进）

- MDX client eval 的安全/运维影响量化：
  - `MDXContent` 的 `new Function(code)`（`src/components/blog/mdx-content.tsx:15-21`）属于 implied-eval；一旦启用严格 CSP（常见于 B2B 站点），将直接导致 blog 渲染失败
  - 长期方案验收：构建期或 Server Components 渲染 MDX 后，client 侧不再包含任何 `eval/new Function`，blog 页 client bundle 显著收敛
- Client boundary 下沉的结构化拆分：
  - 依据 `.claude/rules/components.md`，将全局交互拆成可路由级加载的 Islands：Header 只保留菜单/主题切换/LocaleSwitcher 为 client 子组件，其余导航/品牌/静态结构为 server
  - 长期验收：layout 级 client 组件数量减少到“仅 Provider + 必要 Islands”，避免全站共享的重 JS
- a11y 与 RTL 的持续约束：
  - ContactForm 已符合 label/aria-invalid 规则；其它交互（NavigationMenu/Sheet/Dropdown）需在未来扩展时持续走 `.claude/rules/components.md` 的 role/label 优先 locator 规范
  - 长期验收：Playwright 以 `getByRole/getByLabel` 为主覆盖主交互路径，RTL 下无布局/阅读方向回退

### 四轮深挖（Theme/Provider 位置与 Tailwind token 演进）

- Provider 布局对共享 JS 的影响：
  - `ThemeProvider` 与 `NextIntlClientProvider` 位于根 layout 内（`src/app/[locale]/layout.tsx:52-76`），形成全站 client boundary；当前功能合理，但会把其依赖固定进共享 chunk
  - 长期验收：在 Client Islands 下沉后，仅保留 Provider + 极少交互 Islands 在 layout，其他交互按路由/触发动态加载
- Tailwind CSS-first tokens 的长期维护策略：
  - `globals.css` 采用 `@theme inline` 将 shadcn 变量映射到 Tailwind token（`src/app/globals.css:5-40`），并用 `oklch` 定义 light/dark 基础色（`src/app/globals.css:42-120`）
  - 长期验收：当品牌/业务组件扩展时，新增 `--color-brand-*` 等语义 token 并以 CVA variants 消化重复 class；同时定期清理未使用 token（如 sidebar/chart 变量）以降低主题复杂度

---

## 性能层

### 现状

- 关键文件：`next.config.ts`、`open-next.config.ts`、`wrangler.toml`、`src/app/[locale]/layout.tsx`、`src/components/blog/mdx-content.tsx`
- 当前模式：
  - 页面以 SSG/静态数据为主，无显式 `revalidate`/PPR 配置
  - OpenNext 在 Cloudflare Workers 上运行，启用 KV incremental cache 与 D1 tag cache（`open-next.config.ts`）
  - `next/image` 设为 `unoptimized: true` 以适配 Cloudflare 部署
  - 客户端共享交互组件较多（Header/Footer/ProgressBar/BackToTop/MDXContent）
  - 未使用 `next/dynamic` 等显式代码分割

### 发现的问题

1. `next/image` 全局禁用优化，若未来接入真实大图，LCP/带宽成本会上升 - 严重程度：中 - 文件：`next.config.ts:34-36`
2. 博客 MDX client eval 与额外 JS 负担显著，影响 blog 首屏与交互性能 - 严重程度：高 - 文件：`src/components/blog/mdx-content.tsx:15-21`
3. 全局布局包含多处 Client Components，导致共享 bundle 偏大、每页水合成本增加 - 严重程度：中 - 文件：`src/app/[locale]/layout.tsx:68-76`
4. 未引入按需动态加载/代码分割策略（如 ContactModal、WhatsAppButton、Radix 菜单仅在特定场景使用） - 严重程度：低/中 - 文件：`src/components/**`
5. 应用侧尚未使用 fetch tags/`revalidateTag` 等缓存语义，OpenNext tag cache 的收益暂未体现（静态内容阶段影响低） - 严重程度：低 - 文件：`open-next.config.ts`、`src/`（缺失使用点）

### 优化方案

**选项 B（稳健）**：

- 系统性下沉 Client Islands：Server Layout + 精细化 client 边界，显著降低共享 JS
- 为未来动态数据引入 tags/ISR/PPR 策略并与 OpenNext cache 对齐
- 在 CI 中加入 bundle analyzer 与性能预算回归
- 工作量：约 16 小时 - 风险：中/高
  **推荐**：B - 理由：建立可持续的边缘渲染与分包/预算体系，支撑未来动态与内容规模化

### 优先级：P0/P1/P2

- P0：问题 2（MDX 渲染策略）
- P1：问题 1、3（图片链路与共享 bundle）
- P2：问题 4、5（按需分包与缓存语义）

### 子域深挖（实现细节与预期变更结果）

- 共享 client bundle 组成与成本来源：
  - 根 layout 静态引入 `Header/Footer/ProgressBar/BackToTop/WhatsAppButton`，即使某些 feature flag 关闭也会进入共享 chunk
  - `HeroCta` 与 `ProductActions` 引入 `ContactModal`，因此 Home/产品详情页也会打入 `ContactForm + Turnstile` 相关依赖
  - 预期变更：对 WhatsApp/ContactModal/ProgressBar 等低频交互做 `next/dynamic`，必要时在 open 时再加载 ContactForm
- 第三方脚本与边缘限制：
  - Turnstile 组件在 bundle 中提前加载；若用户无交互仍会付出依赖成本
  - Cloudflare Workers 环境下，避免引入需要 Node 原生扩展的库（目前未见）
  - 预期变更：将 Turnstile 挂载延迟到 modal open 或 contact 页面可见区域
- 图片链路：
  - 当前站点使用占位图，`unoptimized:true` 可接受；真实图片阶段需补 Cloudflare 侧优化
  - 预期变更：采用 Cloudflare Image Resizing/Images/R2 + 自定义 loader，保留 `sizes/priority` 优化 LCP
- MDX 与内容渲染：
  - blog 详情页 client eval + `react/jsx-runtime` 动态执行，属于高 CPU/高 JS 成本路径
  - 预期变更：构建期/Server Components 渲染 MDX，减少首屏 JS 与 CSP 风险
- 代码分割策略空白：
  - 当前无 `next/dynamic`/React.lazy；所有 client 依赖按路由静态聚合
  - 预期变更：建立“按路由/按交互”分包规则（表单/菜单/第三方按钮独立 chunk）
- 缓存与边缘渲染：
  - 现阶段全静态 SSG；OpenNext KV/D1 cache 用于平台级缓存但应用未显式参与
  - 预期变更：引入动态数据后配合 tags/ISR/PPR，使 edge 缓存策略可控并避免全 dynamic

### 三轮深挖（边缘缓存契约与性能预算）

- Next.js 15 缓存标签与 OpenNext tag cache 的对齐路线：
  - 未来接入 D1/R2 内容时，必须在 read path 上统一使用 tags（`fetch(... { next: { tags }})` 或 `unstable_cache(... { tags, revalidate })`），write path（Server Actions/Queue consumer）调用 `revalidateTag(tag)`，以充分利用 `NEXT_TAG_CACHE_D1`
  - 长期验收：内容更新后指定 tag 对应页面在 edge 上实现秒级可见刷新，且非相关页面不受影响
- 图片优化的 Cloudflare 适配：
  - `unoptimized: true` 是当前占位图阶段的合理折中；真实图片阶段需引入 Cloudflare Images/Resizing 或自定义 loader 恢复 `next/image` 优势
  - 长期验收：关键页面 LCP < 2.5s、图片带宽明显下降（与 Lighthouse/P budgets 对齐）
- 性能预算门禁细化：
  - 在现有 Lighthouse/CI 基础上补“共享 JS / 路由 JS”预算，防止 Client Islands 失控；并在变更 PR 上强制回归

### 四轮深挖（基线数据、middleware 成本与生产构建口径）

- 当前 build 基线（后续预算对照）：
  - `pnpm build` 输出：全站共享 First Load JS 约 102kB；Home 首次加载 178kB、Products/详情 185kB、Contact 174kB（build 输出）
  - 长期验收：Client Islands/MDX server 化后共享 JS 至少下降 30–50%，且关键路由 First Load JS 不上升
- middleware 体积与边缘冷启动：
  - middleware bundle 约 81.9kB（build 输出），主要来自 next-intl routing/middleware
  - 长期验收：middleware 不引入额外重依赖；若未来加鉴权/安全逻辑，应在不显著增加 bundle 的前提下实现（避免冷启动回退）
- 性能测量口径与生产一致性：
  - 生产部署走 OpenNext（`pnpm deploy/preview/upload`，`package.json:12-31`），而本地/CI 若仅跑 `next build` 可能低估 edge 行为差异
  - 长期验收：性能回归以 `pnpm preview`（OpenNext preview）或 staging Workers 为准，确保缓存/边缘限制纳入测量

---

## 质量保障层（TypeScript/测试/ESLint）

### 现状

- 关键文件：`tsconfig.json`、`eslint.config.js`、`vitest.config.ts`、`playwright.config.ts`、`src/tests/**`、`e2e/**`、`.github/workflows/ci.yml`
- 当前模式：
  - TypeScript 严格模式全开（`strict`、`noUncheckedIndexedAccess`、`checkJs` 等）
  - ESLint 采用 flat config + `strictTypeChecked` + security/unicorn/a11y 等，CI/本地均要求 0 warnings
  - Vitest 分 unit/browser 两项目，覆盖阈值 85%/80%/70%
  - Coverage 明确排除 `src/app` 等展示/路由文件，假设由 E2E 覆盖
  - Playwright E2E 已接入多浏览器矩阵，但当前用例很少

### 发现的问题

1. Coverage 排除范围过大（`src/app/**/*` 等）但 E2E 实际仅 1 个 smoke test，覆盖假设不成立 - 严重程度：中/高 - 文件：`vitest.config.ts:44-74`、`e2e/hello.spec.ts`
2. 关键业务流（多语言路由、产品/博客详情、联系表单提交流）缺少端到端断言 - 严重程度：中 - 文件：`e2e/**`
3. CI 默认跳过 env 校验（`SKIP_ENV_VALIDATION=true`），未来若扩展 env schema 容易掩盖配置缺失问题 - 严重程度：低/中 - 文件：`.github/workflows/ci.yml:11-13`

### 优化方案

**选项 B（稳健）**：

- 引入 Miniflare/Workers test runtime，对 Server Actions/Queue consumer 做更真实的集成测试
- 添加视觉回归（Playwright screenshot）与 a11y 自动化（axe）
- 工作量：约 14 小时 - 风险：中
  **推荐**：B - 理由：通过更真实的 Workers 运行时集成测与回归体系，长期保障边缘行为正确性

### 优先级：P0/P1/P2

- P0：问题 1（覆盖假设修正）
- P1：问题 2（补齐关键 E2E 流）
- P2：问题 3（CI env 校验策略优化）

### 子域深挖（实现细节与预期变更结果）

- TypeScript 类型治理：
  - `tsconfig.json` 极严格（含 `noUncheckedIndexedAccess`/`checkJs`/`verbatimModuleSyntax`），能有效压制隐式 any 与边界错误
  - 仍缺口：messages key 类型、运行时 env 校验、部分 slug 仍是 `string`（news/cases）而非 union
  - 预期变更：补 messages 类型增强；为内容 slugs 形成单一来源与类型导出
- ESLint/Semgrep 规则执行：
  - ESLint 采用 type-checked strict/stylistic + security/unicorn/a11y，全局 0 warnings 门槛
  - Semgrep 自定义规则较多，存在少量历史配置引用不存在的 `.augment/rules` 路径（不影响执行但增加维护负担）
  - 预期变更：定期清理失效 exclusion/注释，保持规则与当前仓库一致
- 单测/浏览器测/E2E 模型：
  - Vitest 单测覆盖 lib/actions 为主；browser 项目覆盖少量交互组件
  - 覆盖阈值基于大量 exclude 假设 E2E 覆盖 `src/app`，但 Playwright 目前仅 1 条 smoke test
  - 预期变更：建立最小可接受 E2E 组（按路由/语言/表单/内容详情分层），使覆盖模型自洽
- 质量工具链：
  - Knip/jscpd/dep-cruise/madge/markdownlint/spellcheck 已纳入 CI 与 lefthook，属于“强门禁”模板
  - 预期变更：随着代码增长，按需调整 Knip entry 与 dep-cruise rules，避免误报导致开发摩擦

### 三轮深挖（覆盖模型闭环与最小 E2E 套件）

- 覆盖模型需与 `.claude/rules/testing` 自洽：
  - Vitest 排除 `src/app` 的前提是 E2E 覆盖主路由；当前 E2E 不足导致质量门禁含义偏离
  - 长期方案：按“路由×locale×关键交互”建立最小 E2E 套件：
    1. 4 个 locale 的 home/产品列表/内容详情可访问性
    2. Contact 表单成功/失败（Turnstile mock）与 thank-you 跳转
    3. LocaleSwitcher 保持 pathname（未来含 query）
    4. RTL 视觉/阅读方向 smoke
- 测试环境一致性：
  - Vitest browser provider 全量运行意味着测试中不得依赖 Node-only API；未来新增用例时要显式使用 web 兼容替身
  - 长期验收：coverage exclude 列表与 E2E 用例规模匹配（达到 gate 时含义一致）

### 四轮深挖（运行时版本与门禁口径）

- Node 版本一致性风险：
  - 本地 `pnpm build` 提示 engines 期望 Node >=22，但当前环境为 Node 20 仍能通过（build 输出；`package.json:102-116`）
  - 长期验收：本地/CI/CD/Workers 构建环境统一到 Node 22（Volta/setup-node），避免未来依赖升级出现“本地过、CI/产线不过”
- 门禁重复与可维护性：
  - `next build` 自带 lint/typecheck 步骤（build 输出），CI 亦单独跑 lint/tsc；虽能提高安全性，但会增加流水线耗时
  - 长期验收：在 CD 中保留一次权威门禁（建议以 CI 结果为准），部署阶段仅做必要的构建与健康检查

---

## DevOps 层（CI/CD/部署）

### 现状

- 关键文件：`.github/workflows/{ci,lighthouse,release}.yml`、`wrangler.toml`、`open-next.config.ts`、`package.json` scripts、`lefthook.yml`、`scripts/setup-secrets.sh`
- 当前模式：
  - CI 覆盖 14+ 质量门禁（lint/typecheck/knip/jscpd/dep-cruise/madge/semgrep/coverage/e2e/lighthouse）
  - Release 通过 Changesets 自动打 tag 并发布
  - 部署基于 OpenNext Cloudflare：`pnpm deploy/preview/upload`
  - Wrangler 配置启用 Smart placement、observability、KV/D1 绑定；Queue 绑定预留但注释
  - Lefthook 在本地提交前执行格式化、lint 修复、拼写与 commitlint

### 发现的问题

1. 缺少 D1 migrations 的自动化应用/校验链路，配合当前 schema 未版本化，会导致部署环境漂移 - 严重程度：高 - 文件：`package.json`（无 migrations 脚本）、`.github/workflows/**`（无 apply step）、`wrangler.toml`、`migrations/**`
2. CI/Lighthouse 运行在 Node `next start` 环境，与 Cloudflare Workers 实际边缘行为存在差异（缓存/限制等） - 严重程度：低/中 - 文件：`config/lighthouserc.js:25-33`、`.github/workflows/lighthouse.yml`
3. 生产 Queue 尚未启用时缺少发布开关流程/回滚策略（已写 consumer 但无 CD 钩子） - 严重程度：中 - 文件：`wrangler.toml:38-47`、`src/queue/consumer.ts`
4. CI 默认跳过 env 校验，未来加严 env schema 后需同步调整 - 严重程度：低 - 文件：`.github/workflows/ci.yml:11-13`

### 优化方案

**选项 B（稳健）**：

- 建立 staging/prod 双环境 Workers CD（含 secrets 管理、自动迁移、health check、回滚）
- 将 Queue 作为可配置能力纳入发布流水线（feature flag + 环境切换）
- 工作量：约 16 小时 - 风险：中/高
  **推荐**：B - 理由：形成可回滚、可分环境验证的长期交付体系，并为异步队列能力铺路

### 优先级：P0/P1/P2

- P0：问题 1（迁移闭环）
- P1：问题 3（Queue 发布流程）
- P2：问题 2、4（edge 差异审计与 env 校验策略）

### 子域深挖（实现细节与预期变更结果）

- 部署链路与产物：
  - `wrangler.toml` 指向 `.open-next/worker.js` 与 `.open-next/assets`，说明生产部署应走 `opennextjs-cloudflare build`
  - `package.json` 的 `deploy/preview/upload` 均基于 OpenNext；`build` 仅 `next build`
  - 预期变更：在 CD 中统一用 OpenNext build 作为唯一生产构建入口，避免 node/edge 产物差异
- 环境与配置分层：
  - `wrangler.toml` 未定义 `[env.staging]`/`[env.production]` 分区，属于单环境配置
  - 预期变更：增加 staging env（独立 D1/KV/Queue/域名），用于迁移与 Queue 启用验证
- 迁移闭环（高风险）：
  - 现无 migrations apply 脚本/CI step
  - 预期变更：新增 `pnpm d1:migrate`/`d1:apply`，并在 deploy 前自动执行 `wrangler d1 migrations apply CONTACT_FORM_D1`
- Secrets 管理：
  - 本地 `.dev.vars` 文件存在且未被 `.gitignore` 忽略，若已提交会造成 secrets 泄露风险
  - `scripts/setup-secrets.sh` 为占位脚本，若未替换值直接运行会写入无效 secret
  - 预期变更：立即将 `.dev.vars` 加入 `.gitignore` 并检查仓库历史是否泄露；对生产 secrets 建议通过 `wrangler secret put` 手工或 CI 注入
- CI 与 edge 差异：
  - CI/Lighthouse 使用 node `pnpm build/start`，与 Workers edge（KV/D1/cache interception）存在行为差异
  - 预期变更：关键回归可用 `pnpm preview`（OpenNext preview）在 CI nightly/staging 上跑一次
- 发布与回滚：
  - Release 由 Changesets 自动化，未含部署步骤；Queue/迁移启用需手工切换
  - 预期变更：将 Queue 启用做成显式发布开关（feature flag + env binding），并提供回滚指引（禁用 binding/降级到同步路径）

### 三轮深挖（交付安全与运行态观测）

- Secrets 防泄露的长期机制：
  - `.dev.vars` 当前未被忽略（见本模块问题 4），长期应引入 CI 级别的 secret-scan（如 GitHub secret scanning/semgrep rules）+ pre-commit 阻断，避免再次出现历史泄露
  - 验收：任意包含 `.env*`/`.dev.vars` 的提交在本地与 CI 均被拒绝，历史泄露完成轮换
- 分环境 CD 与可观测性：
  - staging/prod 双环境不仅用于 migrations/Queue 预演，还应承载 Workers Observability（日志、Trace、error rate）与性能基线对比
  - 长期验收：每次发布在 staging 通过 health check + 核心 E2E 后才 promote；production 具备一键回滚（重新指向上一版本 worker）

### 四轮深挖（构建环境一致性与 secrets 装配）

- 构建入口与环境口径：
  - `build` 脚本仅 `next build`，而生产/预览都通过 `opennextjs-cloudflare build`（`package.json:8-31`）；两者产物与 edge 行为可能存在偏差
  - 长期验收：CI/CD 将 OpenNext build 作为生产唯一入口；`next build` 仅用于本地快速验证或作为 CI 的预检查
- secrets 文件在构建期被加载的证据：
  - `next.config.ts` 顶部 import `./src/env` 会在构建期加载 dotenv/vars；本次 build 日志显示 “Using vars defined in .dev.vars”（build 输出）
  - 长期验收：CD 环境不依赖 `.dev.vars` 文件（只通过 Workers secrets/env 注入），并在流水线中显式禁用/忽略本地 vars 文件

## 三轮总览（长期演进路线图）

- Phase 0（立刻规整，P0）：补齐 D1 基线迁移 + 部署 apply 闭环；移除/替换 MDX client eval；补齐按路由/locale 的 metadata 与硬编码清零策略；处理 `.dev.vars` 泄露风险；统一构建 Node 版本到 22
- Phase 1（1–2 周，P1）：Client Islands 下沉与共享 bundle 预算；建立最小 E2E 套件；messages/alternates 动态化；Queue 分环境启用预案；校验 Turbopack dev 与 Velite 内容生成一致性并落地 sitemap/slug 单一来源
- Phase 2（持续演进，P2）：为动态内容引入 tags/ISR/PPR 体系并与 OpenNext cache 对齐；设计系统 variants 扩展；完善 observability/rollback/自动化发布
