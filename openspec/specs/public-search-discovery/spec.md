# public-search-discovery Specification

## Purpose
TBD - created by archiving change improve-catalog-seo-and-media. Update Purpose after archive.
## Requirements
### Requirement: Route-aware public indexing
The application SHALL mark approved home, collection, detail, article, and approved managed-content pages indexable and followable, while authentication, admin, account, inquiry, error, not-found, draft, unpublished, and placeholder routes MUST remain `noindex`.

#### Scenario: Approved product detail is rendered
- **WHEN** an effectively published product detail page renders
- **THEN** the document SHALL allow indexing and following and SHALL expose a canonical URL for that product slug

#### Scenario: Private page is rendered
- **WHEN** an authentication, account, inquiry, or admin page renders
- **THEN** the document SHALL specify `noindex` regardless of authentication state

### Requirement: Descriptive social and canonical metadata
Every approved indexable route SHALL provide a unique Persian title, useful description, canonical path, and Open Graph metadata. Product details with an approved catalog image SHALL use that image for social preview metadata.

#### Scenario: Catalog product metadata is inspected
- **WHEN** a crawler requests a published catalog product
- **THEN** its title, description, canonical URL, Open Graph type, and approved image SHALL describe that exact product without price, stock, delivery, or capacity claims

### Requirement: Crawl discovery endpoints
The application SHALL expose `robots.txt` and `sitemap.xml`. Robots rules SHALL permit approved public content and disallow private or non-public route families. The sitemap SHALL include stable public collections and effectively published detail routes, and MUST NOT include private, placeholder, missing, or unpublished URLs.

#### Scenario: Sitemap is requested while content API is available
- **WHEN** published product and article records exist
- **THEN** the sitemap SHALL include their canonical detail URLs and publication timestamps alongside stable public routes

#### Scenario: Sitemap content lookup fails
- **WHEN** the content API is unavailable during sitemap generation
- **THEN** the sitemap SHALL still return stable approved public routes and SHALL omit unknown detail URLs

### Requirement: Safe product structured data
Published product pages SHALL emit schema.org Product structured data containing only approved identity and presentation fields. Structured data MUST omit offers, price, availability, ratings, reviews, certificates, capacity, and delivery promises unless a future approved specification adds them.

#### Scenario: Product JSON-LD is parsed
- **WHEN** a published catalog product page is rendered
- **THEN** one valid Product object SHALL identify its name, description, canonical URL, brand, optional category, and approved images without ecommerce properties

