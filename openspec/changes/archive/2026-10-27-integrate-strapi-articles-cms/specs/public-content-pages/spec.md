## ADDED Requirements

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
