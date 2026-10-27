# public-content-pages Specification

## Purpose
TBD - created by archiving change connect-public-content-pages. Update Purpose after archive.
## Requirements
### Requirement: Typed public content access
The frontend SHALL fetch content server-side only from the configured versioned public-content API and SHALL validate the response envelope before rendering. It MUST distinguish a successful empty collection, an unavailable or invalid upstream response, and an API not-found response, and MUST NOT replace any of them with invented content.

#### Scenario: Published collection is available
- **WHEN** the public API returns a valid successful collection
- **THEN** the page SHALL render only the returned approved presentation fields and pagination information

#### Scenario: Upstream response is invalid or unavailable
- **WHEN** the public API cannot be reached or returns an invalid or unsuccessful non-404 response
- **THEN** the route SHALL render its error boundary and MUST NOT present the failure as an empty catalog

### Requirement: Public catalog collections
The frontend SHALL provide Persian RTL collection pages for products, injection services, materials, and articles. Each collection SHALL provide a descriptive heading, responsive card layout, valid detail links, pagination when more than one page exists, and an explicit empty state when the API returns no records.

#### Scenario: Empty product collection is requested
- **WHEN** the products API returns HTTP 200 with an empty items array
- **THEN** the products page SHALL show an honest Persian empty state without fake products, prices, inventory, or technical claims

#### Scenario: Multi-page article collection is requested
- **WHEN** the articles API returns more than one page and the current query page is valid
- **THEN** the articles page SHALL expose keyboard-operable previous and next navigation with stable page URLs

### Requirement: Public content details
The frontend SHALL provide detail pages for products, injection services, materials, and articles using their stable public slugs. Detail pages SHALL render breadcrumbs and only present optional images, descriptions, specifications, category/family information, and approved calls to action when those values exist in the public DTO.

#### Scenario: Published product detail is requested
- **WHEN** the API returns a published product for the requested slug
- **THEN** the product page SHALL render its name, available approved content, product hierarchy breadcrumb, and inquiry path without implying online purchase or guaranteed availability

#### Scenario: Missing or unpublished detail is requested
- **WHEN** the public API returns not found for a detail slug
- **THEN** the frontend SHALL return the shared not-found experience without revealing whether the record is missing, draft, archived, future-dated, or otherwise hidden

### Requirement: Managed public pages
The frontend SHALL resolve about, contact, privacy, and terms routes from managed-page slugs and SHALL render their approved title, summary, body, and images as safe presentation content. It MUST NOT invent contact details, legal language, certifications, addresses, or company claims when managed content is absent.

#### Scenario: Managed contact page is absent
- **WHEN** the public API returns not found for the contact page
- **THEN** the route SHALL return the shared not-found experience and MUST NOT substitute unapproved phone, email, address, or social information

### Requirement: Loading, error, empty, and not-found feedback
Every connected content route SHALL provide distinct Persian loading, error, empty, and not-found behavior using the shared feedback system. Error recovery SHALL be keyboard operable, and feedback MUST remain understandable without relying on color alone.

#### Scenario: Content request is pending
- **WHEN** a route is waiting for runtime public content
- **THEN** its static shell SHALL immediately expose a Persian accessible loading state while content streams

#### Scenario: Content request fails after navigation
- **WHEN** a render-time public content request throws
- **THEN** the route error boundary SHALL explain the temporary failure and expose a retry action

### Requirement: Approved content metadata
Published detail and managed pages SHALL generate a title and description from approved API SEO fields, falling back only to the returned public title/name and summary. Unknown content and provisional/private destinations MUST remain non-indexable; metadata MUST NOT be treated as access control.

#### Scenario: Product has approved SEO fields
- **WHEN** a published product supplies a meta title and meta description
- **THEN** its document metadata SHALL use those approved values without adding unverified claims

### Requirement: Responsive themed presentation
Connected public pages SHALL preserve Persian RTL order, readable line lengths, usable touch targets, and no unintended horizontal page scrolling in light and dark themes at 360, 390, 768, and 1280 pixel widths. LTR identifiers and URLs SHALL use local directionality without changing the page direction.

#### Scenario: Content page is verified at a required viewport
- **WHEN** a collection or detail page is rendered in either theme at 360, 390, 768, or 1280 pixels
- **THEN** navigation, breadcrumbs, cards, feedback, images, content, and pagination SHALL fit without clipping, overlap, or unintended horizontal page scrolling

### Requirement: Phase boundary exclusions
Connected public pages MUST NOT expose cart, checkout, payment, confirmed live inventory, automatic injection pricing, guaranteed lead time, unverified capacity/certification, CMS mutation, preview, or private customer/admin data.

#### Scenario: Public catalog is rendered
- **WHEN** any connected collection or detail route is displayed
- **THEN** it SHALL contain no ecommerce completion action or unverified commercial or industrial commitment

### Requirement: Article categories and related articles
The frontend SHALL provide `/articles/category/[slug]` allowing visitors to browse published articles filtered by category, and SHALL render related published articles on article detail pages based on shared category or tags.

#### Scenario: Visitor browses articles by category
- **WHEN** a visitor navigates to `/articles/category/:slug`
- **THEN** the page SHALL render only published articles associated with that category, with Persian category breadcrumb, heading, cards, and pagination

#### Scenario: Visitor views related articles
- **WHEN** an article detail page is requested
- **THEN** it SHALL present up to three related published articles sharing the same category or tags, without linking to draft or unpublished entries

### Requirement: On-demand article cache revalidation
The frontend SHALL expose an authenticated `/api/revalidate` endpoint protected by a shared secret to invalidate cached article routes (`/articles`, `/articles/[slug]`, `/articles/category/[slug]`, and sitemap) immediately upon receiving a valid Strapi webhook event.

#### Scenario: Valid webhook revalidates article cache
- **WHEN** a POST request to `/api/revalidate` contains the verified secret and article event payload
- **THEN** the endpoint SHALL revalidate the affected paths and return HTTP 200

#### Scenario: Unauthorized webhook request is rejected
- **WHEN** a request to `/api/revalidate` lacks the secret or provides an invalid token
- **THEN** the endpoint SHALL return HTTP 401 and SHALL NOT trigger cache revalidation

