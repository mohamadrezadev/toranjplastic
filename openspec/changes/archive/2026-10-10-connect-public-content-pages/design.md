## Context

Phase 2.1 introduced a versioned, read-only backend API for effectively published categories, products, injection services, materials, articles, and managed pages. The Next.js application still routes these destinations through a generic placeholder. This change spans routing, server-side data access, metadata, presentation components, and responsive verification, while preserving the public API as the only content boundary.

The application uses Next.js 16 with Cache Components and Partial Prefetching enabled. Public pages must build even when the backend is unavailable, stream runtime content behind Suspense/loading boundaries, remain Persian RTL, and must never manufacture catalog records or business claims when the API is empty or unavailable.

## Goals / Non-Goals

**Goals:**

- Render public catalog collections and details from the existing published-content API.
- Provide reusable typed data access and domain presentation patterns for all six content families.
- Distinguish empty collections, unavailable services, and unknown/unpublished detail slugs.
- Generate approved titles and descriptions for published detail and managed pages.
- Preserve accessible RTL behavior in both themes across all required viewports.

**Non-Goals:**

- CMS write operations, preview, authentication, authorization, media upload, or database changes.
- Inquiry forms, customer account flows, redirects, sitemap, structured data, Search Console, or complete technical SEO.
- PWA installation/offline behavior, ecommerce, cart, checkout, online payment, live stock, automatic pricing, or invented company/technical claims.

## Decisions

### Server-only API boundary

A frontend server module will own the backend base URL, URL construction, response parsing, error classification, and public DTO types. Server Components will call it directly so the browser does not duplicate backend calls or expose deployment-internal service addresses. Relative endpoint fragments and validated page numbers prevent arbitrary URL construction.

Alternative considered: client-side fetching. It was rejected because it weakens SSR content availability, adds hydration and loading complexity, and is unnecessary for read-only public pages.

### Runtime streaming rather than build-time API dependency

Content reads will remain uncached runtime fetches inside page-level Suspense/loading boundaries. This follows the enabled Next.js 16 Cache Components model and keeps `next build` independent of a live database/backend. The backend's public cache policy remains authoritative for HTTP responses; adding an application data cache can follow the CMS invalidation design later.

Alternative considered: `use cache` with timed revalidation. It was deferred because it can execute content reads while prerendering and would require a defined invalidation contract before CMS publishing exists.

### Explicit routes over the generic placeholder

Each implemented collection/detail destination gets an explicit App Router route. The catch-all route remains only for planned `/inquiry` and `/account` placeholders. Service URLs retain the approved `/injection-molding` public path while mapping internally to the backend `services` endpoints.

### Shared render patterns with family-specific fields

Collections share a page heading, card grid, pagination, and feedback patterns, but each family maps only its approved fields. Detail pages share hero, description, image, specifications, breadcrumb, and inquiry-link primitives while omitting absent fields. Managed-page bodies are rendered as plain preserved text, not raw HTML, to avoid creating an unsanitized HTML boundary.

### Error and metadata semantics

An API 404 becomes Next.js `notFound()` for detail and managed pages. Transport, invalid-payload, and server failures throw to a route error boundary with a retry action. Empty successful collections render an explicit empty state. Detail metadata uses the API's approved SEO fields with content-title fallbacks; provisional routes stay `noindex`. Pages do not silently convert backend failures into empty content.

### Images and links

Only normalized API image URLs are rendered. Standard `img` elements will be used initially because the API contract permits external image origins but no approved host allowlist exists for Next Image configuration. Service CTA links already filtered by the backend are rendered only when present; no missing CTA or contact value is invented.

## Risks / Trade-offs

- [Runtime API latency delays streamed content] → Provide immediate route loading UI and retain the backend's public cache headers; revisit shared caching with CMS invalidation.
- [Backend and frontend DTOs can drift] → Parse unknown JSON with focused runtime shape checks and cover valid/invalid/404 responses in frontend tests.
- [No configured media host optimization] → Preserve dimensions and lazy loading where available; add host-specific Next Image optimization only after the media provider is approved.
- [An empty production database makes pages sparse] → Render honest empty states and never seed or invent public catalog data.
- [Managed page body formatting is limited] → Preserve paragraphs safely as text; rich content requires a separately specified sanitized format.

## Migration Plan

1. Add the frontend API boundary and tests without changing backend/database contracts.
2. Add explicit collection/detail/managed-page routes and shared domain components.
3. Update route readiness, navigation/legal destinations, and end-to-end expectations.
4. Run lint, typecheck, unit tests, production build, strict OpenSpec validation, and responsive/theme browser tests.
5. Roll back by reverting the frontend routes/client/components; the existing catch-all placeholders and backend read API remain compatible, and no data migration is required.

## Open Questions

- The production API origin and approved public media host remain deployment inputs.
- Approved company contact content, rich-text authoring format, and final media provider remain unresolved and will not be inferred in this change.
