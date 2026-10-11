## 1. Shared audit infrastructure

- [x] 1.1 Add a shared `recordAuditEvent` helper (`backend/src/audit/audit.ts`) wrapping `prisma.securityAuditEvent.create`. Implemented as a plain exported function (matching the codebase's existing style for shared stateless logic, e.g. `identity.security.ts`) rather than an injectable `AuditService`/`AuditModule`, since it needs no DI state and this avoids changing `IdentityService`'s constructor signature.
- [x] 1.2 Refactor `IdentityService.bootstrapAdmin`'s inline `securityAuditEvent.create` call to use `recordAuditEvent(...)`; the existing `INITIAL_ADMIN_BOOTSTRAPPED` action/metadata shape is unchanged, so `identity-migration.spec.ts` / `identity.service.spec.ts` kept passing with no edits.
- [x] 1.3 Unit test `recordAuditEvent` (`backend/src/audit/audit.spec.ts`).

## 2. Shared write-path guard

- [x] 2.1 Add `CsrfGuard` to `backend/src/identity/auth.guard.ts` (calls `IdentityService.assertCsrf(request)`, assumes `AdminGuard` ran first and populated `request.auth`); exported from `IdentityModule`.
- [x] 2.2 Unit test `CsrfGuard` in `auth.guard.spec.ts` (valid CSRF passes, failed CSRF propagates) alongside the existing `AuthGuard`/`AdminGuard` tests.

## 3. Admin content module skeleton

- [x] 3.1 Added `backend/src/admin-content/` with `admin-content.module.ts`, `admin-content.controller.ts`, `admin-content.service.ts`, `admin-content.repository.ts` (interface + `ADMIN_CONTENT_REPOSITORY` token) / `prisma-admin-content.repository.ts`, and `admin-content.types.ts` (admin shapes with `id`, `status`, `createdAt`, `updatedAt`, `displayOrder` beyond the public ones).
- [x] 3.2 Added DTOs: `AdminImageDto` / `AdminSpecificationDto` (`dto/admin-image.dto.ts`), `CreateCategoryDto`/`UpdateCategoryDto`, `CreateProductDto`/`UpdateProductDto`, and `AdminPaginationQueryDto`/`AdminProductQueryDto`/`IdParamDto`. Image URL safety is enforced in the service layer (`assertSafeImage`/`assertSafeImages`, reusing the same same-origin-or-http(s) rule as the public mapper) rather than a custom class-validator decorator, keeping the DTOs simple and the 400 message centralized.
- [x] 3.3 Controller mounted at `admin/content` (so `/api/v1/admin` → `no-store` applies automatically); `AdminContentModule` registered in `app.module.ts`.

## 4. Category endpoints

- [x] 4.1 `POST /api/v1/admin/content/categories` — create, status forced to `DRAFT`.
- [x] 4.2 `PATCH /api/v1/admin/content/categories/:id` — update fields; duplicate slug → `409`.
- [x] 4.3 `POST .../:id/publish` and `.../archive` — idempotent (no repository write or audit event if already in the target status), each successful transition writes an audit event.
- [x] 4.4 `GET /api/v1/admin/content/categories` (paginated, optional status filter) and `GET .../:id` (any status) for admin list/preview.
- [x] 4.5 Contract + negative-authorization (401 no session, 403 customer, 401 missing/invalid CSRF) + validation (400) + conflict (409) tests in `backend/test/admin-content.e2e-spec.ts`, plus repository- and service-level unit tests.

## 5. Product endpoints

- [x] 5.1 Same five routes as Category under `admin/content/products`, including `categoryId`, `images[]`, `specifications[]`, `featured`.
- [x] 5.2 Same contract + negative-authorization + validation + conflict coverage as Category (shared e2e suite and service spec).
- [x] 5.3 Archiving (or publishing) a Category or Product is implemented as a pure `status`/`publishedAt` field update — never a delete — confirmed by `prisma-admin-content.repository.spec.ts`'s assertion that a status-transition call's Prisma `data` payload contains only `{ status }` (plus `publishedAt` when publishing). Since no code path ever deletes a Category or Product, an archived Category's existing Products structurally keep their `categoryId` — there is nothing that could clear it.

## 6. Verification

- [x] 6.1 Backend lint, typecheck, unit tests (53 passed), and e2e tests (22 passed) all pass.
- [x] 6.2 Frontend lint, typecheck, and unit tests re-run and unaffected (backend-only change).
- [x] 6.3 `openspec validate build-content-management-operations --strict` passes.
