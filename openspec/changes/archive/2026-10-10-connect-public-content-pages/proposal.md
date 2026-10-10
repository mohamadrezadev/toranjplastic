## Why

The public shell currently shows provisional placeholders even though the backend now exposes a safe, published-only content API. Phase 2 needs real Persian RTL catalog and managed-content pages so visitors can browse approved content without introducing CMS mutations, ecommerce behavior, or unverified business claims.

## What Changes

- Add public list and detail experiences for products, injection services, materials, and articles, backed only by the versioned public content API.
- Add managed public pages for about, contact, privacy, and terms content, with absent or unpublished records treated as not found rather than replaced by invented copy.
- Add shared, typed server-side content fetching and consistent loading, empty, error, pagination, breadcrumb, and not-found behavior.
- Derive page metadata from approved API fields and keep provisional/private routes `noindex`.
- Verify the connected pages in light and dark themes at 360, 390, 768, and 1280 pixel widths.
- Keep inquiry submission, authentication, CMS authoring, media management, redirects, sitemap, structured data, PWA, cart, payment, live inventory, automatic pricing, and unverified industrial claims out of scope.

## Capabilities

### New Capabilities

- `public-content-pages`: Covers typed public API consumption and the responsive list, detail, managed-page, feedback, navigation, and metadata behavior of published public content.

### Modified Capabilities

None.

## Impact

- Frontend routes under `frontend/src/app/(public)` will replace selected placeholder pages with explicit content routes.
- Frontend domain components and a server-side API client will consume the existing `/api/v1/public/content` contract; the backend contract and database schema do not change.
- Public navigation will point to implemented content destinations while `/inquiry` and `/account` remain provisional and `noindex`.
- Frontend unit/component tests and Playwright coverage will be expanded; no new runtime dependency is expected.
