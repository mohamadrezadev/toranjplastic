# public-visual-experience Specification

## Purpose
TBD - created by archiving change redesign-public-and-auth-experience. Update Purpose after archive.
## Requirements
### Requirement: Useful public home page
The home page SHALL present Toranj Plastic as a product, injection-service, and material inquiry platform, with the approved wide campaign artwork, core manufacturing capabilities, latest published technical articles from Strapi CMS, and clear, semantic, keyboard-operable links to products and inquiry. It MUST NOT display engineering status, fabricated products, prices, inventory, contact details, certifications, capacity, or delivery promises.

#### Scenario: Visitor opens the home page
- **WHEN** the home page loads
- **THEN** the visitor SHALL see the approved Toranj Plastic campaign artwork and operable paths to products and inquiry without unapproved business claims

#### Scenario: Banner text is rasterized
- **WHEN** the supplied home artwork contains rendered headings or button labels
- **THEN** the page SHALL retain a semantic heading and real focusable links so the artwork is not the only source of meaning or interaction

#### Scenario: Latest articles available in CMS
- **WHEN** Strapi CMS returns published articles
- **THEN** the home page SHALL render up to 3 latest published article cards showing approved title, summary, publication date, and link to the article detail, along with a link to the full articles catalog

#### Scenario: CMS is unreachable or returns no articles
- **WHEN** Strapi CMS is unreachable, times out, or returns an empty article list
- **THEN** the home page SHALL render cleanly without crashing or displaying errors, presenting an honest fallback or omitting empty article cards without fabricating mock articles

#### Scenario: B2B inquiry fast-track workflow
- **WHEN** the visitor navigates the home page
- **THEN** the page SHALL display the multi-step inquiry workflow (specifications submission, engineering review, formal quotation) with an accessible action directing the visitor to `/inquiry`

### Requirement: Consistent public visual language
The public header, footer, collection pages, detail pages, and feedback states SHALL share a coherent, distinctive responsive visual hierarchy and preserve all API-sourced titles, summaries, images, and metadata without fabricating content. Public catalog landing pages for products, injection molding services, and raw materials SHALL compose semantic copy, operable actions, and bounded supporting campaign media within a structured landing hero. Collection cards and detail surfaces SHALL use predictable natural sizing, engineered specification badges, and technical spec-sheet formatting without creating artificial empty card regions or unverified ecommerce claims. Reassurance cards on detail pages SHALL strictly align with the domain offering: manufactured products focus on batch production, coloration, and quotation; injection services focus on CAD/mold inspection; materials focus on polymer datasheets.

#### Scenario: Public collection has one published item
- **WHEN** a public catalog responds with one published item
- **THEN** the page SHALL show a composed landing hero followed by one compact featured card that uses the available collection width without stretching the card body or leaving empty grid tracks

#### Scenario: Public collection has no published items
- **WHEN** a collection responds with no items
- **THEN** the page SHALL preserve the composed landing hierarchy and use the shared visual language to present the existing honest empty state, and MUST NOT substitute sample items

#### Scenario: Visitor opens a product detail
- **WHEN** a published product detail loads
- **THEN** its verified media, title, category, featured state, summary, description, specifications, gallery, and inquiry action SHALL appear in a clear catalog hierarchy without price or inventory claims

#### Scenario: Visitor activates an entry-page banner
- **WHEN** the visitor activates a products, injection-services, materials, or contact campaign banner
- **THEN** the browser SHALL navigate to the banner's declared in-page content target or approved inquiry destination

#### Scenario: Industrial catalog landing hero presentation
- **WHEN** a visitor loads the products, injection-molding, or materials catalog landing page
- **THEN** each page SHALL present a structured hero section featuring semantic Persian headings, clear value description, dedicated campaign visual, and direct dual actions for exploring the collection and submitting a technical inquiry

#### Scenario: Technical specification and fast-track reassurance presentation
- **WHEN** a visitor views any catalog item detail page
- **THEN** the specifications section SHALL render technical parameters in an engineered tabular format with monospaced LTR formatting for units, accompanied by a domain-accurate B2B fast-track reassurance card (distinguishing factory-manufactured goods from client mold services) linked to the relevant inquiry route

### Requirement: Responsive and accessible public pages
Public pages and campaign media SHALL remain Persian RTL, keyboard operable, readable in light and dark themes, and free of unintended horizontal scrolling at widths 360, 390, 768, and 1280 pixels. Campaign media MUST remain bounded inside its landing composition, and card and detail content MUST wrap without overlap, distortion, or artificial viewport-height gaps.

#### Scenario: Visitor uses a required viewport
- **WHEN** the product landing, list, or detail page is opened in either theme at a required width
- **THEN** the landing content, media, cards, metadata, inquiry actions, specifications, and feedback SHALL remain legible and usable without overlap, clipping, distortion, repeated campaign dominance, excessive empty card height, unused sparse grid tracks, or horizontal page scrolling

#### Scenario: Visitor navigates the catalog with a keyboard
- **WHEN** focus reaches landing, card, pagination, or inquiry actions
- **THEN** every action SHALL expose a visible focus treatment and an accessible Persian name

#### Scenario: Keyboard focus reaches a campaign action
- **WHEN** a visitor tabs to an interactive campaign banner or home action
- **THEN** the action SHALL expose a visible focus treatment and an accessible Persian name

### Requirement: Semantic and non-repeating home campaign
The public home page SHALL render its Persian heading, description, and product and inquiry actions as semantic HTML that is the only visible source of campaign copy and interaction at widths 360, 390, 768, and 1280 pixels. Supporting artwork MUST NOT cause rasterized headings or button labels to repeat, dominate, or replace the semantic content.

#### Scenario: Visitor opens the home campaign on mobile
- **WHEN** the home page is rendered at 360 or 390 pixels
- **THEN** the visitor SHALL see one campaign heading, one description, and one operable set of product and inquiry actions without repeated rasterized campaign copy

#### Scenario: Visitor uses campaign actions with a keyboard
- **WHEN** keyboard focus reaches either campaign action at any required viewport
- **THEN** the action SHALL expose a visible focus treatment, an accessible Persian name, and the approved destination

### Requirement: Adaptive public-home content composition
The public home page SHALL use a continuous one-, two-, and three-column responsive composition appropriate to available width. Capability cards, article cards, media, and the closing action SHALL retain natural height and balanced proximity without unused sparse tracks, excessive card stretching, or a one-pixel breakpoint causing a disproportionate layout jump.

#### Scenario: Visitor opens the home page on a tablet
- **WHEN** the viewport is 768 pixels wide
- **THEN** capability cards SHALL use the tablet composition rather than oversized single-column cards and SHALL remain readable without horizontal scrolling

#### Scenario: Viewport crosses a responsive breakpoint
- **WHEN** the same page is measured immediately below and above a layout breakpoint
- **THEN** card count, width, and document height SHALL transition to the adjacent composition without jumping directly from one oversized column to three compressed columns

#### Scenario: Latest articles contain one or two items
- **WHEN** the home page receives fewer than three published articles
- **THEN** the article cards SHALL use balanced available width without rendering obvious empty grid tracks or fabricating filler content

### Requirement: Theme-integrated public media composition
Public home artwork and card media SHALL render inside bounded, theme-aware surfaces with stable aspect ratios. The interface MUST NOT recolor verified product media, and semantic copy and actions SHALL remain usable before lazy media finishes loading.

#### Scenario: Bright media is rendered in dark theme
- **WHEN** an image with a bright background is shown in a dark-theme card
- **THEN** the image SHALL appear inside an intentional bounded media surface without visually breaking the card or changing the verified image colors

#### Scenario: Card image is not yet loaded
- **WHEN** lazy media is pending or unavailable
- **THEN** the card SHALL retain a stable footprint and its title, description, and action SHALL remain readable and operable

