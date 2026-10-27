# content-management-operations Specification

## Purpose
TBD - created by archiving change build-content-management-operations. Update Purpose after archive.
## Requirements
### Requirement: Admin-only content mutation
Every content create, update, publish, and archive endpoint SHALL require an authenticated active account with the content-management capability, which is granted only to `ADMIN` and `OPERATOR`, enforced server-side, and SHALL require a valid CSRF token on every mutating request. These endpoints MUST respond `Cache-Control: no-store`.

#### Scenario: Unauthenticated request attempts a mutation
- **WHEN** a request with no valid session cookie calls a content create, update, publish, or archive endpoint
- **THEN** the server SHALL respond `401` and SHALL NOT create, modify, or change the status of any record

#### Scenario: Authenticated customer attempts a mutation
- **WHEN** a valid `CUSTOMER` or `SALES` session calls a content create, update, publish, or archive endpoint
- **THEN** the server SHALL respond `403` and SHALL NOT create, modify, or change the status of any record

#### Scenario: Operator mutates content
- **WHEN** an active `OPERATOR` submits a valid content mutation with a valid CSRF token
- **THEN** the backend SHALL perform the operation with the same validation, transaction, lifecycle, and audit guarantees used for an Administrator

#### Scenario: Admin session without a valid CSRF token attempts a mutation
- **WHEN** an authenticated `ADMIN` or `OPERATOR` request omits the CSRF header or sends a CSRF value that does not match the session
- **THEN** the server SHALL reject the request and SHALL NOT create, modify, or change the status of any record

### Requirement: Content lifecycle is create, edit, publish, archive
Every content record, across all six content types (Category, Product, InjectionService, Material, Article, ManagedPage), SHALL be created in `DRAFT` status. Editing a record's fields MUST NOT change its status. Publishing SHALL be a distinct action that sets status to `PUBLISHED` and records a publish timestamp, and SHALL be idempotent when the record is already `PUBLISHED`. Archiving SHALL be a distinct action available from any status that sets status to `ARCHIVED`, SHALL be idempotent when the record is already `ARCHIVED`, and MUST NOT physically delete the record or any record that references it.

#### Scenario: Admin creates a new record
- **WHEN** an authorized admin submits a valid create request for any of the six content types
- **THEN** the record SHALL be persisted with `DRAFT` status and MUST NOT appear in the public read API

#### Scenario: Admin publishes a draft record
- **WHEN** an authorized admin calls publish on a `DRAFT` or `ARCHIVED` record of any content type
- **THEN** its status SHALL become `PUBLISHED`, a publish timestamp SHALL be set, and the record SHALL become eligible to appear in the public read API

#### Scenario: Admin archives a published record that other records reference
- **WHEN** an authorized admin archives a Category that one or more Products reference
- **THEN** the Category's status SHALL become `ARCHIVED`, the referencing Products SHALL be unaffected and SHALL NOT be deleted or have their category reference cleared, and no record SHALL be physically deleted

#### Scenario: Admin publishes an already-published record
- **WHEN** an authorized admin calls publish on a record of any content type that is already `PUBLISHED`
- **THEN** the server SHALL respond successfully without error and the record's existing publish timestamp SHALL be unaffected

### Requirement: Content slug uniqueness is enforced on write
Every content create or update request that would result in a duplicate slug within the same content type SHALL be rejected without modifying any existing record.

#### Scenario: Admin creates a record with a slug already in use
- **WHEN** an authorized admin submits a create or update request whose slug matches an existing record of the same content type
- **THEN** the server SHALL respond `409` and SHALL NOT create or modify any record

### Requirement: Content write payloads are strictly validated
Image and specification values submitted through a content write endpoint SHALL be validated and rejected if invalid, rather than silently dropped or substituted.

#### Scenario: Admin submits an image with an unsafe or malformed URL
- **WHEN** a create or update request includes an image whose URL is not a same-origin path or an `http`/`https` URL, or omits required alternative text
- **THEN** the server SHALL respond `400` and SHALL NOT persist the record

### Requirement: Content mutations are audit-logged
Every successful create, update, publish, and archive action SHALL produce an audit record identifying the acting admin account, the action, and the affected record. The content write and its audit write MUST execute within one database transaction whenever the action changes persisted content; neither write may remain committed if the other fails. A successful idempotent publish or archive request SHALL still produce its required audit record without changing the existing content timestamp or status.

#### Scenario: Admin publishes a record
- **WHEN** a publish request changes a record to `PUBLISHED`
- **THEN** the status change, publish timestamp, and audit event SHALL commit atomically with the acting admin's account id, action, and affected record identifier

#### Scenario: Audit persistence fails
- **WHEN** a valid create, update, publish, or archive request changes content but its audit event cannot be persisted
- **THEN** the transaction SHALL fail, the content write SHALL be rolled back, and the endpoint SHALL NOT report success

#### Scenario: Content persistence fails
- **WHEN** a valid create, update, publish, or archive request cannot persist its content change
- **THEN** no audit event for that failed mutation SHALL be committed

#### Scenario: Admin repeats an idempotent lifecycle action
- **WHEN** an admin publishes an already-published record or archives an already-archived record
- **THEN** the server SHALL preserve the existing lifecycle fields and SHALL record the successful authorized action in the audit log

### Requirement: Admin preview visibility is separate from the public read boundary
Admin list and detail endpoints for all six content types SHALL return content records of any status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) for preview purposes. The public read API's existing published-only behavior MUST NOT change as a result of this capability.

#### Scenario: Admin previews a draft record before publishing
- **WHEN** an authorized admin requests a `DRAFT` record of any content type by id through the admin API
- **THEN** the server SHALL return the record, and the same record SHALL continue to be absent from the public read API's responses

### Requirement: Managed Product media writes are versioned and atomic
Product create and update operations that include managed media SHALL validate every asset as existing and `READY`, require no more than six total legacy and managed images, require meaningful alt text, reject duplicate media identifiers or positions, and treat full-gallery position zero as the cover. A managed-media update MUST supply the expected Product content version; references, compatibility JSON projection, content version increment and audit metadata SHALL commit in one PostgreSQL transaction.

#### Scenario: Product gallery is saved successfully
- **WHEN** authorized content staff submits a valid mixed legacy and managed gallery with the current expected version
- **THEN** the backend SHALL persist deterministic managed references, derive compatible image projections, increment the Product version and commit its audit record atomically

#### Scenario: Product version is stale
- **WHEN** a managed-media Product update supplies an expected version that no longer matches
- **THEN** the backend SHALL return HTTP 409 with `CONTENT_VERSION_CONFLICT` and SHALL NOT modify Product fields, media references, projection, version or audit log

#### Scenario: Product references an unavailable asset
- **WHEN** a Product write references a missing, failed, processing, deletion-pending or deleted asset
- **THEN** the backend SHALL reject the write without persisting a partial gallery or broken public URL

### Requirement: Article featured media supports explicit versioned clearing
Article create and update operations SHALL accept either a validated legacy featured image, a `READY` managed media identifier with alt text, or explicit `null`. A managed-media update or clear MUST supply the expected Article content version, and the Article projection, featured reference, version increment and audit metadata SHALL commit atomically.

#### Scenario: Managed featured image is selected
- **WHEN** authorized content staff saves a `READY` media asset with alt text and the current Article version
- **THEN** the backend SHALL create or replace the single featured reference, derive the compatible featured-image projection, increment the version and commit audit metadata atomically

#### Scenario: Featured image is explicitly cleared
- **WHEN** authorized content staff updates an Article with `featuredImage: null` and the current expected version
- **THEN** the backend SHALL remove any featured reference, store a null projection and complete without a null dereference or orphaned relation

### Requirement: Content publication gates managed media readiness
Publishing a Product or Article SHALL fail safely unless all of its managed media references resolve to `READY` assets with every required public variant present. Publication status, timestamp and audit MUST NOT commit when this gate fails.

#### Scenario: Content references a missing variant
- **WHEN** staff attempts to publish content whose managed asset lacks a required public variant
- **THEN** the backend SHALL reject publication with `MEDIA_NOT_READY`, preserve the prior lifecycle state and commit no publication audit event

#### Scenario: Legacy-only content is published
- **WHEN** otherwise valid content contains only existing approved legacy images
- **THEN** the publication action SHALL retain the established legacy behavior without requiring synthetic MediaAsset records

### Requirement: Legacy and managed image inputs remain unambiguous
Content image input SHALL distinguish legacy URL entries from managed media entries. A legacy URL SHALL continue to obey the existing safe URL and alt validation; a managed entry SHALL accept a media identifier and alt but MUST NOT accept or trust a client-supplied managed URL. The backend SHALL reject entries that mix or omit discriminating fields.

#### Scenario: Client forges a managed URL
- **WHEN** a managed media entry includes a client-selected URL or object key in addition to its media identifier
- **THEN** the backend SHALL reject the ambiguous input and SHALL NOT persist the URL or modify content

#### Scenario: Historical catalog image is retained
- **WHEN** staff edits content containing an approved `/catalog/*` legacy image without replacing that row
- **THEN** the backend SHALL preserve the legacy image and alt without creating a synthetic managed reference

