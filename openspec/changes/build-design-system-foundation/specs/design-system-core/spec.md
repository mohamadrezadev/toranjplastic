## ADDED Requirements

### Requirement: Semantic token registry
The frontend SHALL expose color, typography, spacing, radius, control-size, border, elevation, and motion values through semantic design tokens rather than component-local business colors or arbitrary numeric values. Brand tokens SHALL remain marked provisional until product approval, and business-area accents MUST remain separate from status colors.

#### Scenario: Component consumes a visual value
- **WHEN** a shared component needs a color, spacing, radius, control size, or focus style
- **THEN** it SHALL use an appropriate semantic token from the design-system registry instead of defining an unrelated hard-coded value

#### Scenario: Business accent and status are displayed together
- **WHEN** a component appears inside the industrial or kitchen product area and also communicates success, warning, information, or error
- **THEN** it SHALL use the business accent only for section identity and a separate status token plus text or icon for the status meaning

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
