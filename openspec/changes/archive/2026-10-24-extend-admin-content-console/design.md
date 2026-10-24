## Context

`build-admin-content-console` already settled every architectural question for this console: the layout-level access gate, the server-only `lib/admin-content.ts` client style, CSRF handled entirely server-side, fixed-row image/specification inputs, publish/archive as separate one-button forms, and the generic `?error=<kind>` redirect convention. The backend's `extend-content-management-operations` change already settled the four remaining resources' exact field shapes and route names (`admin/content/services|materials|articles|pages`). This change is pure repetition of both onto the four remaining resources — no new decision is being made here that wasn't already made in one of those two changes.

## Goals / Non-Goals

**Goals:**

- An admin can create/edit/publish/archive InjectionService, Material, Article, and ManagedPage records through the browser, exactly as they already can for Category and Product.
- The dashboard accurately represents all six content sections, not two.

**Non-Goals:**

- Any new UI pattern, validation behavior, or CSRF mechanism — this strictly reuses what `build-admin-content-console` already built.
- The other open console gaps named in this session's review (search, confirm dialogs, image preview, admin account management, dashboard stats, audit log viewer, bulk actions, export/import) — those are separate, independently prioritized follow-ups, not part of "cover all six content types."

## Decisions

1. **Route segments match the backend's own route nouns, not the Prisma model names** — `app/admin/services`, `/materials`, `/articles`, `/pages`, exactly as `extend-content-management-operations` named the backend routes (`admin/content/services|materials|articles|pages`), which themselves already matched the public API's nouns. No new naming decision; this just carries the existing one through to the frontend.

2. **Two field-shape groups, matching the backend's own grouping.** InjectionService and Material reuse the Product-shaped fields component (name/slug, summary/description, fixed image rows, fixed specification rows, meta fields) plus their own extra fields (`ctaLabel`/`ctaHref` for InjectionService; `family`/`grade`/`manufacturer`/`inquiryAvailable` for Material) — no category relation, no `featured`. Article and ManagedPage reuse a simpler text-document-shaped fields component (`title`/`body`, a single `featuredImage` for Article or an `images[]` array for ManagedPage, no specifications, no family of extra fields) — matching `extend-content-management-operations` design.md decisions #3-4 exactly. Four resources, two shared `*Fields` components (one extended per resource with its own extra inputs), not four independent copy-pasted forms and not one over-generic form trying to cover every shape.

3. **The dashboard becomes a static six-card grid, not a dynamically generated one.** The six content types are a fixed, known set (matching the six Prisma content models) — listing them as six literal `<Link>` cards in `app/admin/page.tsx` is simpler and more explicit than deriving the list from a shared route-metadata module that doesn't otherwise exist yet. If a seventh content type is ever added to the schema, updating this one literal list is a one-line change in the same place its five siblings already live.

## Risks / Trade-offs

- **[Eight new route files plus four new Server Action groups is a lot of mechanical repetition]** → Accepted, same reasoning the backend change already accepted for its own six-resources-in-one-module growth: this is repetition of an already-reviewed pattern, not new complexity, and splitting it differently would cost more in cross-file navigation than it saves.

## Migration Plan

No backend or data change. Rollback is a plain frontend code revert.

## Open Questions

None — every decision this change would need was already made by `build-admin-content-console` (frontend pattern) or `extend-content-management-operations` (field shapes and routes).
