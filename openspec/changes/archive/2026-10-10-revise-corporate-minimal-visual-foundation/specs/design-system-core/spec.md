## MODIFIED Requirements

### Requirement: Semantic token registry
The frontend SHALL expose color, typography, spacing, radius, control-size, border, elevation, and motion values through semantic design tokens rather than component-local business colors or arbitrary numeric values. The active visual direction SHALL use a restrained corporate-minimal palette with neutral surfaces, deep navy hierarchy, and a controlled blue interactive accent. Brand assets SHALL remain marked provisional until product approval, and business-area accents MUST remain separate from brand-action and status colors.

#### Scenario: Component consumes a visual value
- **WHEN** a shared component needs a color, spacing, radius, control size, typography, elevation, or focus style
- **THEN** it SHALL use an appropriate semantic token from the design-system registry instead of defining an unrelated hard-coded value

#### Scenario: Business accent and status are displayed together
- **WHEN** a component appears inside the industrial or kitchen product area and also communicates success, warning, information, or error
- **THEN** it SHALL use the business accent only for section identity and a separate status token plus text or icon for the status meaning

#### Scenario: Corporate primary action is displayed
- **WHEN** a shared public surface presents its primary valid action
- **THEN** it SHALL use the corporate interactive accent and MUST NOT reuse warning, danger, or section-identity colors as the global action meaning

## ADDED Requirements

### Requirement: Delivered Persian typography
The frontend SHALL bundle and load the selected Persian UI typeface as a version-controlled application dependency and SHALL reference that delivered family through the semantic typography tokens with safe local fallbacks. The application MUST NOT depend on an undeclared local font or runtime third-party font request for its intended Persian presentation.

#### Scenario: Public page renders Persian content
- **WHEN** a browser loads the public application
- **THEN** the computed body font family SHALL prefer the bundled Persian typeface and Persian headings, controls, and body text SHALL inherit it consistently

#### Scenario: Bundled font cannot be applied
- **WHEN** the preferred font fails to load in a client environment
- **THEN** the application SHALL fall back to the declared system stack without hiding content, breaking RTL order, or causing page-level horizontal overflow

### Requirement: Corporate-minimal visual hierarchy
The shared design system SHALL communicate hierarchy primarily through typography, spacing, alignment, borders, and restrained surface contrast. Shadows, saturated fills, large radii, and decorative shapes MUST be limited to cases where they clarify grouping, interaction, or state.

#### Scenario: Shared card or navigation surface is rendered
- **WHEN** a card, header, footer, field, feedback surface, or provisional page uses the design system
- **THEN** its presentation SHALL preserve a quiet corporate hierarchy without unnecessary decoration or component-local brand colors

#### Scenario: Interface is viewed at a required width
- **WHEN** the corporate-minimal interface is rendered at 360, 390, 768, or 1280 pixels
- **THEN** typography and spacing SHALL remain readable, interactive targets SHALL remain usable, and no visual refinement SHALL introduce clipping or unintended horizontal scrolling
