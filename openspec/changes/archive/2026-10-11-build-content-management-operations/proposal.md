## Why

Public content (Category, Product, InjectionService, Material, Article, ManagedPage) can only be read today — `backend/src/content/` exposes read-only, published-only endpoints, and the only "admin" surface that exists is a gate-check route (`GET /api/v1/admin/access`) plus a placeholder frontend admin page. There is no way to create, edit, publish, or archive content except by hand-writing a Prisma migration, which is how the current catalog records were seeded. Phase-2 slice 2.4 (`docs/phase-2-public-cms-plan.md`) calls for exactly this: create/edit/preview/publish/archive, slug-uniqueness protection, archive instead of physical delete, admin-only server-side authorization, and sensitive-action audit logging.

## What Changes

- Add an admin content-write module (`backend/src/admin-content/`) with its own repository boundary (not importing the public `ContentModule`'s internals), covering **Category** and **Product** first — the two shapes needed to prove the pattern end-to-end: a simple record with an optional single image (Category) and a more complex one with a category relation, an image array, a specification array, and a boolean flag (Product).
- For each of the two resources: create (always starts `DRAFT`), update (edits fields, does not change status), publish (`DRAFT`/`ARCHIVED` → `PUBLISHED`, sets `publishedAt`, idempotent if already published), archive (any status → `ARCHIVED`, idempotent if already archived), admin list (all statuses, paginated), and admin detail-by-id (any status, for preview).
- Enforce slug uniqueness with a clean `409 Conflict` instead of a leaked database error.
- Require `AdminGuard` (role) **and** CSRF validation on every mutating route, reusing the existing session/CSRF mechanism from `IdentityService` rather than inventing a second auth scheme.
- Record an audit event (reusing the existing `SecurityAuditEvent` table) for every create/update/publish/archive action, including the acting admin's account id. Extract the one existing inline audit-write call in `IdentityService` into a small shared `recordAuditEvent` helper so both modules call the same code path instead of duplicating `prisma.securityAuditEvent.create(...)`.
- Keep the existing image/specification contract (`{ url, alt, width?, height? }` / `{ label, value }` JSON, no binary upload pipeline) — write-side DTOs validate this shape strictly (reject invalid input) instead of the read-side mapper's silently-drop-invalid-entries behavior.
- Add contract tests and negative-authorization/validation tests (401 unauthenticated, 403 wrong role, 403/401 missing CSRF, 400 invalid payload, 409 duplicate slug) for every new endpoint, following the existing `identity.e2e-spec.ts` / `content.e2e-spec.ts` conventions.

## Capabilities

### New Capabilities

- `content-management-operations`: Admin-authenticated create/edit/publish/archive lifecycle for content records, with slug-uniqueness, strict payload validation, and audit logging.

### Modified Capabilities

None — `public-content-catalog` (the read side) is unaffected; published records written through the new admin API simply become visible there once their status is `PUBLISHED`, exactly as hand-seeded records are today.

## Impact

Backend only: a new `AdminContentModule` (controller/service/repository/DTOs) for Category and Product, a new shared `recordAuditEvent` helper (with `IdentityModule`'s existing inline audit call refactored to use it), new e2e/unit tests. No Prisma schema or migration changes — every field and the `DRAFT`/`PUBLISHED`/`ARCHIVED` lifecycle already exist in `schema.prisma`. No frontend changes in this slice; the admin UI that calls this API is deliberately out of scope (see Non-Goals in design.md) and will be its own change, as will rolling the same pattern out to InjectionService, Material, Article, and ManagedPage.
