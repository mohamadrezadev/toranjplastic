## Purpose

Define the Persian RTL, provisional token, responsive-accessibility, and indexing foundation for the web application.

## Requirements

### Requirement: Persian RTL document foundation
The web application SHALL render its root document with Persian language metadata and right-to-left direction, while isolating phone numbers, email addresses, identifiers, codes, and URLs as left-to-right data.

#### Scenario: Render the foundation page
- **WHEN** a browser requests the root page
- **THEN** the document SHALL declare `lang="fa"` and `dir="rtl"` and the visible foundation content SHALL be Persian

### Requirement: Semantic provisional design tokens
The web application SHALL expose the Design System v2 colors, spacing, radius, typography, status, and section accents as semantic CSS custom properties and SHALL identify them as provisional until brand approval.

#### Scenario: Style a product section
- **WHEN** a frontend component needs a brand or status color
- **THEN** it SHALL consume the relevant semantic token instead of hard-coding business and status meaning into a generic component

### Requirement: Responsive accessible foundation
The phase-zero page SHALL remain usable without unintended horizontal scrolling at viewport widths 360, 390, 768, and 1280 pixels and SHALL provide visible keyboard focus and reduced-motion behavior.

#### Scenario: Use the page at a required viewport
- **WHEN** the page is rendered at any required test width
- **THEN** content SHALL fit the viewport, interactive targets SHALL remain operable, and the layout SHALL preserve RTL reading order

#### Scenario: Navigate by keyboard
- **WHEN** a user tabs to an interactive element
- **THEN** the element SHALL display a visible focus indicator that is not conveyed by color alone

### Requirement: Unapproved foundation content is not indexed
The phase-zero application shell SHALL instruct search engines not to index or follow its placeholder foundation page.

#### Scenario: Inspect root metadata before content approval
- **WHEN** the production content and identity have not been approved
- **THEN** the root metadata SHALL specify `noindex` and `nofollow`
