## Why

`build-content-management-operations` proved the admin content-write pattern (auth + CSRF + validation + slug-uniqueness + audit + lifecycle) on Category and Product, and explicitly deferred rolling it out to the other four content types already defined in `schema.prisma` and already readable through the public API: InjectionService, Material, Article, ManagedPage. Phase-2 slice 2.4 (`docs/phase-2-public-cms-plan.md`) is not complete until an admin can manage all six content families, not just two.

## What Changes

- Extend `backend/src/admin-content/` with the same five-route shape (list, detail-by-id, create, update, publish, archive) for three more resources that share Product's "many fields, image array, specification array" shape: **InjectionService** (adds `ctaLabel`/`ctaHref`, no category relation, no `featured`) and **Material** (adds `family`/`grade`/`manufacturer`, `inquiryAvailable` instead of `featured`).
- Add the same five routes for **Article** and **ManagedPage**, which share a simpler, text-document shape: `title` instead of `name`, a required `body` field (not optional `description`), and a single nullable `featuredImage`/`images[]` instead of a specification array (Article has no images array at all beyond `featuredImage`; ManagedPage has an `images[]` array but no specifications).
- Mount routes under `admin/content/services`, `admin/content/materials`, `admin/content/articles`, `admin/content/pages` — mirroring the existing public route names (`content.controller.ts`) rather than the Prisma model names, for consistency with the already-shipped admin routes (`admin/content/categories`, `admin/content/products`).
- Reuse `recordAuditEvent`, `AdminGuard`+`CsrfGuard`, the idempotent-publish/archive rule, the 409-on-duplicate-slug mapping, and the strict-validation DTOs (`AdminImageDto`/`AdminSpecificationDto`) exactly as-is — no changes to shared infrastructure, only new resource-specific types/DTOs/repository methods/service methods/controller routes following the established shape.
- Add contract + negative-authorization + validation + conflict e2e coverage for all four new resources, following the existing `admin-content.e2e-spec.ts` conventions.

## Capabilities

### Modified Capabilities

- `content-management-operations`: the existing create/edit/publish/archive/audit/authorization guarantees, proven on two content types, now apply uniformly to all six content types defined in the schema.

## Impact

Backend only: new types, DTOs, repository methods, service methods, and controller routes inside the existing `backend/src/admin-content/` module (no new module, no new shared infrastructure). No Prisma schema or migration changes — every field used already exists. No frontend changes; the admin UI remains a separate, not-yet-started change.
