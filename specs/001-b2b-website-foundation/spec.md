# Feature Specification: B2B Foreign Trade Website Foundation

**Feature Branch**: `001-b2b-website-foundation`
**Created**: 2025-01-08
**Status**: Draft
**Input**: User description: "B2B 外贸企业官网模板，包含首页、产品、博客、关于、联系表单，支持多语言和全球加速"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - 访客浏览产品目录 (Priority: P1)

访客访问网站，通过导航栏下拉菜单浏览不同产品分类，查看产品详情页，了解公司产品线。

**Why this priority**: 产品展示是 B2B 网站核心功能，直接影响潜在客户对公司的第一印象和业务转化。

**Independent Test**: 可通过访问任意产品分类和详情页验证，能独立展示产品信息并提供询盘入口。

**Acceptance Scenarios**:

1. **Given** 访客在首页，**When** 鼠标悬停导航栏"Products"，**Then** 显示下拉菜单包含 5 个产品分类
2. **Given** 访客点击产品分类，**When** 页面加载完成，**Then** 显示该分类下所有产品卡片
3. **Given** 访客在产品详情页，**When** 点击"Get Quote" CTA，**Then** 弹出询盘 Modal 并预填当前产品信息
4. **Given** 阿拉伯语用户访问，**When** 查看产品页面，**Then** 布局自动切换为 RTL，文字正确显示

---

### User Story 2 - 访客提交询盘 (Priority: P1)

访客对产品感兴趣，通过联系表单提交询盘，企业收到通知邮件。

**Why this priority**: 联系表单是 B2B 网站的核心转化点，直接产生商业线索。

**Independent Test**: 可通过填写并提交表单验证，后端正确接收和处理数据。

**Acceptance Scenarios**:

1. **Given** 访客点击任意 CTA 按钮，**When** Modal 打开，**Then** 显示联系表单（姓名*、邮箱*、公司、咨询类型、留言）
2. **Given** 访客填写必填字段（姓名、邮箱），**When** 完成 Turnstile 验证，**Then** 提交按钮变为可点击状态
3. **Given** 访客提交表单，**When** 验证通过，**Then** Modal 关闭，显示 Toast 成功提示，数据写入 D1
4. **Given** 线索已提交，**When** Queue 处理完成，**Then** 企业邮箱收到通知邮件（含姓名、邮箱、公司、咨询类型、留言、产品上下文）
5. **Given** 同一邮箱短时间内重复提交，**When** 触发频率限制，**Then** 显示"请稍后再试"错误提示

---

### User Story 3 - 访客阅读博客内容 (Priority: P2)

访客通过博客页面了解行业资讯和公司动态，提升品牌认知和 SEO 排名。

**Why this priority**: 博客是内容营销和 SEO 的重要渠道，但优先级低于核心产品展示和询盘功能。

**Independent Test**: 可通过访问博客列表页和文章详情页验证，MDX 内容正确渲染。

**Acceptance Scenarios**:

1. **Given** 访客访问 /blog，**When** 页面加载完成，**Then** 显示博客文章列表（标题、摘要、日期）
2. **Given** 访客点击文章卡片，**When** 进入详情页，**Then** 显示完整文章内容（MDX 渲染）
3. **Given** MDX 文件包含多语言 frontmatter，**When** 切换语言，**Then** 文章标题和摘要显示对应语言版本

---

### User Story 4 - 访客浏览公司信息 (Priority: P2)

访客通过首页和关于页了解公司背景、优势和联系方式。

**Why this priority**: 公司信息展示建立信任基础，是询盘转化的重要支撑。

**Independent Test**: 可通过访问首页和关于页验证，内容正确展示且支持多语言。

**Acceptance Scenarios**:

1. **Given** 访客访问首页，**When** 页面加载完成，**Then** 显示 Hero 区域（简约文字风格：标题 + 副标题 + CTA）
2. **Given** 访客访问 /about，**When** 页面加载完成，**Then** 显示公司介绍、使命愿景等内容
3. **Given** 访客在任意页面，**When** 查看页脚，**Then** 显示公司联系信息、快速链接、主题切换按钮

---

### User Story 5 - 多语言切换体验 (Priority: P2)

访客可以切换网站语言（en/zh/es/ar），所有内容正确显示。

**Why this priority**: 外贸网站面向全球客户，多语言是基础功能要求。

**Independent Test**: 可通过切换语言并访问各页面验证，所有文本正确翻译。

**Acceptance Scenarios**:

1. **Given** 访客在任意页面，**When** 使用语言切换器选择中文，**Then** URL 变为 /zh/...，所有文本显示中文
2. **Given** 访客选择阿拉伯语，**When** 页面刷新完成，**Then** 整体布局切换为 RTL，文字从右向左排列
3. **Given** 访客在产品详情页切换语言，**When** 切换完成，**Then** 保持在同一产品页面，内容显示新语言版本

---

### User Story 6 - 页面加载体验优化 (Priority: P3)

访客在页面跳转时看到顶部进度条，滚动后可使用返回顶部按钮。

**Why this priority**: 体验优化功能，提升用户满意度但不影响核心功能。

**Independent Test**: 可通过页面导航和滚动操作验证，进度条和返回顶部按钮正常工作。

**Acceptance Scenarios**:

1. **Given** 访客点击导航链接，**When** 页面开始加载，**Then** 顶部显示细条进度条（主题色）
2. **Given** 访客向下滚动超过 300px，**When** 滚动停止，**Then** 右下角显示返回顶部浮动按钮
3. **Given** 访客点击返回顶部按钮，**When** 动画完成，**Then** 页面平滑滚动至顶部
4. **Given** 访客选中页面文字，**When** 选中状态激活，**Then** 选中背景色为主题 primary 色

---

### User Story 7 - 移动端导航体验 (Priority: P2)

移动端用户通过汉堡菜单访问导航，产品分类以折叠列表形式展示。

**Why this priority**: 移动端流量占比高，导航体验直接影响用户留存。

**Independent Test**: 可通过移动端视口访问并操作导航菜单验证。

**Acceptance Scenarios**:

1. **Given** 移动端用户访问网站，**When** 点击汉堡菜单图标，**Then** 从侧边滑出 Sheet 导航面板
2. **Given** 导航面板已打开，**When** 点击"Products"，**Then** 展开显示 5 个产品分类链接
3. **Given** 用户点击任意导航链接，**When** 页面开始跳转，**Then** Sheet 面板自动关闭
4. **Given** 阿拉伯语用户，**When** 打开 Sheet，**Then** 从右侧滑入（RTL 适配）

---

### Edge Cases

- **表单验证失败**: 显示具体字段错误信息，不清空已填内容
- **Turnstile 验证失败**: 显示"安全验证失败，请刷新重试"提示
- **网络中断**: 提交按钮显示加载状态，超时后提示网络错误
- **产品页预填**: 从 /contact 直接访问时不预填产品信息
- **无产品分类数据**: 导航下拉菜单显示"暂无产品"占位
- **MDX 解析错误**: 博客详情页显示友好错误提示，不崩溃
- **RTL 布局**: 浮动按钮位置自动适配（end-8 逻辑属性）
- **移动端 Hover**: 桌面端 hover 触发下拉，移动端改为点击展开
- **Queue 处理失败**: 自动重试 3 次，失败后标记 status='failed'，不丢失线索数据
- **D1 写入失败**: 返回服务器错误提示，前端保留用户已填数据
- **Thank You 页面**: 显示成功信息、预计响应时间、返回首页按钮

## Requirements _(mandatory)_

### Functional Requirements

**页面结构**

- **FR-001**: 系统 MUST 提供以下页面：首页(/)、产品列表(/products)、产品详情(/products/[slug])、博客列表(/blog)、博客详情(/blog/[slug])、关于(/about)、联系(/contact)、感谢页(/contact/thank-you)
- **FR-002**: 导航栏 MUST 显示：Home、Products（带下拉菜单）、Blog、About；Contact 仅作为 CTA 按钮
- **FR-003**: 页脚 MUST 显示：公司信息、快速链接、联系方式、主题切换按钮

**产品模块**

- **FR-004**: 产品数据 MUST 使用静态 TypeScript 配置（src/data/products.ts）+ i18n 翻译
- **FR-005**: 产品 MUST 支持 5 个分类：Electronics、Machinery、Textiles、Chemicals、Packaging
- **FR-006**: 产品详情页 MUST 显示：产品图片、名称、描述、规格、CTA 按钮
- **FR-007**: 产品图片 MUST 默认存储在 public/products/，支持远程 URL

**联系表单**

- **FR-008**: 联系表单 MUST 包含字段：姓名(必填)、邮箱(必填)、公司(选填)、咨询类型(选填)、留言(选填)
- **FR-009**: 咨询类型 MUST 提供选项：产品咨询(product)、区域代理(agency)、其他(other)
- **FR-010**: 表单提交前 MUST 通过 Cloudflare Turnstile 验证
- **FR-011**: 表单 MUST 使用 Modal/Drawer 交互，不跳转页面；/contact 页面保留完整表单作为备用入口
- **FR-012**: 从产品页打开 Modal 时 MUST 自动预填产品上下文（slug、name、category）
- **FR-013**: 提交成功后 MUST 关闭 Modal 并显示 Toast 成功提示
- **FR-027**: 表单隐藏字段 MUST 记录：locale、formPage（来源页面路径）、productSlug（如有）

**表单字段验证规则**

| 字段        | 类型     | 必填 | 验证规则                   |
| ----------- | -------- | ---- | -------------------------- |
| name        | text     | ✅   | 2-100 字符                 |
| email       | email    | ✅   | 有效邮箱格式               |
| company     | text     | ❌   | 最长 200 字符              |
| inquiryType | select   | ❌   | 枚举：product/agency/other |
| message     | textarea | ❌   | 最长 5000 字符             |

**后端处理**

- **FR-014**: 线索数据 MUST 存储到 D1 数据库 leads 表
- **FR-015**: 线索处理 MUST 通过 Cloudflare Queue 异步执行
- **FR-016**: Queue Consumer MUST 发送邮件通知到企业邮箱（Resend API）
- **FR-017**: 频率限制 MUST 基于邮箱地址（KV 存储），限制：每邮箱每小时最多 3 次
- **FR-028**: Queue 处理失败时 MUST 自动重试（最多 3 次），最终失败标记 status='failed'
- **FR-029**: D1 写入失败时 MUST 返回 server_error，前端保留用户已填数据

**博客模块**

- **FR-018**: 博客内容 MUST 使用 MDX 文件存储（content/blog/）
- **FR-019**: MDX 文件 MUST 支持多语言 frontmatter（title_en、title_zh 等）
- **FR-020**: 博客列表页 MUST 按发布日期倒序显示

**多语言支持**

- **FR-021**: 系统 MUST 支持 4 种语言：en(默认)、zh、es、ar
- **FR-022**: 阿拉伯语 MUST 启用 RTL 布局，使用 `dir="rtl"`
- **FR-023**: 所有用户可见文本 MUST 使用 i18n 翻译键，禁止硬编码
- **FR-030**: URL 路由 MUST 使用 `localePrefix: 'always'`，所有 URL 包含语言前缀
- **FR-031**: 访问根路径 `/` 时 MUST 按优先级检测语言：URL > Cookie > Accept-Language > 默认(en)
- **FR-032**: 产品/博客 Slug MUST NOT 翻译，所有语言使用相同 slug
- **FR-033**: 每个页面 MUST 生成 hreflang 标签，包含所有语言变体和 x-default
- **FR-034**: CSS 布局 MUST 使用逻辑属性（ms/me/start/end），禁止物理方向（ml/mr/left/right）

**i18n URL 路由规则**

| URL                  | 语言 | 说明                    |
| -------------------- | ---- | ----------------------- |
| `/`                  | 检测 | 重定向到检测到的语言    |
| `/en`                | en   | 英文首页                |
| `/zh`                | zh   | 中文首页                |
| `/es`                | es   | 西班牙语首页            |
| `/ar`                | ar   | 阿拉伯语首页 (RTL)      |
| `/en/products/valve` | en   | 产品详情（slug 不翻译） |
| `/zh/products/valve` | zh   | 同一产品中文版          |

**体验优化**

- **FR-024**: 页面导航时 MUST 显示顶部加载进度条（3px 高度，primary 色）
- **FR-025**: 滚动超过 300px 后 MUST 显示返回顶部浮动按钮
- **FR-026**: 文本选中 MUST 使用 primary 色作为背景色

### Key Entities

- **Product**: 产品实体，属性包括 id、slug、category、image、specs、certifications；数据来源为静态配置
- **Lead**: 线索实体，属性包括 id、name、email、company、inquiryType、message、productSlug、productName、formPage、locale、status、createdAt
- **BlogPost**: 博客文章实体，属性包括 slug、title、excerpt、content、publishedAt、locale；数据来源为 MDX 文件

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 产品页面 Lighthouse Performance 得分 ≥90
- **SC-002**: 联系表单提交成功率 ≥95%（排除恶意请求）
- **SC-003**: 页面首次内容绘制(FCP) <1.8s
- **SC-004**: 所有页面 4 种语言翻译覆盖率 100%
- **SC-005**: E2E 测试覆盖所有 User Story 主要场景
- **SC-006**: TypeScript 编译零错误，ESLint 零警告
- **SC-007**: 代码重复率 ≤1%（jscpd）
- **SC-008**: 线索从提交到邮件通知 <30 秒（Queue 处理）

---

## Technical Notes _(for implementation reference)_

### 组件结构

```
src/components/
├── common/
│   ├── progress-bar.tsx     # 页面加载进度条
│   ├── back-to-top.tsx      # 返回顶部按钮
│   └── logo.tsx             # Logo 组件
├── features/
│   ├── products/            # 产品相关组件
│   └── blog/                # 博客相关组件
├── forms/
│   ├── contact-form.tsx     # 联系表单（更新字段）
│   └── contact-modal.tsx    # Modal 封装
├── i18n/
│   └── locale-switcher.tsx  # 语言切换器
├── layout/
│   ├── header.tsx           # 导航栏（添加下拉菜单）
│   └── footer.tsx           # 页脚
├── sections/
│   └── hero.tsx             # 首页 Hero 区域
└── ui/                      # shadcn/ui 组件
```

### 数据模型变更

```sql
-- leads 表更新
ALTER TABLE leads ADD COLUMN inquiry_type TEXT;
ALTER TABLE leads ADD COLUMN product_slug TEXT;
ALTER TABLE leads ADD COLUMN product_name TEXT;
ALTER TABLE leads ADD COLUMN form_page TEXT;

-- message 字段改为可选（已在 schema 层面处理）
```

### 依赖安装

```bash
# shadcn/ui 组件
npx shadcn@latest add navigation-menu sheet button toast

# npm 包
pnpm add next-nprogress-bar
```

### Constitution Compliance Checklist

- [ ] Server Components First: 仅交互组件使用 "use client"
- [ ] i18n Completeness: 所有文本使用翻译键，4 种语言 100% 覆盖
- [ ] Type Safety: 无 any 类型，使用 Zod 校验，tsconfig strict 模式
- [ ] Edge-First: 兼容 Cloudflare Workers 运行时，无 Node.js-only API
- [ ] Quality Gates: 通过所有 CI 检查
- [ ] Complexity Limits: 文件 ≤500 行，函数 ≤120 行，复杂度 ≤15
- [ ] RTL Support: 使用逻辑属性（start/end），阿拉伯语布局测试通过

### 可选扩展（本期不实现）

以下功能已明确排除，可作为后续迭代方向：

- **Newsletter 订阅**: 页脚邮箱订阅功能
- **自动回复邮件**: 提交后发送确认邮件给客户
- **社交分享按钮**: 博客/产品页分享功能
- **面包屑导航**: 深层页面路径显示
- **博客目录 TOC**: 长文章侧边栏标题导航
- **UTM 追踪**: 营销来源参数记录
- **Airtable 同步**: CRM 数据同步（现有代码保留但非必需）
