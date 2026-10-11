## Context

The backend already exposes `admin/content/{categories,products}` with full create/update/publish/archive/list/get, guarded by `AdminGuard`+`CsrfGuard`, returning `Cache-Control: no-store`. The frontend already has the session/CSRF cookie mechanics proven in `lib/auth.ts` (`getAdminAccess`, `logoutAccount` reading the `toranj_csrf` cookie to set `x-csrf-token`) and a Server Action convention in `app/auth/actions.ts` (`"use server"` functions that call a `lib/*` fetch helper and `redirect()` based on the result). This change is the frontend half of an already-settled backend contract — it does not invent new backend behavior.

## Goals / Non-Goals

**Goals:**

- A real admin can log in and fully manage Category and Product records without any tool other than the browser.
- Every mutation stays server-to-server CSRF-safe without exposing the CSRF token to client JavaScript or requiring a hidden form field.
- Stay consistent with this app's existing style: Server Components by default, Server Actions for mutation, no new client-side state management.

**Non-Goals:**

- InjectionService/Material/Article/ManagedPage admin UI — same two-resource-first precedent as the backend change; a mechanical follow-up once this is reviewed.
- Rich text editing, image upload, or a dynamic JS repeater for image/specification rows — the backend's contract is already plain `{url, alt}` JSON pointing at hosted files; this change's forms collect that same shape through plain, server-rendered fields.
- Field-level inline validation errors — the existing auth pages only show one generic alert per failure mode, and this change matches that bar rather than building a new validation-display pattern.

## Decisions

1. **The access gate moves from the page to a layout.** `app/admin/page.tsx` currently inlines `AdminGate`. Every new route (`/admin/categories`, `/admin/categories/new`, `/admin/categories/:id`, and the `products` equivalents) needs the identical 401→redirect / 403→denied-message behavior. A `layout.tsx` wrapping `app/admin/**` runs that check once per request for the whole subtree, rather than every new page re-implementing `AdminGate`.

2. **A single `lib/admin-content.ts`, not one file per resource.** Mirrors `lib/public-content.ts`: one module, one `request()`-style helper, a type guard per resource shape, and typed `list*/get*/create*/update*/publish*/archive*` exports for both Category and Product. Mutating calls (`create*`, `update*`, `publish*`, `archive*`) go through a second helper, `adminMutate`, that adds the `x-csrf-token` header (read from the cookie jar, same as `logoutAccount` already does) and `method`; read calls (`list*`, `get*`) go through `adminRequest`, which only forwards the session cookie.

3. **CSRF stays entirely server-side; no hidden form field.** The browser POSTs to a Next.js Server Action at `/admin/*` (same-origin, covered by Next's own Server Action origin check). The Server Action itself — running on the server — then reads the `toranj_csrf` cookie and attaches it as a header on the *backend* call. The browser never sees or needs to submit that token, so there is no hidden `<input type="hidden" name="csrf">` anywhere in these forms; the double-submit pattern exists between the Next.js server and the Nest.js backend, not between the browser and the Next.js server.

4. **Image/specification rows are a fixed number of plain field groups, not a dynamic list.** Category has at most one image (a fixed 1-row group). Product has `images[]` (fixed 6 rows) and `specifications[]` (fixed 10 rows); the create/update Server Actions drop any row where every field in it is blank before building the request body, so an admin who only fills 2 of 6 image rows gets exactly 2 images, not 6 with 4 empty ones rejected by the backend's `AdminImageDto` validation. This keeps every admin page a plain server-rendered form (consistent with the rest of this app, which uses `"use client"` only for `ThemeToggle`/`AuthShowcase`) instead of introducing the first JS-driven dynamic-list widget in the codebase. A real repeater is a UX follow-up, not a blocker for making the API usable at all.

5. **Publish/Archive are separate `<form>`s on the edit page, not buttons inside the edit form.** The edit form's only submit action is "save fields" (`PATCH`). Publish and archive are distinct backend actions (`POST .../publish`, `.../archive`) with their own Server Actions and their own one-button `<form>`s rendered beside the edit form — this avoids any ambiguity about which backend call a given submit button triggers, and matches the backend's own decision (`build-content-management-operations` design.md #4) that these are dedicated action endpoints, not a generic status field.

6. **The publish/archive button for the record's current status is replaced with a disabled state label, not hidden.** E.g. once `status === "PUBLISHED"`, the "انتشار" button becomes a disabled "منتشرشده" label rather than disappearing — this tells the admin the current state at a glance without needing a separate status badge lookup, and avoids a confusing empty space where a button used to be. (A separate status badge is still shown in the list view, where there's no button to double as one.)

7. **Validation/conflict/not-found errors surface as one generic Persian alert via `?error=<kind>` on redirect back to the same form**, exactly like `loginAction`'s `?error=invalid`. `kind` is one of `validation` (400), `conflict` (409 duplicate slug), or `failed` (anything else, including network/5xx) — enough to give the admin an actionable next step (fix a field vs. pick a different slug) without building per-field error mapping in this slice.

## Risks / Trade-offs

- **[Fixed-row forms cap Product at 6 images / 10 specifications]** → Accepted for this slice; the backend itself has no cap, so this is a frontend-only UX limitation removable later by the dynamic-repeater follow-up without any API change.
- **[No field-level errors means a single typo anywhere shows the same generic message]** → Matches the existing bar set by `app/auth/*`; an admin backend audience (not the public) with a small, known field set is an acceptable place to accept this for now.
- **[Layout-level gate re-runs `getAdminAccess()` on every admin request]** → Already true today for the single `/admin` page; moving it to a layout does not add a new network round trip per page, since Next.js layouts render once per navigation into that subtree, not once per nested page in addition to the page itself.

## Migration Plan

No backend or data change. Rollback is a plain frontend code revert.

## Open Questions

None — this change implements an already-reviewed backend contract; no new product behavior is being decided here.
