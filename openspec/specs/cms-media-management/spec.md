# cms-media-management Specification

## Purpose
TBD - created by archiving change build-media-management. Update Purpose after archive.
## Requirements
### Requirement: Content-capable staff can manage a private media library
The backend SHALL expose bounded media upload, list, detail, private preview, default-alt update and guarded-delete operations below `/api/v1/admin/media` only to authenticated active accounts with the content-management capability. Every mutation MUST require CSRF validation, every Admin response MUST use `Cache-Control: no-store`, and no operation MAY expose storage credentials, absolute paths or internal failure details.

#### Scenario: Operator uploads an image
- **WHEN** an active `OPERATOR` submits a valid raster image with a valid CSRF token
- **THEN** the backend SHALL authorize the content capability, process the upload and return an explicit media DTO without any storage path or credential

#### Scenario: Account without content capability accesses media management
- **WHEN** a `CUSTOMER` or `SALES` account calls any Admin media operation
- **THEN** the backend SHALL return HTTP 403 and SHALL NOT read, create, modify or delete media data or files

#### Scenario: Anonymous caller previews private media
- **WHEN** a caller without a valid session requests an Admin media preview
- **THEN** the backend SHALL return HTTP 401 without returning media bytes or revealing whether the asset exists

#### Scenario: Mutation omits CSRF proof
- **WHEN** an otherwise authorized media mutation omits or supplies an invalid CSRF value
- **THEN** the backend SHALL reject the request and SHALL leave the database and storage unchanged

### Requirement: Untrusted image uploads are bounded and normalized
The media service SHALL accept only decoded JPEG, PNG or WebP input, SHALL enforce configurable stream-byte, pixel and dimension bounds, SHALL reject files by real content rather than trusting extension or client MIME, and SHALL create no more than 320, 800 and 1600 pixel WebP variants without upscaling. It MUST auto-rotate, strip EXIF and location metadata, limit processing concurrency, and MUST NOT retain the raw original after successful processing.

#### Scenario: Valid image is normalized
- **WHEN** authorized staff uploads a valid image within all configured bounds
- **THEN** the service SHALL store the required WebP variants, dimensions, sizes and checksums, mark the asset `READY`, and remove the temporary raw input

#### Scenario: File identity is forged
- **WHEN** an upload declares an allowed MIME or filename but its signature/decode is invalid or represents SVG, HTML, executable content or another unsupported format
- **THEN** the service SHALL reject it with `MEDIA_INVALID_FILE` and SHALL leave no permanent selectable asset or file

#### Scenario: Resource bound is exceeded
- **WHEN** an upload exceeds the configured stream size, pixel limit or processing quota
- **THEN** the service SHALL stop bounded processing, return the stable error contract, and SHALL NOT exhaustively buffer or permanently store the input

### Requirement: Media storage is portable across providers
The media module SHALL access binary storage only through a stream-based storage contract, SHALL persist provider-neutral relative keys rather than absolute paths or provider URLs, and SHALL build public URLs from an application-owned origin and media identifier. The v1 mounted-disk adapter MUST refuse to fall back to an unmounted or ephemeral deployment path.

#### Scenario: Mounted disk is unavailable
- **WHEN** mounted-disk storage is selected but its configured root is missing, outside the allowed root, not writable or below the minimum free-space threshold
- **THEN** readiness SHALL fail and upload SHALL return `MEDIA_STORAGE_UNAVAILABLE` without writing to another filesystem location

#### Scenario: Media library is copied to another adapter root
- **WHEN** every relative object key is copied and checksum-verified in a second conforming storage adapter
- **THEN** the same media identifiers and application-owned public routes SHALL resolve without rewriting Product or Article records

#### Scenario: User-supplied path attempts traversal
- **WHEN** any filename, key component or request attempts traversal or symlink escape outside the configured media root
- **THEN** the adapter SHALL reject the operation and SHALL NOT read, overwrite or disclose a file outside that root

### Requirement: Managed media has an explicit recoverable lifecycle
Each media asset SHALL transition only through the approved processing, ready, failed, deletion-pending and deleted lifecycle. Only `READY` assets MAY be attached to content; deletion of an asset with an active reference MUST return `MEDIA_IN_USE`; and filesystem/DB partial failures MUST be recoverable through idempotent reconciliation and cleanup.

#### Scenario: Database finalization fails after variants are written
- **WHEN** variant files are finalized but the database cannot mark the asset `READY`
- **THEN** the request SHALL NOT report success, the asset SHALL NOT be attachable, and reconciliation SHALL identify the files for recovery or bounded cleanup

#### Scenario: Referenced asset is deleted
- **WHEN** staff requests deletion of an asset referenced by a Product or Article
- **THEN** the backend SHALL return HTTP 409 with `MEDIA_IN_USE` and SHALL preserve the asset, variants and references

#### Scenario: Unreferenced asset is deleted
- **WHEN** authorized staff deletes a `READY` asset with no active references
- **THEN** the service SHALL move it to `DELETION_PENDING`, perform idempotent physical cleanup, record audit metadata and make it unavailable for selection or delivery

### Requirement: Public delivery follows effective content publication
The public media route SHALL return a requested ready variant only when at least one active reference belongs to effectively published content, including the existing Product category boundary. Missing, draft-only, archived-only, future-dated, category-blocked, failed and deleted assets MUST return the same HTTP 404 boundary without revealing hidden state.

#### Scenario: Draft-only asset is requested publicly
- **WHEN** an asset is referenced only by Draft content and a caller requests a public variant
- **THEN** the backend SHALL return HTTP 404 without media bytes or lifecycle details

#### Scenario: Shared asset has one published owner
- **WHEN** an asset is referenced by both Draft content and at least one effectively published owner
- **THEN** the requested variant SHALL be publicly eligible through the published owner

#### Scenario: Last public owner becomes ineligible
- **WHEN** the final effectively published owner is archived or otherwise becomes ineligible
- **THEN** subsequent origin requests SHALL return HTTP 404 while previously cached bytes MAY remain visible only for the documented public cache TTL

### Requirement: Media responses are safe and cache-appropriate
Public variant responses SHALL set the approved WebP content type, `nosniff`, ETag and bounded public cache policy. Private previews SHALL require authorization and use `no-store`. Neither response MUST expose original upload bytes, absolute storage paths, internal object keys or account/session data.

#### Scenario: Browser requests a public variant
- **WHEN** an eligible `thumb`, `card` or `detail` variant is requested
- **THEN** the backend SHALL return the normalized WebP bytes with safe content and cache headers and SHALL reject unknown variants

#### Scenario: Private preview response is inspected
- **WHEN** authorized staff retrieves a private preview
- **THEN** the response SHALL be non-cacheable and SHALL contain no original file or storage implementation metadata

### Requirement: Media retention and reconciliation are controlled and auditable
Temporary files older than the configured temporary retention and unattached ready assets older than the configured unattached retention SHALL be eligible for bounded cleanup. Cleanup MUST support dry-run, MUST NOT delete referenced assets, SHALL record metadata-only audit results, and SHALL coexist with a reconciliation report for missing, corrupt and orphaned variants.

#### Scenario: Cleanup runs in dry-run mode
- **WHEN** the scheduled cleanup evaluates eligible temporary and unattached assets in dry-run mode
- **THEN** it SHALL report candidates and counts without deleting files or changing asset lifecycle

#### Scenario: Asset gains a reference before cleanup commits
- **WHEN** an asset selected as unattached gains an active reference before physical deletion
- **THEN** cleanup SHALL re-check the reference guard and SHALL preserve the asset

### Requirement: Media backup and provider migration are verifiable
Operations SHALL be able to export a portable manifest of media identifiers, relative keys, variants, byte sizes and checksums, coordinate PostgreSQL and storage backup, verify restore consistency, and copy the library to another conforming adapter without changing public identifiers or routes.

#### Scenario: Restored media is reconciled
- **WHEN** PostgreSQL and media storage are restored in a non-production environment
- **THEN** reconciliation SHALL verify every referenced variant and checksum and SHALL report every missing, corrupt or orphaned object before traffic is enabled

#### Scenario: Provider migration is rehearsed
- **WHEN** the library is copied to a second disposable adapter using the exported manifest
- **THEN** all copied variants SHALL pass checksum verification and existing media IDs and public route contracts SHALL remain unchanged

### Requirement: Media authoring is accessible Persian RTL
The Media Library, uploader, picker and gallery editor SHALL be Persian RTL, keyboard operable, focus-visible and understandable without color alone. They SHALL expose loading, empty, upload-progress, processing, ready, failure, disabled, stale/conflict and deletion-blocked states and MUST avoid unintended page-level horizontal overflow in light and dark themes at 360, 390, 768 and 1280 pixel widths.

#### Scenario: Product gallery is reordered without a pointer
- **WHEN** staff focuses a Product image and invokes its keyboard move-up or move-down control
- **THEN** the editor SHALL update the announced deterministic order, preserve editable alt text and keep focus in a predictable location

#### Scenario: Upload partially fails
- **WHEN** one file in a multi-file upload fails while other files succeed
- **THEN** the UI SHALL preserve successful selections and unsaved content fields, announce the failed item and provide a bounded retry action

#### Scenario: Media dialog closes
- **WHEN** staff completes or cancels selection in the Media Library dialog
- **THEN** focus SHALL return to the invoking control and the dialog SHALL not expose protected data after closure

