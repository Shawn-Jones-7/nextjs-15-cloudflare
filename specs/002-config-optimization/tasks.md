# Tasks: Configuration Optimization

**Input**: Design documents from `/specs/002-config-optimization/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: Not requested for this configuration optimization task.

**Organization**: Tasks are grouped by priority level (P0 → P1 → P2) per spec.md requirements.

## Format: `[ID] [P?] [Priority] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Priority]**: P0 (Critical), P1 (High), P2 (Future)
- Include exact file paths in descriptions

---

## Phase 1: Pre-flight Verification

**Purpose**: Verify current state before making changes

- [X] T001 Run `pnpm typecheck` to check current type errors
- [X] T002 [P] Run `pnpm lint` to check current lint errors
- [X] T003 [P] Run `pnpm test` to verify tests pass before changes

**Checkpoint**: Baseline established - proceed only if understanding current state ✅

---

## Phase 2: P0 Critical Tasks (Blocking)

**Purpose**: Fix blocking issues that prevent quality gates from working

**⚠️ CRITICAL**: These must complete successfully before P1 tasks

### P0-1: Restore Build Checks

- [X] T004 [P0] Remove `eslint.ignoreDuringBuilds: true` from `next.config.ts:14-16`
- [X] T005 [P0] Remove `typescript.ignoreBuildErrors: true` from `next.config.ts:17-19`
- [X] T006 [P0] Run `pnpm typecheck && pnpm lint` to verify build checks work

### P0-2: Reorganize VeliteWebpackPlugin

- [X] T007 [P0] Move `VeliteWebpackPlugin` class definition before `nextConfig` in `next.config.ts`
- [X] T008 [P0] Run `pnpm build` to verify webpack plugin still works

### P0-3: Fix ESLint Rule

- [X] T009 [P] [P0] Remove `'react-hooks/react-compiler': 'error'` rule from `eslint.config.js:145`
- [X] T010 [P0] Run `pnpm lint` to verify no react-compiler errors

**Checkpoint**: P0 Complete - Build quality gates restored, proceed to P1 ✅

---

## Phase 3: P1 High Priority Tasks (This Iteration)

**Purpose**: Enhance configuration for Cloudflare Workers and modern tooling

### P1-1: Add Cloudflare Workers Config

- [X] T011 [P1] Add `poweredByHeader: false` to `nextConfig` in `next.config.ts`
- [X] T012 [P1] Add `images: { unoptimized: true }` to `nextConfig` in `next.config.ts`

### P1-2: Add TypeScript Cloudflare Types

- [X] T013 [P] [P1] Run `pnpm add -D @cloudflare/workers-types`
- [X] T014 [P1] Add `"types": ["@cloudflare/workers-types", "node"]` to `compilerOptions` in `tsconfig.json`
- [X] T015 [P1] Run `pnpm typecheck` to verify CloudflareEnv types resolve

### P1-3: Migrate Vitest to Projects Config

- [X] T016 [P1] Upgrade Vitest to 3.2.4 (from 3.1.4)
- [X] T017 [P1] Migrate to inline `test.projects` config in `vitest.config.ts`
- [X] T018 [P1] Remove `--workspace` flag from package.json scripts, delete `vitest.workspace.ts`
- [X] T019 [P1] Run `pnpm test` to verify all tests still pass

### P1-4: Add verbatimModuleSyntax

- [X] T020 [P1] Add `"verbatimModuleSyntax": true` to `compilerOptions` in `tsconfig.json`
- [X] T021 [P1] Run `pnpm typecheck` to verify no import style errors

**Checkpoint**: P1 Complete - All high priority enhancements done ✅

---

## Phase 4: P2 Future Tasks (Deferred)

**Purpose**: Document future improvements - DO NOT IMPLEMENT NOW

> **NOTE**: These tasks are recorded for future reference only. Implementation deferred per research.md findings.

| ID | Task | Status |
|----|------|--------|
| P2-1 | Optimize Playwright CI to install only chromium | Deferred |
| P2-2 | Document ESLint flat config migration status | Deferred |
| P2-3 | Verify tw-animate-css Tailwind v4 compatibility | Deferred |
| P2-4 | Evaluate Zod vs Arktype consolidation | Deferred |
| P2-5 | Implement next-intl lazy loading (when >30KB) | Deferred |

---

## Phase 5: Final Verification

**Purpose**: Full validation of all changes

- [X] T022 Run `pnpm typecheck` - expect exit 0
- [X] T023 [P] Run `pnpm lint` - expect exit 0
- [X] T024 [P] Run `pnpm build` - expect success
- [X] T025 [P] Run `pnpm test` - expect all tests pass
- [X] T026 Run full CI locally: `pnpm quality` - expect all checks green
- [X] T027 Review git diff for unintended changes
- [X] T028 Commit changes with message: `chore: optimize project configuration for Cloudflare Workers`

**Checkpoint**: All changes verified - ready for PR ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Pre-flight) → Phase 2 (P0 Critical) → Phase 3 (P1 High) → Phase 5 (Verification)
                                                     ↓
                                              Phase 4 (P2 Deferred - skip)
```

### Task Dependencies

| Task | Depends On | Reason |
|------|------------|--------|
| T004-T005 | T001-T003 | Know baseline before changes |
| T006 | T004, T005 | Verify after removing ignore flags |
| T007 | T006 | Build must pass before reorganizing |
| T008 | T007 | Verify after reorganizing |
| T011-T012 | T008 | Add to reorganized config |
| T014 | T013 | Types must be installed first |
| T015 | T014 | Verify after adding types |
| T016-T018 | T008 | Safe to modify test config after build works |
| T019 | T016-T018 | Verify after migration |
| T020 | T015 | Add after types configured |
| T021 | T020 | Verify after enabling |
| T022-T028 | T021 | Final verification after all changes |

### Parallel Opportunities

**Within Phase 1:**
```bash
# Can run in parallel:
T002: pnpm lint
T003: pnpm test
```

**Within Phase 2:**
```bash
# T009 can run in parallel with T004-T008 (different file)
T009: Fix eslint.config.js
```

**Within Phase 3:**
```bash
# T013 can start immediately (no file dependency)
T013: pnpm add -D @cloudflare/workers-types
```

**Within Phase 5:**
```bash
# Can run in parallel:
T023: pnpm lint
T024: pnpm build
T025: pnpm test
```

---

## Implementation Strategy

### Recommended Order (Single Developer)

1. **Pre-flight** (T001-T003): Understand current state
2. **P0 Critical** (T004-T010): Fix blockers first
3. **P1 High** (T011-T021): Enhance config
4. **Verification** (T022-T028): Validate and commit

### MVP Approach

Stop after Phase 2 (P0 Critical) if time-constrained:
- Build quality gates restored
- Code organization improved
- ESLint errors fixed
- **Value delivered**: Project can catch errors during build

### Incremental Delivery

1. Complete P0 → Commit → Value: Build checks work
2. Complete P1-1 + P1-2 → Commit → Value: Cloudflare optimized
3. Complete P1-3 → Commit → Value: Modern Vitest config
4. Complete P1-4 → Commit → Value: Stricter type imports
5. Final verification → PR

---

## Files Modified Summary

| File | Tasks | Changes |
|------|-------|---------|
| `next.config.ts` | T004-T005, T007, T011-T012 | Remove ignore flags, reorganize, add CF config |
| `eslint.config.js` | T009 | Remove react-compiler rule |
| `tsconfig.json` | T014, T020 | Add types (workers-types + node), verbatimModuleSyntax, remove vitest.workspace.ts |
| `package.json` | T013, T016-T018 | Add @cloudflare/workers-types, upgrade vitest 3.2.4, remove --workspace flags |
| `vitest.config.ts` | T017 | Migrate to inline `test.projects` config |
| `vitest.workspace.ts` | T018 | **DELETED** - replaced by inline config |

---

## Execution Log

**Date**: 2025-12-09
**Executor**: Claude (连续模式 + Codex Review)

### Summary

- **P0 Critical**: ✅ All completed - build quality gates restored
- **P1-1**: ✅ Cloudflare config added (poweredByHeader, images.unoptimized)
- **P1-2**: ✅ TypeScript types added (@cloudflare/workers-types + node)
- **P1-3**: ✅ Vitest 3.2.4 + inline projects config migration complete
- **P1-4**: ✅ verbatimModuleSyntax enabled
- **Final Verification**: ✅ All quality checks pass

### Codex Review Findings

1. ✅ All changes align with requirements
2. ⚠️ Fixed: Added `node` to types array per Codex recommendation (ensures Node.js globals like `process` remain available)
3. ✅ Code quality and best practices followed

### Notes

- Vitest upgraded from 3.1.4 → 3.2.4 to enable inline `test.projects` config
- Removed deprecated `vitest.workspace.ts` and `--workspace` CLI flags
- All P1 tasks completed successfully
