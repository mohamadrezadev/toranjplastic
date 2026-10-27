## Context

Product and Article authoring currently persists presentation images as JSON URLs. The frontend exposes six Product URL/alt rows and one Article featured-image URL/alt pair; there is no upload, processing, library, durable runtime storage, managed reference, or concurrency contract. Clearing an Article featured image also reaches a nullable runtime path that the current service does not safely handle.

The product handoff requires optimized real imagery, draft privacy, server-side authorization, persistent file storage, backup and restore, and backward compatibility with approved `/catalog/*` assets. The initial deployment target exposes a persistent mounted disk to the Runflare Backend service, but the public documentation does not establish an S3 contract for the selected product. Compute-provider independence is therefore an architectural requirement: application contracts and data cannot encode Runflare paths or URLs.

Implementation depends on the content capability delivered by `add-staff-access-management`; that change must be verified and archived before this change is applied. Production Apply also depends on a Runflare preflight proving the paid plan, mount path, permissions, capacity, proxy limit, HTTPS media origin, replica count, backup and restore behavior.

## Goals / Non-Goals

**Goals:**

- Give `ADMIN` and `OPERATOR` a secure reusable Media Library for Product galleries and Article featured images.
- Validate and normalize untrusted raster input into bounded WebP variants without retaining the raw original.
- Keep Draft media private and expose stable public variants only through an effective-publication check.
- Make managed-reference, presentation projection, content version, and audit changes atomic in PostgreSQL.
- Preserve legacy `/catalog/*` and approved HTTP/HTTPS images without mandatory import.
- Isolate storage behind a stream-based contract and persist only portable relative object keys.
- Prove backup, restore, reconciliation, export, checksum verification, and migration to a second test adapter.
- Preserve Persian RTL, mobile-first and accessible CMS behavior at 360, 390, 768 and 1280 pixels.

**Non-Goals:**

- Customer or inquiry attachments, private business documents, or any customer-controlled file upload.
- Rich text editing or `ARTICLE_INLINE` references.
- Video, audio, PDF, SVG, animated GIF, OCR, AI generation, or URL ingestion.
- A shopping cart, online payment, inventory, automatic pricing, delivery promises, capacity, certification, or other unverified business claims.
- A production S3 adapter before an actual service contract and credentials are approved.
- Mandatory migration of historical static or external media.

## Decisions

### 1. Keep the capability provider-neutral and select storage by configuration

`MediaModule` owns a stream-based `MediaStorage` port with operations equivalent to put, open/read, exists, atomic finalize/move where supported, and delete. `MountedDiskStorage` is the only production adapter in v1; tests use a disposable filesystem adapter implementing the same contract. The selected adapter is configured by `MEDIA_STORAGE_PROVIDER` and injected through the module's public service boundary.

The database stores a relative `objectPrefix` and variant-relative keys. It never stores `/app/media`, another absolute path, an internal hostname, a Runflare URL, access credentials, or a provider SDK response. Path construction, containment, no-symlink policy and filesystem permissions belong to the mounted-disk adapter.

Alternatives considered:

- Writing directly to `frontend/public` or the deployment filesystem was rejected because deploys are not durable and it couples runtime data to the build.
- Installing MinIO on the same compute service was rejected because it adds operational state without removing the server dependency.
- Implementing S3 immediately was rejected until a real provider, endpoint, backup policy and credentials are approved.

### 2. Use application-owned stable media URLs

Managed media is identified publicly by `MediaAsset.id`, not its storage key. Admin preview uses `/api/v1/admin/media/:id/preview?variant=...`; public delivery uses `/api/v1/media/public/:id/:variant`. `MEDIA_PUBLIC_ORIGIN` is an application-owned HTTPS origin used to build compatible public DTO URLs.

The mounted-disk implementation streams bytes through NestJS. A future S3 adapter can keep the route stable and stream, redirect, or issue an eligible CDN response without changing Product/Article records. Public responses use `ETag`, `Content-Type: image/webp`, `X-Content-Type-Options: nosniff`, and an initial five-minute public cache TTL. Private preview is always `no-store`.

### 3. Process bounded uploads synchronously with limited concurrency

The Admin upload endpoint streams input to a temporary file on the mounted volume while enforcing the configured byte limit. It verifies magic bytes, performs a bounded Sharp decode, auto-rotates, strips EXIF/geo metadata and creates at most 320, 800 and 1600 pixel WebP variants without upscaling. A process-local semaphore defaults to two concurrent transforms, and role-aware rate/quota controls bound storage abuse.

Upload creates a `PROCESSING` record before finalization, writes variant files to a temporary sibling directory, atomically renames them to the final random prefix, updates metadata and status to `READY`, and returns `201`. Failure marks the asset `FAILED` when possible and schedules temporary/final orphan cleanup. `READY` means technically attachable; it does not mean public.

An asynchronous queue was considered but rejected for v1 because staff upload volume is low and it would add a new durable system. The API/state model leaves room for later asynchronous processing.

### 4. Represent managed usage relationally and keep JSON as a compatibility projection

`MediaAsset` stores lifecycle, provider-neutral keys, source checksum, normalized metadata, variant metadata, default alt, creator and timestamps. `MediaReference` stores the asset, exactly one owner, usage, full-gallery position and optional alt override. V1 allows only `PRODUCT_GALLERY` and `ARTICLE_FEATURED`; SQL checks and unique indexes enforce one owner, one Article featured reference and deterministic Product positions.

`Product.images` and `Article.featuredImage` remain additive compatibility projections. A validated image input is a discriminated union:

- legacy `{ url, alt, width?, height? }`; or
- managed `{ mediaAssetId, alt }`.

The service never accepts both `url` and `mediaAssetId` in one entry and never trusts a client-supplied managed URL. For managed entries, `MediaReference` is canonical and the service derives the projection URL and dimensions. Legacy entries remain projection-only and receive no fake asset/reference. Product `position=0` is the cover, avoiding a second `isPrimary` invariant. Clearing Article featured media with explicit `null` removes the managed reference and stores a null projection.

### 5. Make content media writes versioned and transactionally atomic

Add `contentVersion` with a non-destructive default to Product and Article. New media-aware updates require `expectedVersion`; a mismatch returns `409 CONTENT_VERSION_CONFLICT` without modifying content, references, projection or audit. During compatibility rollout, legacy-only writes remain accepted, but every request containing `mediaAssetId` is versioned.

Within the existing content unit-of-work boundary, a valid write updates content fields, replaces managed references, derives JSON projection, increments version, and writes audit metadata in one PostgreSQL transaction. Storage mutation is not part of that transaction; content writes reference only existing `READY` assets, so a DB rollback cannot publish an incomplete file.

### 6. Compute public eligibility from live references

The public media controller returns a variant only when the asset is `READY`, not logically deleted, the requested variant exists, and at least one active reference belongs to effectively published content. Product references also respect the existing category publication boundary. Draft, archived, future-dated, category-blocked, missing and unauthorized states all produce the same `404` response.

This permits one asset to be reused: a Draft reference does not hide an asset that is already legitimately public through another Published owner. After all public owners become ineligible, origin requests return 404; previously cached bytes can remain visible for at most the documented public TTL.

### 7. Separate logical deletion, retention and physical cleanup

Deleting an asset with any active reference returns `409 MEDIA_IN_USE`. An unreferenced asset moves to `DELETION_PENDING`; a cleanup job removes its variants and marks it `DELETED`. Temporary files older than 24 hours and unattached `READY` assets older than 30 days are candidates. Cleanup supports dry-run, bounded batches, idempotent retry, audit counts and safe handling of missing files.

A reconciliation job compares DB metadata and storage existence, reports missing/corrupt variants, finds storage orphans and never silently promotes or publishes an asset. Internal failure details stay out of public/admin DTOs and logs remain free of binary content and credentials.

### 8. Make backup and provider migration verifiable

Operations produce a portable manifest containing asset id, relative keys, variant, byte size and checksum. Backup runbooks coordinate PostgreSQL and media storage snapshots or place media mutations in maintenance mode so a consistent recovery point is identifiable. Restore runs reconciliation before traffic is enabled.

The migration runbook freezes mutations, backs up both stores, copies unchanged relative keys, verifies every manifest checksum, switches the configured adapter, smoke-tests private/public delivery, and retains the old store read-only for rollback. An integration test copies a fixture library between two disposable adapter roots and proves media ids and public route contracts do not change.

### 9. Keep frontend ownership boundaries explicit

`frontend/src/features/admin-media/` owns media API transport, schemas, Server Actions and reusable interactive components through its `index.ts`. Product and Article feature slices integrate through that public API; route files only gate, compose and set metadata. CSRF remains server-side and upload proxying must stream rather than buffer the complete multipart body.

The Media Library, picker, uploader and gallery editor expose loading, progress, processing, ready, failure, empty, disabled, stale/conflict and deletion-blocked states. Reordering is available through drag/drop and explicit keyboard move controls. Focus, labels, aria-live and dialog focus restoration are verified in both themes and required viewports.

### 10. Extend readiness without weakening liveness

`GET /api/v1/health` remains process-only and independent of PostgreSQL or storage. A distinct bounded `GET /api/v1/ready` checks required dependencies, including media-root readability/writability and minimum free bytes when mounted-disk storage is selected. It returns 200 or 503 with a generic status and component names only; it does not reveal paths, free-byte values, hosts, credentials or stack traces.

### 11. Configuration and operational ownership

The backend validates at least `MEDIA_STORAGE_PROVIDER`, `MEDIA_ROOT`, `MEDIA_PUBLIC_ORIGIN`, `MEDIA_MAX_UPLOAD_BYTES`, `MEDIA_MAX_PIXELS`, `MEDIA_MIN_FREE_BYTES`, `MEDIA_MAX_PRODUCT_IMAGES`, `MEDIA_PROCESSING_CONCURRENCY`, `MEDIA_TEMP_RETENTION_HOURS` and `MEDIA_UNATTACHED_RETENTION_DAYS`. `.env.example` contains placeholders only.

Production starts with one media-writing Backend replica. Scaling writers requires a separate reviewed change or evidence that the selected storage provides safe shared-write semantics. The storage ADR records mounted disk as the v1 adapter, not a permanent product contract.

### 12. Verification strategy

- Unit tests cover discriminated inputs, file signatures, pixel/byte bounds, safe keys, traversal/symlink rejection, variant selection, eligibility, version conflict, cleanup selection and error redaction.
- Disposable filesystem integration tests cover atomic finalize, partial failure, missing files, reconciliation, export/copy/checksum verification and adapter contract parity.
- Disposable PostgreSQL integration tests cover constraints, reference/projection/audit atomicity, concurrent version writes and publish gating.
- HTTP/E2E tests cover the authorization matrix, CSRF, private preview, public 404 boundary, upload-to-publish journey, shared references, Article null clearing, legacy rendering and storage failure.
- Frontend tests cover progress, retry, unsaved form preservation, conflict refresh, focus/keyboard behavior, RTL and no overflow at 360, 390, 768 and 1280 in both themes.
- Staging verifies Runflare restart/redeploy persistence plus coordinated backup and restore before production rollout.

## Risks / Trade-offs

- [Backend streams public bytes and can become a bandwidth bottleneck] → Use immutable variant keys, ETag and bounded public caching now; retain the stable route so a later S3/CDN adapter can redirect without data-contract changes.
- [Mounted disk may not support multiple safe writers] → Operate one writer in v1 and block horizontal media writes until provider semantics are proven.
- [DB and filesystem cannot share one transaction] → Reference only READY assets, finalize by state machine, run reconciliation and retain idempotent cleanup.
- [JSON projection and relational references can diverge] → Centralize all media-aware writes in one service/unit of work, derive managed URLs server-side and add rollback/consistency tests.
- [Five-minute public caches delay unpublish] → Document the bound, use short rollout TTL and never reuse object keys when bytes change.
- [Sharp decode can consume CPU/RAM] → Enforce stream bytes, pixel limits, transform concurrency, rate/quota and production resource monitoring.
- [Independent DB and disk backups can be inconsistent] → Use maintenance mode or recovery markers, portable manifests, checksum validation and restore rehearsal.
- [Compatibility writes without expectedVersion retain a limited legacy race] → Require versioning for all managed-media writes and track legacy removal as a later migration once the new UI is fully deployed.

## Migration Plan

1. Complete, verify and archive `add-staff-access-management`; review this change and resolve the Runflare preflight values.
2. Add the storage ADR, environment contract, runbooks and provider-neutral adapter contract tests.
3. Apply the additive Prisma migration for assets, references and Product/Article versions against an empty and representative disposable PostgreSQL database; record backup and rollback steps.
4. Deploy a backward-compatible Backend with media endpoints disabled until readiness passes; keep legacy content APIs operational.
5. Provision and bind the Runflare disk, configure the stable HTTPS media origin and proxy limits, then verify write/read, restart and redeploy persistence.
6. Enable Admin media operations, managed content payloads and public delivery; retain legacy URL reads/writes.
7. Deploy the Media Library and Product/Article integrations, then run security, PostgreSQL, filesystem, E2E, accessibility and responsive gates.
8. Enable cleanup/reconciliation in dry-run, review its report, then enable bounded deletion.
9. Perform coordinated staging backup and restore plus a provider-copy rehearsal before production release.

Rollback deploys the previous frontend/backend while preserving the additive schema and media files. Media mutations are disabled, the old application continues using legacy projections, and no table, disk, object or migration is destructively removed without a verified backup and export. If storage routing changed, the previous adapter and origin remain available read-only until rollback expiry.

## Open Questions

- What are the confirmed Runflare paid plan, disk capacity, mount path, proxy upload limit, backup schedule and restore limits for the production project?
- What application-owned HTTPS origin will serve media in production?
- Is production currently configured for more than one Backend replica, and can that be held to one writer for v1?
- What alert destinations and final disk free-space thresholds are approved by operations?
