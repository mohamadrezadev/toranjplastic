## MODIFIED Requirements

### Requirement: Semantic token registry
The frontend SHALL expose color, typography, spacing, radius, control-size, border, elevation, and motion values through semantic design tokens rather than component-local business colors or arbitrary numeric values. Every supported light or dark theme SHALL preserve stable semantic token roles and accessible interaction contrast. The approved visual direction SHALL use a petroleum-and-stone corporate-minimal palette with separate foreground and background roles for actions and danger states. Brand action MUST NOT default to orange, danger, warning, or a business-area accent. Shared components SHALL consume semantic tokens without hardcoded theme-specific brand colors. The product MUST NOT introduce cart, checkout, automatic pricing, or live inventory controls.

#### Scenario: Component consumes a visual value
- **WHEN** a shared component needs a color, spacing, radius, control size, typography, elevation, or focus style in either theme
- **THEN** it SHALL use an appropriate semantic token from the design-system registry instead of defining an unrelated hard-coded or theme-specific component value

#### Scenario: Business accent and status are displayed together
- **WHEN** a component appears inside the industrial or kitchen product area and also communicates success, warning, information, or error in either theme
- **THEN** it SHALL use the business accent only for section identity and a separate status token plus text or icon for the status meaning

#### Scenario: Corporate primary action is displayed in Light theme
- **WHEN** a shared surface presents its primary valid action in Light theme
- **THEN** it SHALL use the petroleum action background and a readable light foreground through the dedicated on-action token, including hover, focus, loading, and disabled states

#### Scenario: Corporate primary action is displayed in Dark theme
- **WHEN** a shared surface presents its primary valid action in Dark theme
- **THEN** it SHALL use the approved lighter petroleum action background and a readable dark foreground through the dedicated on-action token, including hover, focus, loading, and disabled states

#### Scenario: Theme changes on a shared surface
- **WHEN** the effective theme switches between light and dark on a public, auth, customer, inquiry, or admin surface
- **THEN** shared components SHALL retain semantic hierarchy, visible focus, readable text, and distinguishable interactive and status states without changing component APIs or security behavior

### Requirement: Delivered Persian typography
The frontend SHALL bundle and load `Vazirmatn Variable` as the primary Persian UI typeface from a versioned local application dependency and SHALL reference that delivered family through semantic typography tokens with safe local fallbacks. The logo's Latin wordmark MAY continue using its separately bundled Poppins family. The application MUST NOT depend on an undeclared local font or runtime third-party font request for its intended Persian presentation.

#### Scenario: Persian route is displayed
- **WHEN** a browser opens a Persian public, auth, customer, inquiry, or admin screen
- **THEN** headings, body, inputs, and buttons SHALL prefer the bundled `Vazirmatn Variable` family and retain RTL reading order

#### Scenario: Bundled font cannot be applied
- **WHEN** the preferred font asset fails to load
- **THEN** the application SHALL fall back to the declared system stack without hiding content, breaking RTL order, or causing page-level horizontal overflow at 360, 390, 768, or 1280 pixels

### Requirement: Corporate-minimal visual hierarchy
The shared design system SHALL communicate hierarchy primarily through typography, spacing, alignment, borders, restrained surface contrast, and approved original product imagery. Shadows, saturated fills, large radii, decorative shapes, and raster-only call-to-action artwork MUST be limited to cases where they clarify grouping, interaction, or state. A surface requiring imagery MUST use approved repository or CMS assets, or a factual text-first fallback when no approved image exists; it MUST NOT fabricate a product, production facility, machine, capacity, or certified industrial capability.

#### Scenario: Shared card or navigation surface is rendered
- **WHEN** a card, header, footer, field, feedback surface, or provisional page uses the design system
- **THEN** its presentation SHALL preserve a quiet petroleum-and-stone corporate hierarchy without unnecessary decoration or component-local brand colors

#### Scenario: Product or service preview requires imagery
- **WHEN** a public card or hero requires an image
- **THEN** it SHALL use an approved `/catalog/*.webp` or CMS asset with meaningful alternative text, or a factual text-first fallback when such an asset is unavailable

#### Scenario: Interface is viewed at a required width
- **WHEN** the corporate-minimal interface is rendered at 360, 390, 768, or 1280 pixels in Light or Dark theme
- **THEN** typography and spacing SHALL remain readable, interactive targets SHALL remain usable, and no visual refinement SHALL introduce clipping or unintended horizontal scrolling
