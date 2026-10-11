## Why

The backend admin content-write API (`content-management-operations`, covering all six content types) has existed since this session's earlier changes, but `frontend/src/app/admin/page.tsx` is still a placeholder that only proves login/logout. No admin can actually create, edit, publish, or archive a Category or Product without `curl`/Postman. Phase-2 slice 2.4 is not meaningfully usable until there is a real UI in front of the API.

## What Changes

- Move the existing admin access gate (`getAdminAccess`, redirect-to-login-on-401, access-denied-on-403) out of `app/admin/page.tsx` and into a new `app/admin/layout.tsx`, so every route under `/admin/*` — not just the dashboard — is guarded the same way.
- Turn `/admin/page.tsx` into a real dashboard: a welcome line plus navigation cards to the content sections this change adds.
- Add a server-only typed API client (`lib/admin-content.ts`), mirroring `lib/public-content.ts`'s runtime-validated-parser style, that talks to the backend's `admin/content/*` routes with the session cookie forwarded and the `x-csrf-token` header attached on every mutating call.
- Add a full admin UI for **Category** and **Product** — the same two resource types the backend change proved first: list (status filter + pagination), create, edit, publish, and archive, each as a plain server-rendered form/table (no client-side JavaScript, matching this app's existing server-component-first style).
- Add Server Actions (`app/admin/content/actions.ts`) that submit these forms, read the CSRF cookie server-side (never exposed to the browser), call the backend, and redirect to the list or back to the form with a `?error=` indicator on failure — the same pattern `app/auth/actions.ts` already uses for login/register.
- Defer to follow-up changes: InjectionService/Material/Article/ManagedPage admin UI, a real rich-text editor for `body`/`description`, dynamic (JS-driven) add/remove for image and specification rows, and field-level (as opposed to whole-form) validation error display.

## Capabilities

### New Capabilities

- `admin-content-console`: an authenticated, authorized, CSRF-safe UI for managing Category and Product content records end-to-end (create, edit, publish, archive, list with pagination/status filter), fully `noindex`/`no-store`.

## Impact

Frontend only: new routes under `app/admin/`, a new `lib/admin-content.ts`, a refactored `app/admin/layout.tsx`/`page.tsx`. No backend changes — this change only calls the already-shipped `admin/content/categories` and `admin/content/products` endpoints. No change to the public site.
