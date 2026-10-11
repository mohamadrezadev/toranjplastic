# public-visual-experience Specification

## Purpose
TBD - created by archiving change redesign-public-and-auth-experience. Update Purpose after archive.
## Requirements
### Requirement: Useful public home page
The home page SHALL present Toranj Plastic as a product, injection-service, and material inquiry platform, with clear links to the three public catalogs. It MUST NOT display engineering status, fabricated products, prices, inventory, contact details, certifications, capacity, or delivery promises.

#### Scenario: Visitor opens the home page
- **WHEN** the home page loads
- **THEN** the visitor SHALL see a clear introduction and operable paths to products, injection services, and materials without unapproved business claims

### Requirement: Consistent public visual language
The public header, footer, collection pages, detail pages, and feedback states SHALL share a coherent, distinctive responsive visual hierarchy and preserve all API-sourced titles, summaries, images, and metadata without fabricating content.

#### Scenario: Public collection has no published items
- **WHEN** a collection responds with no items
- **THEN** the page SHALL use the shared visual language to present the existing honest empty state and MUST NOT substitute sample items

### Requirement: Responsive and accessible public pages
Public pages SHALL remain Persian RTL, keyboard operable, readable in light and dark themes, and free of unintended horizontal scrolling at widths 360, 390, 768, and 1280 pixels.

#### Scenario: Visitor uses a required viewport
- **WHEN** the home or catalog is opened in either theme at a required width
- **THEN** navigation, headings, cards, links, and feedback SHALL remain legible and usable without overlap or clipping

