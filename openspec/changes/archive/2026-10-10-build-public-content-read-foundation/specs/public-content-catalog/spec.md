## ADDED Requirements

### Requirement: Persistent content families
The backend SHALL persist Category, Product, InjectionService, Material, Article, and ManagedPage as separate content families. Every content record SHALL have a unique stable slug within its family, `DRAFT`, `PUBLISHED`, or `ARCHIVED` status, display order, creation/update timestamps, optional publication timestamp, and optional SEO title and description. Product records SHALL support an optional category and featured flag; presentation images and specifications SHALL NOT imply price, stock, capacity, certification, or delivery commitment.

#### Scenario: New content schema is migrated
- **WHEN** the named content-foundation migration is applied to an empty supported PostgreSQL database
- **THEN** all content tables, lifecycle constraints, slug uniqueness indexes, ordering fields, and product-category relationship SHALL be created without adding public seed content or destructive operations

#### Scenario: Duplicate slug is persisted in one family
- **WHEN** two records in the same content family attempt to use the same slug
- **THEN** the database SHALL reject the duplicate while allowing the same slug in a different content family

### Requirement: Effective publication boundary
A record SHALL be publicly eligible only when its status is `PUBLISHED`, its publication timestamp exists, and that timestamp is not in the future. A categorized product SHALL additionally require its category to be publicly eligible. Draft, archived, future-dated, and category-blocked content MUST NOT be returned by public list or detail operations.

#### Scenario: Public list contains mixed lifecycle records
- **WHEN** a public collection is queried while matching draft, archived, future-dated, and effectively published records exist
- **THEN** only effectively published records SHALL appear in the collection and pagination total

#### Scenario: Unpublished detail slug is requested
- **WHEN** a caller requests a slug that is missing, draft, archived, future-dated, or blocked by an unpublished category
- **THEN** the API SHALL return the same not-found response without revealing which hidden state exists

### Requirement: Versioned public content endpoints
The backend SHALL expose read-only endpoints below `/api/v1/public/content` for category lists; product, injection-service, material, and article lists/details; and managed-page details. The public controller MUST NOT expose create, update, publish, archive, delete, preview, or upload operations.

#### Scenario: Published collection is requested
- **WHEN** a caller sends a valid GET request to a supported collection endpoint
- **THEN** the API SHALL return HTTP 200 with `{ items, pageInfo }` and a public cache policy

#### Scenario: Mutation is attempted on the public route
- **WHEN** a caller sends POST, PUT, PATCH, or DELETE to a public content collection or detail route
- **THEN** no mutation handler SHALL exist and no content SHALL change

### Requirement: Validated pagination and deterministic ordering
Collection endpoints SHALL accept `page` and `pageSize` as positive integers, default them to 1 and 12, and reject page sizes above 50. Product lists SHALL accept an optional strict boolean `featured` filter. Collections SHALL return page, page size, total item count, and total page count. Content SHALL have deterministic ordering: display order ascending then publication time descending, except articles which SHALL order by publication time descending then display order ascending.

#### Scenario: Collection is requested without pagination
- **WHEN** a caller omits page and page size
- **THEN** the API SHALL return the first 12 eligible records and accurate page information in deterministic order

#### Scenario: Invalid query is supplied
- **WHEN** page is zero, page size exceeds 50, featured is not a boolean, or an unknown query parameter is supplied
- **THEN** the API SHALL return HTTP 400 and MUST NOT run an unbounded public query

### Requirement: Safe public content DTOs
Public responses SHALL be explicit model-specific DTOs containing only approved presentation fields, normalized images/specifications, SEO fields, relationships needed for display, and publication time. They MUST omit lifecycle status, internal database timestamps, authoring metadata, future private fields, and raw malformed JSON. They MUST NOT contain cart, payment, live inventory, automatic pricing, unverified price, delivery promise, capacity, or certificate fields.

#### Scenario: Published product is returned
- **WHEN** a publicly eligible product is requested by slug
- **THEN** the response SHALL contain its public identity, content, optional eligible category summary, normalized images/specifications, SEO fields, featured flag, and publication time without exposing lifecycle or authoring fields

#### Scenario: Stored presentation JSON is malformed
- **WHEN** a publicly eligible record contains a presentation value outside the approved public shape
- **THEN** the mapper SHALL omit or normalize that value and MUST NOT forward the raw JSON object

### Requirement: Empty and not-found behavior
An eligible collection with no records SHALL return HTTP 200 with an empty items array and zeroed pagination totals. An unavailable detail SHALL return HTTP 404 with the standard API error contract; database or internal error details MUST NOT be included in the response.

#### Scenario: No content has been published
- **WHEN** any supported public collection endpoint is requested against an empty or fully unpublished database
- **THEN** it SHALL return an empty successful collection rather than fake content or a server error

#### Scenario: Unknown slug is requested
- **WHEN** a caller requests an unknown eligible detail slug
- **THEN** the API SHALL return HTTP 404 without SQL, connection, stack, or hidden lifecycle information
