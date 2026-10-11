## Context

`backend/src/admin-content/` already implements the full pattern for Category and Product: `AdminContentController` → `AdminContentService` → `PrismaAdminContentRepository` (behind `ADMIN_CONTENT_REPOSITORY`), `AdminGuard`+`CsrfGuard` on every mutating route, `recordAuditEvent` on every create/update/publish/archive, idempotent publish/archive, 409 on duplicate slug, strict-validation DTOs. The four remaining Prisma models (`InjectionService`, `Material`, `Article`, `ManagedPage`) already have `slug @unique`, `ContentStatus`, `publishedAt`, and SEO fields — the same lifecycle columns Category/Product have. This change is pure horizontal repetition of an already-reviewed pattern, not new design.

## Goals / Non-Goals

**Goals:**

- Bring InjectionService, Material, Article, and ManagedPage to the same admin-write capability level as Category and Product, inside the same module.
- Keep every shared primitive (`recordAuditEvent`, `AdminGuard`, `CsrfGuard`, `AdminImageDto`, `AdminSpecificationDto`, the 409/400/404 mapping helpers) untouched and reused, not duplicated or forked.

**Non-Goals:**

- The admin frontend UI — still a separate, not-yet-started change.
- Any schema change — all fields already exist.
- Any change to the public read API or its tests.

## Decisions

1. **One service/controller/repository, six resources — not four new modules.** Matches the existing file's own shape: `AdminContentService`/`AdminContentController`/`PrismaAdminContentRepository` already hold both Category and Product methods side by side. Adding four more sets of methods to the same three files keeps one DI token, one guard setup, and one e2e spec file, rather than fragmenting into per-resource modules that would just re-import the same guards and helper.

2. **Route names mirror the public controller's path segments, not the Prisma model names.** The public API already calls these resources `services`, `materials`, `articles`, `pages` (see `content.controller.ts`); the admin API should use the same nouns so `admin/content/services` and `public/content/services` are recognizably the same resource. This diverges from the Prisma model names (`InjectionService`, `ManagedPage`) on purpose — the model name is an implementation detail, the route is a public-facing (to admins) contract.

3. **Article and ManagedPage do not get an `AdminSpecificationDto[]` field.** Neither Prisma model has a `specifications` column — only Category/Product/InjectionService/Material do. Adding a specifications field to Article/ManagedPage DTOs would accept input the repository has nowhere to persist. Article's only image field is a single nullable `featuredImage` (like Category's single `image`); ManagedPage has an `images[]` array (like Product's) but still no specifications.

4. **`title`/`body` are the field names for Article and ManagedPage, matching the Prisma columns — not renamed to `name`/`description`.** The DTOs mirror the schema exactly (`title: String`, `body: String` non-nullable) rather than normalizing to the Category/Product vocabulary; `body` is `@IsNotEmpty` (required) since the column itself is non-nullable, unlike `description` on other types which is optional.

5. **InjectionService keeps `ctaLabel`/`ctaHref` as plain optional strings; `ctaHref` is validated as an internal-only path.** The public mapper's `safeInternalHref` already restricts `ctaHref` to same-origin paths (`starts with "/"`, not `"//"`) — stricter than image URLs, which may be `http(s)` as well. The write side enforces the identical internal-only rule so an admin can never save a `ctaHref` that the public mapper would then strip; a `400` on write is preferable to a silently-blanked CTA link appearing later on the public site.

6. **Material's `inquiryAvailable` defaults to `true` on create**, matching the Prisma column default (`@default(true)`), the same way Product's `featured` defaults to `false` to match its column default.

## Risks / Trade-offs

- **[Four near-identical sets of CRUD methods inflate file size]** → Accepted: the existing two files are already ~250 lines combined for two resources; six resources is mechanical growth, not new complexity, and splitting now would cost more in cross-file navigation than it saves. If a seventh content type is ever added, that would be the right moment to reconsider extracting a shared generic helper.
- **[Divergent field shapes (title/body vs name/description, single vs array images) could cause copy-paste mistakes]** → Mitigated by giving every resource its own `*WriteInput`/`Admin*` type (no shared generic interface that would force a false unification) and its own full e2e contract test block, exactly as Category and Product each got their own.

## Migration Plan

No Prisma migration — no schema change. Rollback is a plain code revert; nothing destructive, no existing data touched.

## Open Questions

None — this is a direct repetition of an already-settled pattern onto already-existing schema fields.
