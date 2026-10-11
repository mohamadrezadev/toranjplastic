## Why

`build-admin-content-console` deliberately proved the admin UI pattern on Category and Product only, deferring InjectionService, Material, Article, and ManagedPage. The backend already fully supports all six (`extend-content-management-operations`), so today a real admin can manage two of the site's six content families through the browser and must still hand-edit the database for the other four. The dashboard (`app/admin/page.tsx`) also only links to those same two sections, so it doesn't represent the site's actual content model. This change closes that gap so the admin console can actually "handle the site's content," as requested.

## What Changes

- Extend `lib/admin-content.ts` with typed `list*/get*/create*/update*/publish*/archive*` functions and response parsers for **InjectionService**, **Material**, **Article**, and **ManagedPage**, mirroring the existing Category/Product functions and the backend's already-shipped `admin/content/{services,materials,articles,pages}` routes.
- Extend `app/admin/content/form-mapping.ts` and `app/admin/content/actions.ts` with the matching Server Actions for all four resources (create/update/publish/archive), reusing the same blank-row-dropping and error-kind-mapping helpers already in place for Category/Product.
- Add list/create/edit pages for all four resources under `app/admin/services/`, `app/admin/materials/`, `app/admin/articles/`, `app/admin/pages/` — field layouts matching each resource's actual shape (InjectionService and Material keep the image/specification-array pattern from Product; Article and ManagedPage use `title`/`body` and no specification array, matching the backend's own field-shape decisions from `extend-content-management-operations`).
- Update `app/admin/page.tsx`'s dashboard to link to all six content sections instead of two.
- Everything else (access gate, CSRF handling, `?error=` redirect convention, fixed-row image/specification inputs, publish/archive as separate one-button forms) is reused unchanged from `build-admin-content-console` — no new architecture, only repetition of the proven pattern onto four more resources.

## Capabilities

### Modified Capabilities

- `admin-content-console`: the existing create/edit/publish/archive/list console, proven on two content types, now covers all six content types the public site actually has.

## Impact

Frontend only: new route files, new `lib/admin-content.ts` exports, new Server Actions, an updated dashboard. No backend changes — this change only calls the already-shipped `admin/content/{services,materials,articles,pages}` endpoints. No change to the public site.
