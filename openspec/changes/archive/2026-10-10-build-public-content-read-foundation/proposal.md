## Why

The current public routes are provisional shells with no durable content lifecycle or backend contract. Phase two must first establish a safe published-content boundary so public catalog screens can be built without exposing drafts, archived records, or unverified commercial claims.

## What Changes

- Add persistent content models for categories, products, injection services, materials, articles, and managed pages with draft/published/archived lifecycle, stable unique slugs, ordering, SEO fields, and publication timestamps.
- Add versioned, read-only public API endpoints for lists and slug-based details.
- Ensure public queries return only effectively published records and never expose draft, archived, or future-dated content.
- Keep physical deletion, authoring/mutation endpoints, admin UI, authentication, media upload, redirects, sitemap, final SEO rollout, ecommerce, payment, live inventory, pricing, lead-time, capacity, certificates, and automatic injection pricing out of scope.
- Add a named Prisma migration, repository/service tests, API contract tests, and rollback/backup notes.

## Capabilities

### New Capabilities

- `public-content-catalog`: Define the persisted public content types, publication lifecycle, safe public DTO boundary, list/detail endpoints, ordering, and not-found behavior.

### Modified Capabilities

None.

## Impact

The change affects the backend Prisma schema and generated client, introduces a content module inside the NestJS modular monolith, adds read-only endpoints below `/api/v1/public/content`, and documents the initial content persistence migration. The frontend routes are not connected in this change; they remain the next phase-two slice. No authenticated or write API is introduced.
