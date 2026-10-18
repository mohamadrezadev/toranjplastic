## ADDED Requirements

### Requirement: Managed public images use stable eligible variants
Public Product and Article DTOs SHALL expose managed imagery through stable application-owned media URLs while preserving the existing compatible image fields. The selected URL and dimensions SHALL identify an appropriate normalized variant and MUST NOT expose media lifecycle, storage provider, relative key, creator, reference count or private preview URL.

#### Scenario: Published Product contains managed media
- **WHEN** an effectively published Product is returned through the public content API
- **THEN** its ordered images SHALL use stable eligible public media URLs with approved alt and dimensions and SHALL omit all storage and authoring metadata

#### Scenario: Published Article has no featured image
- **WHEN** an effectively published Article has a null featured projection
- **THEN** the public DTO SHALL return a null featured image and public pages SHALL render without a broken image request

### Requirement: Public catalog preserves legacy media compatibility
Existing approved same-origin catalog paths and historical HTTP/HTTPS image projections SHALL remain readable and ordered without mandatory MediaAsset conversion. Public normalization SHALL continue to reject malformed raw JSON and MUST NOT interpret legacy URLs as authority to fetch or import remote content server-side.

#### Scenario: Legacy and managed Product images coexist
- **WHEN** an effectively published Product contains both approved legacy projection rows and managed references
- **THEN** the public DTO SHALL preserve their deterministic saved order and compatible `{url, alt, width?, height?}` presentation without duplicating rows

#### Scenario: Legacy external URL is read
- **WHEN** a previously approved HTTP/HTTPS image exists in stored content
- **THEN** the public mapper MAY return the validated projection but the backend MUST NOT download, re-host or treat that URL as a managed asset

### Requirement: Hidden managed media does not leak through public content
Public content mapping and media delivery SHALL not reveal managed asset identifiers or URLs that are not eligible through effectively published content. Draft, archived, future-dated and category-blocked content MUST remain indistinguishable from missing content at the public boundary.

#### Scenario: Draft Product detail is guessed
- **WHEN** a caller guesses the slug and media identifier of a Draft Product
- **THEN** both the public Product detail and its managed media variant SHALL return the established not-found boundary without lifecycle details
