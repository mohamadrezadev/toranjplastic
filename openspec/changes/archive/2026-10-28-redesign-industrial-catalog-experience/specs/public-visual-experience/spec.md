## MODIFIED Requirements

### Requirement: Consistent public visual language
The public header, footer, collection pages, detail pages, and feedback states SHALL share a coherent, distinctive responsive visual hierarchy and preserve all API-sourced titles, summaries, images, and metadata without fabricating content. Public catalog landing pages for products, injection molding services, and raw materials SHALL compose semantic copy, operable actions, and bounded supporting campaign media within a structured landing hero. Collection cards and detail surfaces SHALL use predictable natural sizing, engineered specification badges, and technical spec-sheet formatting without creating artificial empty card regions or unverified ecommerce claims.

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
- **THEN** the specifications section SHALL render technical parameters in an engineered tabular format with monospaced LTR formatting for units, accompanied by an explicit B2B engineering consultation and quotation reassurance box linked to the relevant inquiry route
