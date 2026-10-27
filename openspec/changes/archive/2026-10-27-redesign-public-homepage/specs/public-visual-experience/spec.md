## MODIFIED Requirements

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
