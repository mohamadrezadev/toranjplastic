## 1. Admin content API client

- [x] 1.1 Extend `lib/admin-content.ts` with `AdminInjectionService`/`AdminMaterial`/`AdminArticle`/`AdminManagedPage` types (+ `*Input` write types) and their type-guard parsers, mirroring `AdminCategory`/`AdminProduct`.
- [x] 1.2 Add `list*/get*/create*/update*/publish*/archive*` exports for all four resources, targeting `admin/content/services|materials|articles|pages`.
- [x] 1.3 Extend `lib/admin-content.test.ts` with at least one create + one error-mapping case per resource.

## 2. Server Actions and form mapping

- [x] 2.1 Extend `app/admin/content/form-mapping.ts` with `injectionServiceInputFromForm`/`materialInputFromForm`/`articleInputFromForm`/`managedPageInputFromForm`, reusing the existing `imageRows`/`specificationRows`/`singleImage`/`text`/`optionalText` helpers.
- [x] 2.2 Extend `app/admin/content/actions.ts` with create/update/publish/archive Server Actions for all four resources, following the existing redirect/`?error=` convention exactly.
- [x] 2.3 Extend `app/admin/content/form-mapping.test.ts` with form-to-input mapping cases for all four resources (at minimum: blank-row dropping, required-body enforcement is left to the backend/DTO layer, boolean/field coercion where applicable).

## 3. InjectionService and Material admin pages

- [x] 3.1 Add a shared `app/admin/services/ServiceFields.tsx` (Product-shaped: fixed image rows, fixed specification rows, `ctaLabel`/`ctaHref`, meta fields) and `app/admin/materials/MaterialFields.tsx` (same shape plus `family`/`grade`/`manufacturer`/`inquiryAvailable`, no `ctaLabel`/`ctaHref`).
- [x] 3.2 `app/admin/services/page.tsx`, `/new/page.tsx`, `/[id]/page.tsx` — list/create/edit, same structure as `app/admin/products/*`.
- [x] 3.3 `app/admin/materials/page.tsx`, `/new/page.tsx`, `/[id]/page.tsx` — same structure.

## 4. Article and ManagedPage admin pages

- [x] 4.1 Add a shared `app/admin/articles/ArticleFields.tsx` (title/slug, summary, required body textarea, single featured-image fieldset, meta fields) and `app/admin/pages/ManagedPageFields.tsx` (same shape but a fixed-row `images[]` fieldset instead of a single featured image).
- [x] 4.2 `app/admin/articles/page.tsx`, `/new/page.tsx`, `/[id]/page.tsx`.
- [x] 4.3 `app/admin/pages/page.tsx`, `/new/page.tsx`, `/[id]/page.tsx`.

## 5. Dashboard

- [x] 5.1 Update `app/admin/page.tsx`'s nav card grid to link to all six sections (`/admin/categories`, `/admin/products`, `/admin/services`, `/admin/materials`, `/admin/articles`, `/admin/pages`).

## 6. Verification

- [x] 6.1 Frontend lint, typecheck, and unit tests pass.
- [x] 6.2 Frontend build succeeds (confirms every new route compiles as a valid Server Component/Server Action pair).
- [x] 6.3 Backend lint, typecheck, unit, and e2e tests re-run and unaffected (frontend-only change).
- [x] 6.4 `openspec validate extend-admin-content-console --strict` passes.
- [x] 6.5 Manual check left for the user: log in as admin and exercise create/edit/publish/archive for one record of each of the four new types through the running UI.
