## Purpose

Define semantic design tokens and reusable, accessible UI primitives for the Toranj frontend.
## Requirements
### Requirement: Semantic token registry
The frontend SHALL expose color, typography, spacing, radius, control-size, border, elevation, and motion values through semantic design tokens rather than component-local business colors or arbitrary numeric values. Every supported light or dark theme SHALL preserve stable semantic token roles and accessible interaction contrast. The approved visual direction SHALL use a petroleum-and-stone corporate-minimal palette with separate foreground and background roles for actions and danger states. Brand action MUST NOT default to orange, danger, warning, or a business-area accent. Shared components SHALL consume semantic tokens without hardcoded theme-specific brand colors. The product MUST NOT introduce cart, checkout, automatic pricing, or live inventory controls.

#### Scenario: Component consumes a visual value
- **WHEN** a shared component needs a color, spacing, radius, control size, typography, elevation, or focus style in either theme
- **THEN** it SHALL use an appropriate semantic token from the design-system registry instead of defining an unrelated hard-coded or theme-specific component value

#### Scenario: Business accent and status are displayed together
- **WHEN** a component appears inside the industrial or kitchen product area and also communicates success, warning, information, or error in either theme
- **THEN** it SHALL use the business accent only for section identity and a separate status token plus text or icon for the status meaning

#### Scenario: Corporate primary action is displayed
- **WHEN** a shared public surface presents its primary valid action in light or dark theme
- **THEN** it SHALL use the corporate interactive accent and MUST NOT reuse warning, danger, or section-identity colors as the global action meaning

#### Scenario: Corporate primary action is displayed in Light theme
- **WHEN** a shared surface presents its primary valid action in Light theme
- **THEN** it SHALL use the petroleum action background and a readable light foreground through the dedicated on-action token, including hover, focus, loading, and disabled states

#### Scenario: Corporate primary action is displayed in Dark theme
- **WHEN** a shared surface presents its primary valid action in Dark theme
- **THEN** it SHALL use the approved lighter petroleum action background and a readable dark foreground through the dedicated on-action token, including hover, focus, loading, and disabled states

#### Scenario: Theme changes on a shared surface
- **WHEN** the effective theme switches between light and dark on a public, auth, customer, inquiry, or admin surface
- **THEN** shared components SHALL retain semantic hierarchy, visible focus, readable text, and distinguishable interactive and status states without changing component APIs or security behavior

#### Scenario: A brand asset is not yet a confirmed official vector
- **WHEN** a logo, favicon, or icon asset originates from a reconstruction rather than a file confirmed as the brand owner's official vector source
- **THEN** its provenance and reconstruction status SHALL be documented in the repository and the asset MUST NOT be presented as a certified or legally confirmed trademark file

### Requirement: Layered component architecture
The frontend SHALL organize reusable UI into the layers `tokens`, `primitives`, `domain-components`, and `screens`, and primitives MUST NOT contain product-specific business rules or API access.

#### Scenario: New shared control is introduced
- **WHEN** a developer adds a reusable button, field, selection control, or feedback surface
- **THEN** the control SHALL live in the primitive layer and receive content and behavior through typed properties

### Requirement: Accessible button primitive
The design system SHALL provide button variants for primary, secondary, ghost, and danger actions with normal, hover, focus, loading, and disabled states. A primary mobile control SHALL provide a minimum interactive target of 44 by 44 pixels.

#### Scenario: User activates an enabled button
- **WHEN** a user activates an enabled button with pointer, Enter, or Space
- **THEN** the button SHALL invoke its action once and expose an accessible name

#### Scenario: Button is loading
- **WHEN** an action is in progress
- **THEN** the button SHALL communicate loading to assistive technology, prevent duplicate activation, retain a stable size, and preserve understandable action text

#### Scenario: Button is disabled
- **WHEN** an action is unavailable
- **THEN** the button SHALL use native disabled behavior where applicable and MUST NOT invoke the action

### Requirement: Accessible form-control primitives
The design system SHALL provide typed Input, Textarea, Select, Checkbox, Radio, and Switch primitives with visible label, optional help text, required state, error state, read-only state where meaningful, and disabled state.

#### Scenario: Field validation fails
- **WHEN** a form-control value is invalid
- **THEN** the field SHALL associate a concise Persian error message with the control, expose invalid state to assistive technology, and MUST NOT rely on placeholder text or color alone

#### Scenario: Field has help and error text
- **WHEN** both help and validation error content exist
- **THEN** the control SHALL expose both relationships programmatically while the error remains visually distinguishable

### Requirement: RTL and directional-data behavior
Shared components SHALL inherit Persian right-to-left layout by default. Phone numbers, emails, URLs, tracking codes, quotation numbers, and technical identifiers SHALL render in isolated left-to-right containers without changing the surrounding reading order.

#### Scenario: Technical identifier appears in Persian content
- **WHEN** an LTR identifier is rendered inside an RTL component
- **THEN** only the identifier container SHALL use left-to-right direction with bidi isolation

### Requirement: Keyboard, focus, and motion accessibility
Every interactive primitive SHALL be reachable in a logical keyboard order, display a visible focus indicator, and respect the user's reduced-motion preference. Focus and state meaning MUST NOT be communicated by color alone.

#### Scenario: Keyboard user traverses controls
- **WHEN** the user presses Tab or Shift+Tab through a component example
- **THEN** focus SHALL move in the expected RTL interaction order without entering hidden or disabled controls

#### Scenario: Reduced motion is requested
- **WHEN** the operating system reports `prefers-reduced-motion: reduce`
- **THEN** non-essential transitions and animations SHALL be removed or reduced without hiding state changes

### Requirement: No ecommerce primitive in version one
The design-system foundation MUST NOT introduce cart, checkout, online-payment, live-inventory, or automatic-pricing controls as reusable product actions.

#### Scenario: Product card action is composed
- **WHEN** a product-related component requires a primary action in version one
- **THEN** the action SHALL lead to information or inquiry behavior and MUST NOT imply immediate purchase, confirmed inventory, or automatic price calculation

### Requirement: Delivered Persian typography
The frontend SHALL bundle and load `Vazirmatn Variable` as the primary Persian UI typeface from a versioned local application dependency and SHALL reference that delivered family through semantic typography tokens with safe local fallbacks. The logo's Latin wordmark MAY continue using its separately bundled Poppins family. The application MUST NOT depend on an undeclared local font or runtime third-party font request for its intended Persian presentation.

#### Scenario: Public page renders Persian content
- **WHEN** a browser loads the public application
- **THEN** the computed body font family SHALL prefer the bundled Persian typeface and Persian headings, controls, and body text SHALL inherit it consistently

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

