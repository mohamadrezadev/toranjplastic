## ADDED Requirements

### Requirement: Continuous public-shell responsive transitions
The public shell and public-home composition SHALL use an explicit tablet layout between narrow mobile and wide desktop presentations. At 360, 390, 768, and 1280 pixels and immediately adjacent to layout breakpoints, the shell MUST preserve Persian RTL reading order, touch targets, card proportions, and page width without abrupt one-column-to-three-column transitions.

#### Scenario: Shell is rendered at the tablet width
- **WHEN** the viewport is 768 pixels wide
- **THEN** the header, main content, card grids, feedback surfaces, and footer SHALL use a proportionate tablet composition without oversized media or unintended horizontal scrolling

#### Scenario: Shell is rendered next to a breakpoint
- **WHEN** an automated check renders the page one pixel below and one pixel above a responsive breakpoint
- **THEN** neither render SHALL introduce clipping, overlap, page-level horizontal scrolling, or a disproportionate jump in card height and document length

### Requirement: Compact and accessible mobile footer
At mobile widths the public footer SHALL keep approved brand and primary contact information directly visible while presenting lower-priority navigation groups in compact semantic disclosures. Footer content MUST remain available without fabricated values, JavaScript-only access, or loss of keyboard operability.

#### Scenario: Visitor scans the footer on mobile
- **WHEN** the public footer is rendered at 360 or 390 pixels
- **THEN** brand and approved primary contact information SHALL appear before compact navigation groups and legal links without a four-column stack being reproduced as four permanently expanded long sections

#### Scenario: Keyboard user expands a footer group
- **WHEN** focus reaches a collapsed footer navigation summary and the user activates it
- **THEN** the group SHALL expose its expanded state and reveal valid links in Persian RTL order while preserving local LTR formatting for phone, email, URL, or identifiers

#### Scenario: JavaScript is unavailable
- **WHEN** the public footer renders without client-side JavaScript
- **THEN** essential approved contact and legal information SHALL remain readable and navigation content SHALL remain reachable through native semantic behavior
