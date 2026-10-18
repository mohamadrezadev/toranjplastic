## ADDED Requirements

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
