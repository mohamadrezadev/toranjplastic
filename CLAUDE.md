# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Toranj Plastic (ترنج پلاستیک) — a spec-driven, Persian/RTL corporate catalog and inquiry platform. **This is not an e-commerce site**: cart, online payment, live inventory, and automatic pricing are forbidden in v1, and any price/capacity/inventory/lead-time/certificate/technical claim must come from a verified source, never invented.

Full product and engineering rules live in `AGENTS.md` at the repo root (and `backend/AGENTS.md`, `frontend/AGENTS.md`) — read those before making changes; they are not duplicated here.

## Spec-driven workflow (mandatory before coding)

This repo uses [OpenSpec](openspec/config.yaml) as the only change lifecycle: `explore → propose → review → apply → archive`.

- Active/pending work: `openspec/changes/<change-name>/` (`proposal.md`, `design.md`, `tasks.md`, `specs/`).
- Merged, canonical requirements: `openspec/specs/<capability>/spec.md`.
- Source-of-truth precedence: PRD handoff package → `openspec/specs` + active `openspec/changes` → ADRs in `docs/decisions/` → Design System v2 (provisional) → existing code.
- Don't invent product behavior to resolve ambiguity — record the ambiguity as an OpenSpec artifact instead.
- Typo/formatting-only fixes don't need their own spec, but must not change product contract.

## Commands

Run from the repo root (pnpm workspace: `frontend`, `backend`).

```bash
pnpm install
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
docker compose up -d postgres
pnpm db:generate                # prisma generate (backend)
pnpm dev                        # runs frontend + backend in parallel
pnpm dev:frontend                # frontend only — http://localhost:3000
pnpm dev:backend                 # backend only  — http://localhost:3001/api/v1/health

pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check                       # lint && typecheck && test && build — run before considering work done

pnpm db:migrate                  # prisma migrate dev (backend)
pnpm db:migrate:deploy            # apply committed migrations (integration/CI)
pnpm db:studio
pnpm --filter backend admin:bootstrap   # one-time admin bootstrap, reads BOOTSTRAP_ADMIN_* env vars
pnpm check:architecture          # frontend import-boundary checker + negative fixtures
pnpm test:integration:postgres   # real transaction tests; requires disposable local PostgreSQL database with "test" in its name
```

Single test / targeted runs:

```bash
# backend (vitest)
pnpm --filter backend test -- path/to/file.spec.ts
pnpm --filter backend test:e2e -- path/to/file.e2e-spec.ts   # separate config: vitest.config.e2e.ts, matches **/*.e2e-spec.ts
pnpm --filter backend test:cov

# frontend (vitest, jsdom)
pnpm --filter frontend test -- path/to/File.test.tsx

# frontend e2e (Playwright — builds and boots the app against a mock content server)
pnpm --filter frontend test:e2e -- e2e/public-shell.spec.ts
pnpm --filter frontend test:e2e -- --project=mobile-360   # projects: mobile-360, mobile-390, tablet-768, desktop-1280
```

Backend lint is type-aware (`oxlint --type-aware`); frontend lint is `eslint`. `pnpm typecheck` for frontend runs `next typegen && tsc --noEmit`.

## Architecture

### Monorepo shape

- `frontend/` — Next.js (App Router) + React 19. Presentation and orchestration only; **no direct database access**.
- `backend/` — NestJS modular monolith. Owns business rules, authorization, persistence (Prisma) and audit.
- `openspec/` — spec source of truth (see above).
- `docs/` — architecture notes, ADRs (`docs/decisions/`), and per-change handoff docs.
- PostgreSQL is reachable only from `backend/`; `compose.yaml` runs it locally on 5432.

### Backend (NestJS)

- Entry: `backend/src/main.ts` → `app.setup.ts` (`configureApp`) applies global prefix `/api/v1`, helmet, `no-store` on `/api/v1/auth` and `/api/v1/admin`, CORS locked to `FRONTEND_ORIGIN`, and a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- `backend/src/config/environment.ts` — all env vars are parsed and bounds-checked through `loadEnvironment`; invalid env throws at boot. Add new env vars here, not via raw `process.env` reads elsewhere.
- Current modules (`app.module.ts`): `HealthModule`, `ContentModule` (public catalog read: Category/Product/InjectionService/Material/Article/ManagedPage), `IdentityModule` (auth/session/admin).
- Modules must not import another module's internal repository/service directly — only the exported public contract (see `IdentityModule`'s `exports`). Each module layers controller → service/application → repository, matching `backend/AGENTS.md`.
- Auth: `identity.service.ts` issues/validates sessions; `AuthGuard` (any authenticated user) and `AdminGuard` (role === `ADMIN`) in `identity/auth.guard.ts` are the two authorization primitives — use them rather than ad hoc role checks in controllers. `identity.security.ts` holds password hashing (argon2) and rate-limit logic.
- Prisma: schema at `backend/prisma/schema.prisma`; the generated client is **not** the default `@prisma/client` output — it's generated into `backend/src/generated/prisma/` (see `generator client { output = "../src/generated/prisma" }`) and driven through `backend/prisma7.config.ts`, so all `db:*` scripts pass `--config prisma7.config.ts`. Import the client from that generated path, not `@prisma/client`.
- Migrations live under `backend/prisma/migrations/<timestamp>_<name>/` and each one ships with a `ROLLBACK.md` alongside `migration.sql` — follow that convention for new migrations (what the migration touches, and the exact, narrowly-scoped rollback steps).
- `WorkspaceId`/tenant filtering is not part of this schema — there is no multi-tenant concept here; don't assume one.

### Frontend (Next.js)

- App Router under `frontend/src/app/`. Route groups: `(public)/(content)/*` for the public catalog/content pages (products, materials, injection-molding, articles, about/contact/privacy/terms), `(public)/[slug]` for managed pages, `auth/*` for login/register, `admin/` for the admin shell.
- `frontend/src/design-system/` defines shared primitives: `theme.ts` (light/dark tokens), `states.ts` (loading/empty/error/disabled/focus state contracts), `routes.ts` (the canonical public route table — add new public routes here, including nav visibility and readiness state).
- UI is layered `design-system` → `components/ui` (Button, Input, Select, Textarea, Choice, field-utils) → domain components (`components/content`, `components/navigation`, `components/feedback`, `components/theme`) → route screens in `app/`.
- Server Components are the default; `"use client"` only where real interaction/browser APIs are needed (e.g. `ThemeToggle`, `AuthShowcase`).
- `lib/public-content.ts` and `lib/content-metadata.ts` are the data-fetching/metadata boundary to the backend's content API — route pages should go through these rather than calling `fetch` directly.
- Playwright e2e (`frontend/e2e/`) runs against `e2e/mock-content-server.mjs`, not the real backend — check that mock when e2e behavior seems backend-dependent. Required viewports (360/390/768/1280) are configured as Playwright projects in `playwright.config.ts`.

### Cross-cutting

- Everything Persian-facing defaults to RTL; `.ltrData`/`dir="ltr"` is only for identifiers, phone, email, code, and URLs.
- Private/portal/admin routes: backend sets `Cache-Control: no-store` on `/auth` and `/admin`; frontend private pages must be `noindex`. `InternalNote`-type data must never reach customer-facing DTOs/responses.
- Inquiry/request status values are a fixed, approved set (Submitted, UnderReview, NeedMoreInfo, Quoted, Accepted, InProgress, Completed, Rejected, Cancelled) with every transition recorded in history — do not add new statuses without updating the spec.
