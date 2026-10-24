## MODIFIED Requirements

### Requirement: Useful public home page
The home page SHALL present Toranj Plastic as a product, injection-service, and material inquiry platform, with the approved wide campaign artwork and clear, semantic, keyboard-operable links to products and inquiry. It MUST NOT display engineering status, fabricated products, prices, inventory, contact details, certifications, capacity, or delivery promises.

#### Scenario: Visitor opens the home page
- **WHEN** the home page loads
- **THEN** the visitor SHALL see the approved Toranj Plastic campaign artwork and operable paths to products and inquiry without unapproved business claims

#### Scenario: Banner text is rasterized
- **WHEN** the supplied home artwork contains rendered headings or button labels
- **THEN** the page SHALL retain a semantic heading and real focusable links so the artwork is not the only source of meaning or interaction

### Requirement: Consistent public visual language
The public header, footer, collection pages, detail pages, and feedback states SHALL share a coherent, distinctive responsive visual hierarchy and preserve all API-sourced titles, summaries, images, and metadata without fabricating content. The products, injection-services, materials, and contact entry pages SHALL use their matching approved campaign artwork without replacing API-sourced content or honest feedback states.

#### Scenario: Public collection has no published items
- **WHEN** a collection responds with no items
- **THEN** the page SHALL display its matching campaign artwork and use the shared visual language to present the existing honest empty state, and MUST NOT substitute sample items

#### Scenario: Visitor activates an entry-page banner
- **WHEN** the visitor activates a products, injection-services, materials, or contact campaign banner
- **THEN** the browser SHALL navigate to the banner's declared in-page content target or approved inquiry destination

### Requirement: Responsive and accessible public pages
Public pages and campaign artwork SHALL remain Persian RTL, keyboard operable, readable in light and dark themes, and free of unintended horizontal scrolling at widths 360, 390, 768, and 1280 pixels. Campaign images MUST preserve their intrinsic aspect ratio and MUST NOT clip embedded brand text or button artwork.

#### Scenario: Visitor uses a required viewport
- **WHEN** the home or catalog is opened in either theme at a required width
- **THEN** navigation, headings, cards, links, campaign artwork, and feedback SHALL remain legible and usable without overlap, clipping, distortion, or horizontal page scrolling

#### Scenario: Keyboard focus reaches a campaign action
- **WHEN** a visitor tabs to an interactive campaign banner or home action
- **THEN** the action SHALL expose a visible focus treatment and an accessible Persian name
