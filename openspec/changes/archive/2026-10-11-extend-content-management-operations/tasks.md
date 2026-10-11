## 1. Shared types and DTOs

- [x] 1.1 Extend `admin-content.types.ts` with `AdminInjectionService`, `AdminMaterial`, `AdminArticle`, `AdminManagedPage` (+ their `*WriteInput` types) and `AdminListQuery` reuse for list queries (no extra filter fields beyond `status`, matching the public API's query shapes for these four types).
- [x] 1.2 Add `dto/admin-injection-service.dto.ts`, `dto/admin-material.dto.ts`, `dto/admin-article.dto.ts`, `dto/admin-managed-page.dto.ts` (`Create*Dto`/`Update*Dto`), reusing `AdminImageDto`/`AdminSpecificationDto` from `dto/admin-image.dto.ts`.
- [x] 1.3 Add a safe-link check reuse for `ctaHref` on InjectionService (call the existing `isSafeContentImageUrl` helper; no new validator).

## 2. Repository layer

- [x] 2.1 Extend `AdminContentRepository` interface (`admin-content.repository.ts`) with list/get/create/update/setStatus methods for all four new resources.
- [x] 2.2 Implement them in `PrismaAdminContentRepository`, each with its own `*Select` const and `mapAdmin*` function, following the existing Category/Product pattern exactly (pagination, `handleMissing` for P2025, `Prisma.*UncheckedUpdateInput` casts for JSON fields).
- [x] 2.3 Unit test the new repository methods in `prisma-admin-content.repository.spec.ts` (one creation + one update + one status-transition case per resource, minimum).

## 3. Service layer

- [x] 3.1 Add create/update/publish/archive/list/get methods for all four resources to `AdminContentService`, matching the existing `*Category`/`*Product` method shapes (image/link safety assertion, slug-conflict-to-409 mapping, idempotent publish/archive, `recordAuditEvent` call per action with action strings `INJECTION_SERVICE_*`, `MATERIAL_*`, `ARTICLE_*`, `MANAGED_PAGE_*`).
- [x] 3.2 Unit test each resource's create/update-not-found/publish-idempotent/archive-idempotent/audit-on-success cases in `admin-content.service.spec.ts`, mirroring the existing Category/Product test blocks.

## 4. Controller layer

- [x] 4.1 Add routes to `AdminContentController` under `admin/content/services`, `admin/content/materials`, `admin/content/articles`, `admin/content/pages`: `GET` (list), `GET :id`, `POST` (create, CSRF-guarded), `PATCH :id` (update, CSRF-guarded), `POST :id/publish` (CSRF-guarded), `POST :id/archive` (CSRF-guarded) — same shape as the existing Category/Product routes.

## 5. Tests and verification

- [x] 5.1 Extend `backend/test/admin-content.e2e-spec.ts` with contract + negative-authorization (401/403/missing-CSRF) + validation (400) + conflict (409) + not-found (404) coverage for all four new resources, reusing the existing `withAdminSession`/`withCustomerSession`/`csrfHeader` helpers and fake-repository pattern.
- [x] 5.2 Backend lint, typecheck, unit tests, and e2e tests all pass.
- [x] 5.3 Frontend lint, typecheck, and unit tests re-run and unaffected (backend-only change).
- [x] 5.4 `openspec validate extend-content-management-operations --strict` passes.
