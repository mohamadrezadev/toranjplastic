# strapi-headless-cms Specification

## Purpose
Provides a dedicated headless CMS instance (Strapi v5) isolated from core business logic for managing editorial articles, categories, tags, persistent media, and publishing lifecycle notifications.

## ADDED Requirements

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
