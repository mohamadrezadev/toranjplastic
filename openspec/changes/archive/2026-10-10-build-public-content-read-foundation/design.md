## Context

The backend currently contains only the application shell and health module; the Prisma schema intentionally has no domain models. Public Next.js routes are provisional and must not invent products or commercial data. PRD 03 requires managed products, categories, injection services, materials, articles, and pages, while the security contract forbids exposing content authoring without server-side admin authorization.

This change therefore establishes the persistence and read boundary only. It gives later public screens a stable API and gives later CMS authoring a lifecycle-aware data model without introducing an insecure temporary admin path.

## Goals / Non-Goals

**Goals:**

- Persist the six PRD 03 content families and their lifecycle, slug, order, publication, SEO, and presentation data.
- Expose versioned public list/detail contracts that only return effectively published content.
- Return explicit pagination and deterministic ordering for collection endpoints.
- Structurally omit workflow-only fields from public DTOs and make unpublished detail indistinguishable from a missing slug.
- Keep the backend modular through application contracts and an infrastructure repository.
- Deliver a named, reversible Prisma migration with contract and negative lifecycle tests.

**Non-Goals:**

- CMS create/update/publish/archive endpoints or UI, preview tokens, authentication, authorization roles, audit logs, or media upload.
- Connecting Next.js pages, sitemap, redirects, Search Console, structured data, or final SEO rollout.
- Publishing seed content, contact values, imagery, pricing, inventory, lead time, capacity, certificates, or technical claims.
- Cart, checkout, online payment, live inventory, or automatic injection pricing.

## Decisions

### 1. Use one shared lifecycle with model-specific tables

Prisma will define `ContentStatus` as `DRAFT`, `PUBLISHED`, or `ARCHIVED`. Category, Product, InjectionService, Material, Article, and ManagedPage remain separate tables because their fields and future authoring validation differ. Every table has a unique slug, timestamps, optional publication time, display order, and optional SEO title/description.

A record is effectively public only when its status is `PUBLISHED` and `publishedAt` is not null and not in the future. A product assigned to a category is public only when that category is also effectively public. This prevents accidental leakage during scheduled or partial publication.

**Alternative considered:** one polymorphic content table. It reduces table count but moves validation into nullable columns/JSON and makes future CMS rules harder to enforce.

### 2. Store bounded presentation structures as JSON, not commercial truth

Image references and specification rows are model-owned JSON fields in this foundation. The later write contract must validate their exact shape before persistence. Public mapping accepts only valid object/array shapes and emits a safe normalized subset. This avoids committing to a media storage provider before it is approved.

No price, inventory, delivery-time, capacity, certificate, or automatic quotation column is introduced. Verified technical narrative can later be stored in the normal descriptive fields after CMS authorization and approval workflows exist.

**Alternative considered:** a shared media table now. It requires ownership, upload, deletion, and private/public storage decisions that are outside this read foundation.

### 3. Expose a narrow read-only public contract

The endpoints are:

- `GET /api/v1/public/content/categories`
- `GET /api/v1/public/content/products` and `/products/:slug`
- `GET /api/v1/public/content/services` and `/services/:slug`
- `GET /api/v1/public/content/materials` and `/materials/:slug`
- `GET /api/v1/public/content/articles` and `/articles/:slug`
- `GET /api/v1/public/content/pages/:slug`

Lists accept validated `page` and `pageSize` parameters with defaults 1 and 12 and a maximum page size of 50. Products additionally accept an optional `featured` boolean. Collections return `{ items, pageInfo }`; details return the public item directly. Unknown, draft, archived, future-dated, or category-blocked slugs return the same 404 response.

Lists order by `displayOrder` ascending and then publication time descending; articles order by publication time descending and then display order. Public responses include only presentation fields, SEO fields, normalized images/specifications, and `publishedAt`; they omit database lifecycle state and internal timestamps.

**Alternative considered:** a generic `/content/:type` endpoint. Explicit controllers and DTOs provide clearer OpenAPI evolution and model-specific mapping.

### 4. Separate application policy from Prisma queries

`ContentService` owns pagination normalization and the public not-found policy. A `PublicContentRepository` contract defines typed list/detail operations. `PrismaPublicContentRepository` owns database filters, joins, ordering, and projection. Controllers validate transport input and delegate without business rules.

The Prisma client is provided by a small database module and disconnects during application shutdown. Tests replace the repository contract, so API contract tests do not require a live database; repository filters receive focused unit coverage and the migration is validated separately.

### 5. Use cache-safe public responses only

These endpoints contain no account or private data and may send a short public cache policy. Mutation, preview, and private content do not exist in this change. Future preview endpoints must use separate authenticated routes with `private, no-store` and cannot reuse this controller.

## Risks / Trade-offs

- **[A record is marked published without approval]** → Public eligibility also requires a valid publication timestamp; write authorization and approval remain blocked until the secure CMS change.
- **[JSON presentation data is malformed]** → Map through defensive normalizers and return an empty safe structure rather than raw database JSON.
- **[Slug changes break inbound URLs]** → Slug mutation and redirect history are excluded and must be implemented together in the authoring change before editors can rename published slugs.
- **[Database is unavailable]** → Health remains process-level in this slice; public content endpoints fail without leaking connection details. A readiness probe is deferred to deployment work.
- **[Migration adds empty tables but no content]** → This is intentional; no production seed or fake public record is created.

## Migration Plan

1. Back up the target PostgreSQL database before applying the migration, even though the migration only creates an enum, tables, indexes, and foreign keys.
2. Generate and review the Prisma SQL; it MUST contain no destructive drop or data rewrite.
3. Apply the migration, generate the Prisma client, then deploy the backend module.
4. Verify empty collection responses, hidden lifecycle states, detail 404 behavior, validation failures, and health regression.
5. Roll back the application first if needed. Because the tables are new and authoring is not enabled, database rollback may drop only these newly created empty content tables and the enum after confirming they contain no retained content. Once real content exists, rollback MUST preserve/export that data rather than dropping tables.

## Open Questions

- Which media storage provider and approved image constraints will the CMS write flow use?
- Which staff identities receive initial Admin access, and which authoring actions later belong to Sales or Operator?
- Which real content, logo, contact values, and technical claims are approved for the first publication?
- Is scheduled publication required in the first CMS authoring release, or is future-dated filtering only a safety boundary?
