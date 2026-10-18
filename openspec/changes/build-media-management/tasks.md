## 1. Review Dependencies and Infrastructure Evidence

- [x] 1.1 Verify and archive `add-staff-access-management`, then confirm `ADMIN` and `OPERATOR` receive the archived content-management capability contract consumed by this change. Evidence: strict validation passed and OpenSpec archived it as `2026-10-18-add-staff-access-management` after syncing the capability specs.
- [x] 1.2 Review and approve `docs/cms-media-management-prd.md` plus this change's proposal, design and five delta specs before application code changes begin. Evidence: consolidated PRD and all planning artifacts were reviewed in-session before Apply began.
- [ ] 1.3 Complete the Runflare production preflight and record evidence for paid plan, disk capacity, actual mount path, Node read/write permissions, reverse-proxy upload limit, HTTPS media origin, replica count, backup schedule and restore limits.
- [ ] 1.4 Prove on Runflare staging that a file written under the confirmed mount survives service restart and redeploy and that a missing/non-writable mount never falls back to ephemeral storage.

## 2. Architecture, Configuration and Persistence Foundation

- [ ] 2.1 Review and accept proposed ADR `docs/decisions/0004-provider-neutral-media-storage.md` after Runflare preflight confirms the mounted-disk assumptions, stable application-owned routes and one-writer constraint.
- [x] 2.2 Add bounded media environment variables to `.env.example` and typed Backend configuration validation, with tests for missing, malformed and unsafe values and no real credential or production path committed. Evidence: typed config tests cover production requirements, origin/path safety and every numeric bound.
- [x] 2.3 Add Sharp and the selected streaming multipart support to the Backend with lockfile updates, documented resource bounds and dependency-level tests or smoke checks. Evidence: `sharp`, `busboy` and types are locked; real JPEG/PNG/WebP processing tests exercise Sharp while config tests prove resource bounds.
- [x] 2.4 Add Prisma enums/models/relations for `MediaAsset` and `MediaReference` plus additive Product/Article `contentVersion`, including owner/usage/position constraints and indexes reviewed against the design. Evidence: Prisma schema validates and generates; additive SQL contains owner/usage, position, checksum, MIME, alt, lifecycle and protected-delete constraints.
- [ ] 2.5 Create the additive PostgreSQL migration and backup-aware rollback notes, then prove apply/rollback behavior against empty and representative disposable databases whose names include `test`.
- [ ] 2.6 Regenerate Prisma artifacts and add schema integration tests for one-owner references, one Article featured reference, deterministic Product positions, protected deletion and non-destructive existing content data.

## 3. Provider-Neutral Storage and Image Processing

- [x] 3.1 Create the Backend `MediaStorage` contract and module token with stream-based put/open/exists/finalize/delete behavior, keeping provider SDK types and absolute paths out of public contracts. Evidence: `MediaStorage` and `MEDIA_STORAGE` are exported by `MediaModule` with stream-only contracts.
- [x] 3.2 Implement `MountedDiskStorage` with relative random keys, configured-root containment, symlink/traversal rejection, sibling temporary paths, atomic rename, no ephemeral fallback and safe idempotent deletion. Evidence: adapter rejects unsafe/missing/symlink roots and keys and uses exclusive temporary writes plus same-root rename.
- [x] 3.3 Add disposable-filesystem contract tests proving successful streaming, atomic finalize, missing files, partial failure, traversal/symlink denial and parity across two independent adapter roots. Evidence: disposable filesystem suite passes on both adapter roots and leaves no partial file residue.
- [x] 3.4 Implement bounded image ingestion with byte counting, magic-byte plus real decode validation, 20-megapixel/default dimension limits, auto-rotation, EXIF removal, WebP variants at 320/800/1600 without upscaling and raw-input cleanup. Evidence: stream limiter plus Sharp processor and real raster tests pass for all three supported formats.
- [ ] 3.5 Implement the configurable processing semaphore, actor rate/quota enforcement and safe error mapping for invalid file, excessive bytes/pixels, exhausted processing capacity and unavailable storage.
- [x] 3.6 Add unit and filesystem integration tests for valid JPEG/PNG/WebP, MIME/extension forgery, corrupt input, SVG/HTML/executable rejection, decompression/pixel abuse, metadata removal, variant checksums and no permanent residue on failure. Evidence: processor tests derive MIME only from bytes, decode all inputs, assert stripped EXIF, checksums, no-upscale dimensions and empty storage after every rejection.

## 4. Media Lifecycle, APIs and Security Boundaries

- [x] 4.1 Build the Backend Media module's explicit DTOs, repository/service boundaries, lifecycle transitions and metadata-only audit events without cross-module repository imports. Evidence: `MediaModule` owns its DTO, repository token, Prisma adapter, service lifecycle and id-only audit metadata.
- [x] 4.2 Implement `POST/GET/PATCH/DELETE /api/v1/admin/media` operations with bounded pagination/search, reference counts, stable errors, content-capability guard, active-account check, CSRF on mutations and `no-store` responses. Evidence: controller reuses server-derived content capability and CSRF guards; global private-route middleware supplies `no-store`.
- [x] 4.3 Implement authenticated Admin variant preview with variant allowlisting, streaming, safe content headers, ETag/no-store behavior and no disclosure of paths, keys, internal errors or original bytes. Evidence: preview resolves allowlisted normalized variants internally and returns only a WebP stream and safe headers.
- [x] 4.4 Implement `/api/v1/media/public/:id/:variant` with effective Product/Article publication checks, Product category eligibility, shared-reference semantics, stable 404 concealment, WebP/nosniff/ETag headers and the reviewed five-minute cache policy. Evidence: repository eligibility uses live `some` references and existing publication/category rules; controller exposes a uniform not-found stream boundary.
- [ ] 4.5 Add Backend authorization and HTTP tests covering anonymous 401, Customer/Sales 403, Admin/Operator parity, forged role fields, invalid CSRF, draft/archived/future/category-blocked 404, eligible shared assets and unknown variants.
- [ ] 4.6 Add lifecycle and failure tests proving only `READY` assets attach, referenced deletion returns `MEDIA_IN_USE`, unreferenced deletion is idempotent, DB/final-file partial failures remain recoverable and logs/DTOs contain no sensitive storage data.

## 5. Product and Article Media Integration

- [ ] 5.1 Extend shared Backend content image contracts to a strictly validated legacy-versus-managed discriminated union and reject mixed `url`/`mediaAssetId`, client-supplied managed URLs, missing alt, duplicates and more than six Product images.
- [ ] 5.2 Extend the content unit of work so Product managed-reference replacement, full-gallery positions, server-derived compatibility projection, version increment and audit commit atomically with all existing Product fields.
- [ ] 5.3 Add Product PostgreSQL integration tests for mixed legacy/managed order, position-zero cover, duplicate/failed/deleted assets, rollback atomicity and two concurrent updates where the stale expected version receives `CONTENT_VERSION_CONFLICT`.
- [ ] 5.4 Extend Article create/update so managed featured selection, replacement and explicit `featuredImage: null` update the single reference, projection, version and audit atomically without null dereference.
- [ ] 5.5 Add Article regression and PostgreSQL integration tests for legacy featured images, managed selection/replacement, explicit clearing, unavailable assets, rollback and concurrent version conflict.
- [ ] 5.6 Gate Product and Article publication on all managed assets and required variants being ready, with transaction tests proving a failed gate preserves lifecycle state/timestamp and commits no publication audit.
- [ ] 5.7 Update public content mapping and frontend-safe contracts so managed and legacy images retain deterministic compatible `{url, alt, width?, height?}` output without duplicate rows, private identifiers, storage metadata or server-side legacy URL fetching.
- [ ] 5.8 Add public API and rendering regression tests for existing `/catalog/*`, approved external URLs, mixed galleries, null Article featured image, hidden managed media and stable managed public URLs.

## 6. Media Management Frontend

- [ ] 6.1 Create `frontend/src/features/admin-media/` with explicit types/schemas, server-only API client, streaming upload/Server Actions and `index.ts`, then extend architecture fixtures to reject deep imports and cycles.
- [ ] 6.2 Build the protected `/admin/media` route composition with capability gating, no forbidden prefetch, noindex/no-store metadata, bounded search/pagination, loading/empty/error states, usage visibility and guarded-delete feedback.
- [ ] 6.3 Build reusable `MediaUploader` and `MediaPicker` interactions with per-file progress, concurrency two, retry, partial-success preservation, processing/ready/failure states, focus trap/restoration and aria-live announcements.
- [ ] 6.4 Build the Product gallery editor with upload/library selection, six-image limit, managed and explicit legacy rows, editable required alt, preview, removal, position-zero cover, pointer drag/drop and keyboard move controls.
- [ ] 6.5 Integrate Product create/edit actions with expected version, the validated union payload, conflict preservation/refresh behavior and server-side CSRF attachment without exposing tokens to browser HTML.
- [ ] 6.6 Integrate Article create/edit with managed featured selection, replacement, per-use alt and explicit null clearing plus expected-version conflict behavior.
- [ ] 6.7 Configure public image rendering for the application-owned media origin and variant dimensions without trusting arbitrary remote hosts or breaking existing same-origin catalog assets.
- [ ] 6.8 Add frontend unit/component/route/action tests for permission-safe navigation, streaming action contracts, upload retry, unsaved-state retention, gallery order/keyboard behavior, Article clearing, conflict UI and private response metadata.
- [ ] 6.9 Verify Media Library, picker, uploader, Product gallery and Article featured flows in light/dark themes at 360, 390, 768 and 1280 pixels with keyboard/screen-reader checks and no unintended document overflow.

## 7. Retention, Reconciliation, Health and Portability Operations

- [ ] 7.1 Implement temporary-file and unattached-asset cleanup with configurable 24-hour/30-day defaults, dry-run, bounded batches, transactional reference recheck, idempotent retry, deletion lifecycle and metadata-only audit reporting.
- [ ] 7.2 Implement reconciliation that detects missing/corrupt variants and storage orphans, verifies checksums, never silently publishes/promotes data and emits bounded operational metrics without sensitive paths.
- [ ] 7.3 Implement portable manifest export plus copy/verify tooling for asset ids, relative keys, variants, sizes and checksums, with an integration test migrating a fixture library between two adapter roots without changing ids or public routes.
- [ ] 7.4 Add `GET /api/v1/ready` dependency checks for PostgreSQL and selected media storage while preserving process-only `/api/v1/health`, and test generic 200/503 responses with no path, capacity, credential or exception disclosure.
- [ ] 7.5 Add metrics and alert hooks for remaining capacity, growth, upload failures, processing p95, cleanup/reconciliation counts and public/private 404 rates using approved bounded labels.
- [ ] 7.6 Write the Runflare provisioning/verification runbook, coordinated DB+media backup/restore runbook and provider migration/rollback runbook, including maintenance mode, manifest verification and read-only rollback retention.

## 8. End-to-End Verification and Release Evidence

- [ ] 8.1 Add Backend E2E coverage for Upload → Draft attach → private preview → Publish → public variant → reorder/replace → Archive → origin 404, including shared references and storage failure recovery.
- [ ] 8.2 Add Playwright journeys for Operator Product gallery and Article featured-image workflows, Admin Media Library deletion rules, Sales/Customer denial, partial upload retry, conflict recovery and legacy media continuity.
- [ ] 8.3 Run architecture checks, lint, typecheck, unit tests, touched-file coverage, disposable PostgreSQL integration, disposable filesystem integration, Backend/frontend E2E and production builds; resolve every regression.
- [ ] 8.4 Run `openspec validate build-media-management --strict` and trace every requirement scenario to automated or recorded staging evidence before checking the corresponding task complete.
- [ ] 8.5 Perform and record the Runflare staging restart/redeploy persistence test, coordinated backup/restore rehearsal, reconciliation report and provider-copy/checksum rehearsal before production enablement.
- [ ] 8.6 Update `tasks.md` with evidence, create release notes and operational handoff, confirm rollback remains non-destructive, and prepare the fully verified change for review and archive.
