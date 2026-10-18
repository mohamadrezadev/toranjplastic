## Why

The CMS currently accepts image URLs but cannot securely upload, process, reuse, publish, or retire managed media. Toranj Plastic needs a provider-neutral media capability now so staff can manage product and article imagery without Git while preserving draft privacy, legacy catalog URLs, and the ability to move away from the initial Runflare persistent disk without rewriting CMS contracts.

## What Changes

- Add an authenticated Media Library for `ADMIN` and `OPERATOR`, including bounded upload, search, preview, default-alt editing, reference visibility, and guarded deletion.
- Validate and decode JPEG, PNG, and WebP input, strip sensitive metadata, and produce portable WebP variants under provider-neutral relative object keys.
- Add `MediaAsset` and `MediaReference` persistence, versioned Product/Article media writes, atomic managed-reference plus legacy-JSON projection updates, reconciliation, retention, audit, and migration tooling.
- Replace URL-first authoring with a reusable Persian RTL uploader/picker and product gallery editor while retaining explicit legacy URL compatibility.
- Serve private previews through authenticated no-store routes and stable public variants only when an asset is referenced by effectively published content.
- Introduce a stream-based storage boundary. Use a mounted Runflare persistent disk for v1 after infrastructure preflight, while keeping public identifiers, URLs, database records, export manifests, and application contracts portable to a future S3-compatible adapter.
- Add storage readiness, coordinated backup/restore verification, orphan cleanup, monitoring, export/copy/checksum tooling, Runflare operations documentation, and a storage ADR.
- Preserve existing `/catalog/*` and approved external image URLs without mandatory bulk migration.
- Explicitly exclude customer uploads, inquiry attachments, rich article editing/inline references, video/audio/PDF/SVG/GIF processing, ecommerce, live inventory, automatic pricing, and unverified commercial or technical claims.

## Capabilities

### New Capabilities

- `cms-media-management`: Secure media ingestion, processing, storage abstraction, library operations, managed references, publication visibility, retention, migration portability, and CMS media UX.

### Modified Capabilities

- `content-management-operations`: Product and Article writes become media-reference aware, versioned, atomic with their audit/projection updates, and gated against non-ready media.
- `public-content-catalog`: Public Product and Article image DTOs preserve their compatible shape while managed media is delivered only through stable eligible public variants and legacy media continues to render.
- `admin-content-console`: The management console gains a protected Media Library and accessible product/article media authoring flows for content-capable staff.
- `service-health`: Backend readiness reflects required media-storage availability without exposing mount paths or other sensitive storage details.

## Impact

- **Backend:** new media module, image processor, mounted-disk storage adapter and contract tests, upload/preview/public streaming endpoints, Prisma models and additive migration, Product/Article concurrency and projection changes, audit/reconciliation/cleanup jobs, config and health checks.
- **Frontend:** new `features/admin-media` public boundary, `/admin/media`, reusable uploader/picker/gallery components, Product and Article form integration, stable public image handling, accessibility and responsive coverage.
- **Infrastructure:** Runflare persistent disk, stable media origin, reverse-proxy upload limits, one-writer v1 constraint, backup/restore rehearsal, monitoring and capacity alerts.
- **Dependencies:** Sharp and bounded multipart streaming support; completion and archive of `add-staff-access-management` before implementation relies on its content capability contract.
- **Operations:** new environment variables, storage ADR, Runflare runbook, provider migration runbook, export/checksum manifest, PostgreSQL plus media backup coordination.
