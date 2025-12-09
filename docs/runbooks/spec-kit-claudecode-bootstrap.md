# 📒 Spec-Kit × Claude Code × OpenNext（Cloudflare Workers）

## —— 项目基础搭建系列任务脚本（可复制到仓库后直接让 Claude Code 执行）

> 目标：在 **Claude Code** 中，使用 **Spec-Kit** 的规范驱动流程，完成 **Next.js 15 + OpenNext × Cloudflare Workers** 的基座搭建，并整合 **tucsenberg-web-frontier** 的严格质量套件（Knip / jscpd / dependency-cruiser / Semgrep / Lighthouse 等）。
> 关键事实与做法均附来源，便于审计与复现。

---

## 0) 背景与依据（为什么这样做）

- **Cloudflare 官方路线**：在 Cloudflare 上运行 Next.js，**推荐使用 OpenNext 的 Cloudflare 适配器**（而非 next-on-pages）。官方博文已明确“使用 Cloudflare adapter 现为首选”。([The Cloudflare Blog][1])
- **Workers 的 Node 能力**：在 Workers 里启用 **`nodejs_compat`** 并将 **`compatibility_date` ≥ 2024-09-23** 才能使用内建 Node API；这是 Next.js＋OpenNext 在 Workers 上运行的基础前提。([Cloudflare Docs][2])
- **Cloudflare 官方 Next.js 指南**：Workers 指南示例也直接要求 `nodejs_compat`，并给出较新的 `compatibility_date` 示例（例如 `2025-03-25`）。([Cloudflare Docs][3])
- **OpenNext 官方入门**：OpenNext 的 Cloudflare 文档强调本地/预览/部署流程，并要求 **Wrangler ≥ 3.99.0**。([opennext.js.org][4])
- **Spec-Kit 的作用**：Spec-Kit 提供一组 **/speckit.\*** 工作流命令（constitution → specify → plan → tasks → implement），把“规范 → 架构 → 任务 → 实现”连成闭环，适配 Claude Code 等代理。([GitHub][5])
- **Unverceled Next.js 模板**：一个 Next 15 起步模版，默认部署到 Cloudflare，适合做我们的底座。([GitHub][6])
- **严格质量套件来源**：`tucsenberg-web-frontier` 仓库根目录含 `.dependency-cruiser.js`、`.jscpd.json`、`.knip.json(c)`、`semgrep.yml`、`lighthouserc.js`、`.browserslistrc` 等，可直接迁入。([GitHub][7])

---

## 1) 前置检查（一次性）

- Node ≥ 22、pnpm ≥ 9（自备）。
- **Wrangler ≥ 3.99.0**（OpenNext 要求）：`wrangler -v`。([opennext.js.org][4])
- Cloudflare 账号可登录：`wrangler login`。
- 可选：使用 **C3** 快速脚手架（`npm create cloudflare@latest -- my-next-app --framework=next`；框架=next 时会配置为 Cloudflare 环境）。([Cloudflare Docs][3])

---

## 2) 在 Claude Code 中粘贴的启动提示（Kickoff Prompt）

把本文保存为 `docs/runbooks/spec-kit-claudecode-bootstrap.md`，然后对 Claude Code 说：

```
你是本仓库的“规范驱动开发（SDD）”执行代理。请读取 docs/runbooks/spec-kit-claudecode-bootstrap.md ，
严格按其中“任务步骤”逐条执行；遇到分支选择按文档“方案 A（已有 Unverceled）/方案 B（从模板开始）”处理。
每个阶段都需产出：变更文件、提交信息（Conventional Commits）、校验结果与问题清单。
若命令失败，请在同阶段给出修复建议并重试至通过。
```

> 说明：Spec-Kit 的 **/speckit.\*** 命令即面向 AI 代理（Copilot、Claude Code 等）的工作流接口，用以生成“宪章/规格/计划/任务/实现”。([GitHub][5])

---

## 3) 用 Spec-Kit 产出“项目宪章”（不写代码，先定规则）

在 Claude Code 发送：

```
/speckit.constitution
请为本项目生成“项目宪章”（docs/spec/constitution.md），包含：
- 运行时：Next.js 15 + @opennextjs/cloudflare（Workers Node 兼容层）；
  wrangler 配置启用 nodejs_compat，compatibility_date ≥ 2024-09-23（可用官方示例 2025-03-25）。
- 质量门槛（CI Gate）：Lighthouse P≥90 A≥90 BP≥95 SEO≥95；Semgrep 高/中危=0；
  Knip 未使用=0；dependency-cruiser 禁止跨层；jscpd ≤ 1%。
- 规范：单一 ESLint Flat Config；TS 严格项（noUncheckedIndexedAccess 等）；Prettier 单一来源。
- 流程：feature 分支→PR→质量 Gate 通过才可合并；Conventional Commits。
```

> 依据：Cloudflare 推荐 OpenNext 适配器；Node 兼容与日期要求见 Workers/Next.js 指南；Spec-Kit 命令与流程见官方文档/站点。([The Cloudflare Blog][1])

---

## 4) 写“功能规格”（What/Why），面向外贸 B2B 官网

```
/speckit.specify
为“B2B 企业官网基础”生成规格（specs/001-b2b-website/）：
- 内容模型：主页/关于/新闻/案例/联系；
- 多语言：en/zh/es/ar（含 hreflang 与多语言 sitemap）；
- 表单：Cloudflare Turnstile + Server Actions，持久化（后续接 CRM）；
- SEO：sitemap、OG、结构化数据；性能目标按宪章；
- 可访问性：WCAG AA；全球加速依托 Cloudflare 边缘。
```

> Spec-Kit 建议把 **What/Why** 与 **How** 分离：先 `/speckit.specify` 再 `/speckit.plan`。([DeepWiki][8])

---

## 5) 生成“技术方案与架构计划”（How）

```
/speckit.plan
输出技术计划（specs/001-b2b-website/plan.md）：
- 底座：Unverceled Next.js（Next 15）+ OpenNext × Workers；
- i18n：next-intl；多语言 sitemap/hreflang；
- 表单：Server Actions + Turnstile；速率限制（KV/DO）；
- ISR：按标签重验证；.open-next 目录不纳入版本；
- 质量：Knip/jscpd/dep-cruise/Semgrep/Lighthouse；统一 ESLint/TS/Prettier；
- CI：quality.yml（质量） + lighthouse（性能/SEO）。
```

> 依据：OpenNext Cloudflare 文档（本地/构建/预览产生 `.open-next` 并通过 Workers 预览/部署）。([opennext.js.org][9])

---

## 6) 任务拆分（让代理可并行执行）

```
/speckit.tasks
将“环境/脚手架/质量/业务能力/部署/审计”分解为工作包：
为每个任务写明：目标、输入、输出、验收标准、回滚方案，
并建立 任务 ↔ 宪章/规格/计划 的溯源映射。
```

> Spec-Kit 的核心工作流命令：constitution → specify → plan → **tasks** → implement。([DeepWiki][8])

---

## 7) 选择路径并“实现”基础骨架

### 方案 A（已有底座）：你已用 **Unverceled** 起库

让 Claude Code 在现有仓库执行实现：

```
/speckit.implement
1) wrangler.toml：启用 nodejs_compat；compatibility_date 取一个较新日期（官方示例 2025-03-25）
2) .gitignore：加入 .open-next
3) 新增 .github/workflows/quality.yml 与 lighthouse job
4) 安装并配置 Knip/jscpd/dependency-cruiser/Semgrep/Lighthouse；更新 package.json 脚本
5) 统一 ESLint（Flat Config 单入口）/Prettier/TS（加严选项）
6) 生成 i18n（next-intl）与 contact 表单最小骨架（含 Turnstile 校验占位）
```

> Unverceled 模板特性与脚本见其 README。([GitHub][10])

### 方案 B（从模板开始）：让代理拉取底座再执行 A

```
/speckit.implement
使用 ixahmedxi/unverceled-nextjs 作为模板初始化项目（保留其 eslint/prettier/lefthook/vitest/playwright/open-next/worker 配置），
然后按“方案 A”的 1)～6) 落地。
```

> 模板仓库入口与简介。([GitHub][6])

---

## 8) 注入严格质量套件（来自 tucsenberg-web-frontier）

```
/speckit.implement
将以下文件从 https://github.com/Shawn-Jones-7/tucsenberg-web-frontier 同步到仓库根：
.dependency-cruiser.js  .jscpd.json  .knip.json(或 knip.jsonc)  semgrep.yml  lighthouserc.js  .browserslistrc
安装 dev 依赖：semgrep jscpd knip dependency-cruiser lighthouse lighthouse-ci
在 package.json 增加：typecheck、lint:unused、lint:dup、lint:deps、lint:security、audit:seo 等脚本
统一 ESLint（单入口）、Prettier、TS（严格项）
新增 .github/workflows/quality.yml（“quality”+“lighthouse”两个作业）
```

> 以上文件名与位置可在仓库根目录核验（文件清单可见）。([GitHub][7])

---

## 9) Cloudflare Workers 必要设置与部署

```
/speckit.implement
wrangler.toml:
  compatibility_flags = ["nodejs_compat"]
  compatibility_date = "<选择≥2024-09-23的近期日期，如 2025-03-25>"
执行：pnpm build && pnpm preview      # 本地在 Workers 运行时预览（OpenNext 生成 .open-next）
登录与部署：wrangler login && pnpm deploy
```

> Node 兼容与日期要求：Workers/Next.js 指南；OpenNext Dev-Deploy 文档讲解 `.open-next` 产物。([Cloudflare Docs][2])

---

## 10) 一次性校验命令（本地 + CI）

```bash
pnpm typecheck
pnpm lint
pnpm lint:unused
pnpm lint:dup
pnpm lint:deps
pnpm lint:security
pnpm build && pnpm preview
pnpm audit:seo
```

> 这些门槛应在“宪章/计划/CI”中固化为 **PR 合并 Gate**。Spec-Kit 的流程就是把这些规范落为实际工作流。([Cloudflare Docs][2])

---

## 11) ✅ 集成检查清单（粘到 PR 描述即可勾选）

**环境/运行时**

- [ ] Wrangler ≥ **3.99.0**；`wrangler login` 成功。([opennext.js.org][4])
- [ ] `wrangler.toml` 启用 **`nodejs_compat`**；`compatibility_date` 为近期且 **≥ 2024-09-23**（官方示例含 `2025-03-25`）。([Cloudflare Docs][2])

**规范与计划**

- [ ] `docs/spec/constitution.md` 提交并评审通过。([GitHub][5])
- [ ] `specs/001-b2b-website/` 内含规格/计划/任务。([DeepWiki][8])

**质量套件**

- [ ] 根目录存在：`.dependency-cruiser.js`、`.jscpd.json`、`.knip.json(c)`、`semgrep.yml`、`lighthouserc.js`、`.browserslistrc`。([GitHub][7])
- [ ] `package.json` 含并可执行：`lint:unused`、`lint:dup`、`lint:deps`、`lint:security`、`audit:seo`。
- [ ] `/.github/workflows/quality.yml` 与 `lighthouse` 作业生效（Lighthouse CI 亦可）。([Cloudflare Docs][3])

**统一配置**

- [ ] **单一** ESLint 入口（Flat Config）；Prettier 单一来源；TS 已加严项。
- [ ] dep-cruise 违规 **0**；Knip 未使用 **0**；jscpd ≤ **1%**；Semgrep 高/中危 **0**。

**运行与审计**

- [ ] `pnpm build && pnpm preview` 成功；
- [ ] Lighthouse：Performance ≥ 90 / Accessibility ≥ 90 / Best Practices ≥ 95 / SEO ≥ 95（CI 通过）。

**部署**

- [ ] `pnpm deploy` 成功并可访问首页；`robots.txt`/`sitemap.xml` 可访问。

---

## 12) 附：可复制的脚本片段（让代理或你本地一次跑通）

> 把下面放进 **Terminal** 或让 Claude Code 执行（分步执行更稳）：

```bash
# === 同步质量配置（来自 tucsenberg-web-frontier） ===
base=https://raw.githubusercontent.com/Shawn-Jones-7/tucsenberg-web-frontier/main
curl -fsSL $base/.dependency-cruiser.js -o .dependency-cruiser.js
curl -fsSL $base/.jscpd.json            -o .jscpd.json
curl -fsSL $base/.knip.json             -o .knip.json || true
curl -fsSL $base/knip.jsonc             -o knip.jsonc || true
curl -fsSL $base/semgrep.yml            -o semgrep.yml
curl -fsSL $base/lighthouserc.js        -o lighthouserc.js
curl -fsSL $base/.browserslistrc        -o .browserslistrc

# === 安装严格质量工具 ===
pnpm add -D semgrep jscpd knip dependency-cruiser lighthouse lighthouse-ci

# === 典型 wrangler.toml 关键位（示例） ===
cat > wrangler.toml <<'TOML'
name = "your-app"
main = ".open-next/worker.js"
compatibility_date = "2025-03-25"
compatibility_flags = [ "nodejs_compat" ]
[assets]
directory = ".open-next/assets"
binding = "ASSETS"
TOML
```

> 上述 wrangler 片段与字段命名参考 Cloudflare 官方 Next.js 指南示例。([Cloudflare Docs][3])

---

## 13) 常见问题与自愈指引

- **报 Node/Edge API 不可用** → 提升 `compatibility_date` 到近期、确认 `nodejs_compat` 已开启（Workers/Next.js 官方说明）。([Cloudflare Docs][2])
- **构建后找不到 `.open-next/worker`** → 按 OpenNext 文档用 `opennextjs-cloudflare` 生成 Worker 产物后，再用 Wrangler 预览/部署。([opennext.js.org][9])
- **如何一键创建项目** → `npm create cloudflare@latest -- my-next-app --framework=next`（C3 会初始化 Next 官方脚手架并配置 Cloudflare）。([Cloudflare Docs][3])
- **为什么更推荐 OpenNext 而非 next-on-pages** → Cloudflare 官方已说明 Cloudflare adapter 为首选。([The Cloudflare Blog][1])

---

## 14) 参考与溯源（精选）

- **Spec-Kit**：GitHub 仓库（含 `/speckit.constitution`、`/speckit.specify` 等工作流）与官网。([GitHub][5])
- **Spec-Kit 快速上手/教程**（演示全流程命令；亦含 CLI 指南）。([DeepWiki][8])
- **OpenNext × Cloudflare：Get Started / Dev-Deploy / 特性索引**。([opennext.js.org][4])
- **Cloudflare 官方：Next.js on Workers、Node 兼容层与日期说明**。([Cloudflare Docs][3])
- **Cloudflare 官方博文**（明确“Cloudflare adapter 现为首选”）。([The Cloudflare Blog][1])
- **Unverceled Next.js 模板**（Next 15 Starter，Cloudflare 部署）。([GitHub][6])
- **tucsenberg-web-frontier**（质量配置文件清单与命名）。([GitHub][7])

---

### 一句话总结

这份文档把 **Spec-Kit 的规范驱动流程** 与 **OpenNext（Workers Node 兼容层）** 的官方要求对齐，并把 **tucsenberg** 的严格质量门槛变成 **可执行脚本 + CI Gate**。将全文放入仓库后，直接把“启动提示”发给 **Claude Code**，即可按步骤完成**从规范到落地**的整套基础搭建。

[1]: https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/?utm_source=chatgpt.com 'Deploy your Next.js app to Cloudflare Workers with the Cloudflare ...'
[2]: https://developers.cloudflare.com/workers/runtime-apis/nodejs/?utm_source=chatgpt.com 'Node.js compatibility · Cloudflare Workers docs'
[3]: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/?utm_source=chatgpt.com 'Next.js · Cloudflare Workers docs'
[4]: https://opennext.js.org/cloudflare/get-started?utm_source=chatgpt.com 'Get Started - OpenNext'
[5]: https://github.com/github/spec-kit?utm_source=chatgpt.com 'GitHub - github/spec-kit: Toolkit to help you get started with Spec ...'
[6]: https://github.com/ixahmedxi/unverceled-nextjs?utm_source=chatgpt.com 'GitHub - ixahmedxi/unverceled-nextjs: A Next.js 15 Starter Kit Deployed ...'
[7]: https://github.com/Shawn-Jones-7/tucsenberg-web-frontier 'GitHub - Shawn-Jones-7/tucsenberg-web-frontier'
[8]: https://deepwiki.com/github/spec-kit/2.2-quick-start-tutorial?utm_source=chatgpt.com 'Quick Start Tutorial | github/spec-kit | DeepWiki'
[9]: https://opennext.js.org/cloudflare/howtos/dev-deploy?utm_source=chatgpt.com 'Dev Deploy - OpenNext'
[10]: https://github.com/ixahmedxi/unverceled-nextjs/blob/main/README.md?utm_source=chatgpt.com 'unverceled-nextjs/README.md at main · ixahmedxi/unverceled-nextjs · GitHub'
