## ADDED Requirements

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
