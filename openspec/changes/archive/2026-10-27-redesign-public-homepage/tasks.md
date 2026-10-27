## 1. Specification & Architecture

- [x] 1.1 Complete OpenSpec artifacts (`proposal.md`, delta spec `public-visual-experience`, `design.md`, `tasks.md`)
- [x] 1.2 Validate OpenSpec schema with `pnpm openspec validate redesign-public-homepage --strict`

## 2. Homepage Redesign Implementation

- [x] 2.1 Refactor `frontend/src/app/(public)/page.tsx` to integrate B2B manufacturing capabilities, Strapi CMS articles with error fallback, and inquiry workflow strip
- [x] 2.2 Update `frontend/src/app/(public)/page.module.css` with responsive RTL styles for hero, capabilities grid, articles section, and inquiry strip
- [x] 2.3 Verify semantic headings, accessible Persian names, touch targets (>= 44px), and keyboard focus indicators

## 3. Verification & Automated Testing

- [x] 3.1 Create component unit tests in `frontend/src/app/(public)/page.test.tsx` verifying hero actions, Strapi articles rendering, resilient CMS fallback, and non-ecommerce guard
- [x] 3.2 Run `pnpm check:architecture` to verify monorepo boundaries
- [x] 3.3 Run `pnpm typecheck` to verify TypeScript contracts
- [x] 3.4 Run `pnpm test` across monorepo to ensure all existing and new unit tests pass
- [x] 3.5 Run Playwright tests on public shell (`frontend/e2e/public-shell.spec.ts`)

## 4. Finalization & Archive

- [x] 4.1 Check off all completed tasks in `tasks.md`
- [x] 4.2 Archive change using `pnpm openspec archive -y redesign-public-homepage`
- [x] 4.3 Commit and push changes to git
