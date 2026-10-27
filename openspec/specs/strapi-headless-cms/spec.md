# strapi-headless-cms Specification

## Purpose
TBD - created by archiving change integrate-strapi-articles-cms. Update Purpose after archive.
## Requirements
### Requirement: Standalone Strapi instance and isolated persistence
The CMS SHALL operate as a standalone service under `cms/` connecting to a dedicated PostgreSQL database (`toranj_strapi`). It SHALL NOT share database schemas, tables, or ORM migrations with the NestJS application.

#### Scenario: Strapi initializes its isolated database
- **WHEN** Strapi service boots in local or staging environments
- **THEN** it SHALL execute migrations exclusively within `toranj_strapi` without modifying tables in the `toranj` application database

### Requirement: Article, Category, and Tag content models
Strapi SHALL provide schemas for `Article`, `Category`, and `Tag`. `Article` SHALL include title, slug, summary, full body, featured image, category relation (Many-to-One), tag relations (Many-to-Many), and SEO component (metaTitle, metaDescription, canonicalURL).

#### Scenario: Editor creates and publishes an article
- **WHEN** staff authors an article, associates a category and tags, uploads a featured image, and triggers publish
- **THEN** Strapi SHALL assign a publication timestamp, validate required fields, and expose the entry through its Content API

### Requirement: Public API token and draft isolation
Strapi Content API SHALL enforce read permissions such that draft, unpublished, or archived articles are NEVER accessible to public requests or standard API tokens.

#### Scenario: Anonymous or public API token requests draft article
- **WHEN** an HTTP request queries an article that has not been published or has been unpublished
- **THEN** Strapi Content API SHALL return HTTP 404 and SHALL NOT disclose draft titles, contents, or metadata

### Requirement: Publishing webhook notification
Strapi SHALL emit signed or authenticated webhook notifications upon article publish, unpublish, update, and delete events containing the affected slug and category.

#### Scenario: Article is published or modified
- **WHEN** an editor publishes or updates an article entry
- **THEN** Strapi SHALL dispatch an HTTP POST request to the configured frontend revalidation endpoint with the secret header

### Requirement: Production secret enforcement and fail-fast validation
The Strapi CMS application SHALL validate on boot that in `NODE_ENV=production`, all required security keys (`APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, `DATABASE_PASSWORD`) are explicitly provided and do not match hardcoded development placeholder values. If any required secret is missing or insecure, the process SHALL terminate immediately with a clear error without leaking sensitive values.

#### Scenario: Production boot with missing secret
- **WHEN** the Strapi service starts in `NODE_ENV=production` and `ADMIN_JWT_SECRET` is unset or matches development default
- **THEN** the application SHALL throw an error and exit immediately, refusing to listen for requests

#### Scenario: Production boot with valid secrets
- **WHEN** the Strapi service starts in `NODE_ENV=production` with valid, non-default cryptographic secrets provided via environment
- **THEN** the application SHALL boot successfully and serve authorized requests

### Requirement: Frontend client resilience and timeout handling
The Next.js Strapi client SHALL configure an explicit timeout on all HTTP requests to the Strapi service. In the event of network disruption or CMS unresponsiveness exceeding the timeout, the client SHALL gracefully handle the abort and return an appropriate fallback or error rather than blocking rendering indefinitely.

#### Scenario: Strapi upstream request exceeds timeout threshold
- **WHEN** Next.js queries the Strapi Content API and the upstream connection does not respond within the configured timeout limit (default 5000ms)
- **THEN** the request SHALL be aborted and the client SHALL throw a `StrapiContentError` without blocking server rendering indefinitely

### Requirement: Strict revalidation payload validation
The revalidation endpoint (`/api/revalidate`) SHALL enforce strict validation on incoming entry payloads, specifically asserting that article slugs match a strict kebab-case alphanumeric pattern (`^[a-z0-9]+(?:-[a-z0-9]+)*$`). Any request carrying invalid characters or directory traversal sequences SHALL be rejected with HTTP 400.

#### Scenario: Revalidation request with invalid slug characters
- **WHEN** a webhook or HTTP request calls `/api/revalidate` with a slug containing invalid characters (such as `../` or special punctuation)
- **THEN** the endpoint SHALL return HTTP 400 Bad Request and SHALL NOT invoke `revalidatePath` with the unsanitized input

#### Scenario: Revalidation request with valid slug
- **WHEN** an authenticated webhook call contains a valid slug matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- **THEN** the endpoint SHALL revalidate the corresponding article path and return HTTP 200

### Requirement: Verified database and media backup/restore capability
The Strapi operational procedures SHALL provide a tested and reproducible method to export and restore the `toranj_strapi` database schema and media uploads. Restore operations SHALL be verified against a temporary test database to confirm data integrity before production adoption.

#### Scenario: Restore verification on test database
- **WHEN** a database dump of `toranj_strapi` is restored onto a clean test database
- **THEN** all Strapi tables, relations, and published article entries SHALL be intact and queryable

