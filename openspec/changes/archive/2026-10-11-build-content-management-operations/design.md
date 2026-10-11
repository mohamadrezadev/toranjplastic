## Context

`backend/src/content/` is a clean read-only slice: `ContentController` → `ContentService` → `PrismaPublicContentRepository` (behind a `PUBLIC_CONTENT_REPOSITORY` DI token), with `public-content.mapper.ts` normalizing (and silently dropping invalid) image/specification JSON for public display. `backend/src/identity/` provides `AuthGuard`/`AdminGuard` (role check, populate `request.auth.account`), `IdentityService.assertCsrf()` (called manually today only in `logout`), and a `SecurityAuditEvent` table used once, inline, in `bootstrapAdmin`. All six content Prisma models already share `slug @unique`, a `ContentStatus` enum (`DRAFT`/`PUBLISHED`/`ARCHIVED`), `publishedAt`, and SEO fields — the schema was clearly built with this write side in mind; archive-not-delete is already the only lifecycle the schema allows (no cascading hard-deletes).

## Goals / Non-Goals

**Goals:**

- Prove a complete, server-side-enforced content-write pattern (auth + CSRF + validation + slug-uniqueness + audit) on two structurally different resources (Category, Product).
- Keep the public read API, its tests, and its behavior completely unchanged.
- Make the pattern mechanically easy to repeat for the other four content types in a follow-up change.

**Non-Goals:**

- Building the admin frontend UI that calls this API — the current `frontend/src/app/admin/page.tsx` stays a placeholder. Without a UI, this change ships an API surface with no visible product behavior change until the UI change lands; that is intentional, mirroring how `build-secure-identity-foundation` shipped the auth backend before the redesigned frontend auth pages.
- Rolling the same CRUD+lifecycle pattern out to InjectionService, Material, Article, and ManagedPage — deferred to a follow-up change once this one is reviewed.
- A binary image-upload pipeline. Images stay `{ url, alt, width?, height? }` JSON pointing at already-hosted files, exactly like the read side and the catalog-media-provenance migration.
- Slug-change redirect history and sitemap/structured-data updates on publish — that is phase-2 slice 2.5 territory (search discoverability), not slice 2.4.
- A "draft" (unpublish-without-archiving) transition separate from archive. Archive already removes a record from public listings; a project owner who wants a finer-grained "temporarily hide but keep as published-track" state can request it as a follow-up — introducing it now would be guessing at an unasked-for requirement.

## Decisions

1. **A new `AdminContentModule`, not new methods bolted onto the existing `ContentModule`.** The existing module's whole contract is "published-only, read-only, no admin concerns." Admin reads (list/detail across all statuses, for preview) and admin writes are a different trust boundary and a different repository shape (needs `id`-based lookups and full-status visibility, not just slug-based published lookups). Both modules query the same Prisma tables directly — that's fine; the "modules don't import each other's internal repository" rule is about not reaching into another module's DI-scoped repository, not about which tables a module is allowed to touch.
2. **Reuse `SecurityAuditEvent`, via a small new `recordAuditEvent` helper function.** The table (`action: string`, optional `userId`, free-form `metadata: Json`) is already generic enough for `action: 'PRODUCT_PUBLISHED'`, `metadata: { entity: 'Product', id, slug, fromStatus, toStatus }`. The one existing call site (`IdentityService.bootstrapAdmin`) is refactored to go through the same `recordAuditEvent(...)` function instead of leaving two parallel ways to write the same table. Implemented as a plain exported function (matching `identity.security.ts`'s existing style for shared stateless logic) rather than an injectable `AuditService`/`AuditModule` — it has no DI-managed state, and a plain function avoids adding a second constructor parameter to `IdentityService` purely to satisfy an internal refactor. Alternative considered: a dedicated `ContentAuditEvent` table. Rejected — no requirement distinguishes identity vs. content audit trails yet, and splitting now would just mean two tables to query later instead of one `action`-filterable one.
3. **A composed `CsrfGuard` next to `AdminGuard`, not a merged guard.** `AdminGuard` is already used standalone on the read-only `GET /admin/access` route (no mutation, so CSRF is irrelevant there). Mutating routes add `@UseGuards(AdminGuard, CsrfGuard)`; `CsrfGuard` just calls the existing `IdentityService.assertCsrf(request)` and relies on `AdminGuard` having already populated `request.auth`. This keeps the read-only admin route's behavior untouched and makes the CSRF requirement visible per-route instead of hidden inside a monolithic guard.
4. **Status transitions are dedicated action endpoints (`POST .../:id/publish`, `POST .../:id/archive`), not a generic `PATCH status`.** A generic status field on the update DTO would let a client silently combine "edit three fields and also change status" in one ambiguous request, and would need the same business-rule validation (can't publish without required fields, archive is always legal) duplicated behind a generic setter. Explicit action endpoints make each transition's precondition and audit action name unambiguous, and match the plan's own verbs ("انتشار" / "آرشیو" as distinct operations from "ویرایش").
5. **Publish/archive are idempotent, not error-on-repeat.** Calling publish on an already-published record just returns its current state (200, no new audit event with a changed `fromStatus`/`toStatus` — or a no-op audit entry, see tasks). This avoids forcing a preview/admin UI to track client-side state just to avoid a 409 on a double-click, while slug-uniqueness conflicts (an actual data problem) still return `409`.
6. **Write DTOs validate strictly; they do not reuse the read-side mapper's silent-drop behavior.** `public-content.mapper.ts`'s `normalizeImage`/`normalizeSpecifications` exist to make already-trusted, already-admin-authored data safe to serve publicly even if a row is slightly malformed. On the write path the data is *becoming* trusted, so an invalid image URL or an empty specification label should be a `400` the admin sees immediately, not a value quietly discarded. New class-validator DTOs (`AdminImageDto`, `AdminSpecificationDto`) are added for this; the read-side mapper is untouched.

## Risks / Trade-offs

- **[Shipping an API with no UI]** → Deliberate (see Non-Goals); the e2e tests exercise it directly, and the admin-UI follow-up change can start immediately once this is reviewed.
- **[Two content modules touching the same tables could drift]** → Both read the same Prisma schema as the single source of truth; the admin repository's status/field set is a superset of the public one, not a divergent copy. The existing `public-content.mapper.spec.ts` / `prisma-public-content.repository.spec.ts` pattern is mirrored for the new admin repository so both are independently covered.
- **[CSRF guard ordering bug would silently skip the check]** → Covered by a negative-authorization e2e test per mutating route that sends a valid session cookie with a missing/mismatched CSRF header and asserts rejection, not just unit-testing the guard in isolation.
- **[Archiving a Category while Products reference it]** → Already safe at the schema level (`Product.category` is `onDelete: SetNull`, and archiving never deletes a row at all — it only changes `status`), so an archived Category simply stops appearing in its own public listing while linked Products keep their `categoryId` and keep rendering; this is called out explicitly in a test rather than left implicit.

## Migration Plan

No Prisma migration — no schema change. Rollback is a plain code revert; nothing is destructive, and no existing data is touched by this change (it only adds new ways to write rows that the existing schema already supported).

## Open Questions

- Whether "draft revert" (publish → draft without archiving) is needed is left for the project owner to raise if the admin-UI change surfaces a real need for it.
- The exact wording/content of audit `action` strings (e.g. `PRODUCT_PUBLISHED` vs. a more generic `CONTENT_STATUS_CHANGED`) is an implementation detail decided in `tasks.md`, not a product decision.
