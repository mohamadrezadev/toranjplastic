## 1. Access gate and dashboard

- [x] 1.1 Add `app/admin/layout.tsx` that runs the existing `getAdminAccess()` check (401 → redirect to `/auth/login`, 403 → access-denied card, 5xx/network → temporarily-unavailable card) around the whole `/admin/**` subtree.
- [x] 1.2 Simplify `app/admin/page.tsx` to a welcome line plus navigation cards linking to `/admin/categories` and `/admin/products`, removing the now-redundant inline `AdminGate`.

## 2. Admin content API client

- [x] 2.1 Add `lib/admin-content.ts`: type guards + typed `listCategories/getCategory/createCategory/updateCategory/publishCategory/archiveCategory` and the five `*Product` equivalents, following `lib/public-content.ts`'s parser-validated-response style but targeting `admin/content/*` with the session cookie forwarded.
- [x] 2.2 Add an `AdminContentError` class (status + kind: `validation`/`conflict`/`not_found`/`failed`) so Server Actions can map a failure to the right `?error=` value without re-deriving it from a raw HTTP status in multiple places.
- [x] 2.3 Unit test `lib/admin-content.ts`'s response parsing/error-mapping with a mocked `fetch`.

## 3. Category admin pages

- [x] 3.1 `app/admin/categories/page.tsx` — table (name, slug, status badge, updated date) with a status filter and prev/next pagination, reading `?page=`/`?status=`; a "دسته جدید" link to `/admin/categories/new`.
- [x] 3.2 `app/admin/categories/new/page.tsx` — create form (name, slug, description, single image url/alt, meta title/description) submitting to a `createCategoryAction`.
- [x] 3.3 `app/admin/categories/[id]/page.tsx` — edit form pre-filled from `getCategory`, plus separate publish/archive one-button forms reflecting current status (Decision 6).

## 4. Product admin pages

- [x] 4.1 `app/admin/products/page.tsx` — same table shape as categories plus a featured-only filter.
- [x] 4.2 `app/admin/products/new/page.tsx` — create form (name, slug, summary, description, category select populated from `listCategories`, featured checkbox, fixed 6 image rows, fixed 10 specification rows, meta title/description).
- [x] 4.3 `app/admin/products/[id]/page.tsx` — edit form pre-filled from `getProduct`, plus publish/archive forms.

## 5. Server Actions

- [x] 5.1 `app/admin/content/actions.ts`: `createCategoryAction`/`updateCategoryAction`/`publishCategoryAction`/`archiveCategoryAction` and the four `*Product` equivalents. Each parses `FormData` (dropping blank image/specification rows per Decision 4), calls the matching `lib/admin-content.ts` function, and on success redirects to the list (create) or back to the same edit page (update/publish/archive); on failure redirects back with `?error=<kind>`.
- [x] 5.2 Unit test the form-data-to-request-body mapping (blank-row dropping, boolean/number coercion) directly, without a live backend.

## 6. Verification

- [x] 6.1 Frontend lint, typecheck, and unit tests pass.
- [x] 6.2 Backend lint, typecheck, unit, and e2e tests re-run and unaffected (frontend-only change).
- [x] 6.3 `openspec validate build-admin-content-console --strict` passes.
- [x] 6.4 Manual check left for the user: log in as an admin and create/edit/publish/archive a Category and a Product through the running UI (per this session's standing "I test manually myself" instruction, no automated browser test is added for this).
