## ADDED Requirements

### Requirement: Theme-aware public action and media hierarchy
In both light and dark themes, public campaign actions, card actions, media surfaces, placeholders, borders, and focus treatments SHALL preserve a clear semantic hierarchy. The primary action MUST remain visually distinguishable from secondary actions, and verified bitmap media MUST NOT be recolored to simulate theme compatibility.

#### Scenario: Public home is rendered in dark theme
- **WHEN** the home page is rendered in dark theme at 360, 390, 768, or 1280 pixels
- **THEN** primary and secondary actions, card links, placeholders, borders, and focus states SHALL remain readable and visually distinguishable on their surrounding surfaces

#### Scenario: Bright product artwork is shown in dark theme
- **WHEN** verified media includes a light or white bitmap background
- **THEN** the surrounding media container SHALL provide an intentional boundary and spacing while the bitmap colors remain unchanged

#### Scenario: Theme changes while public content is visible
- **WHEN** the user switches between light and dark themes with the home or public content page open
- **THEN** action hierarchy and media boundaries SHALL update from semantic tokens without layout shift, clipping, or loss of focus visibility
