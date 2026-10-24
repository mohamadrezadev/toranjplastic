## ADDED Requirements

### Requirement: Unified private customer workspace
The frontend SHALL present account and inquiry routes within one Persian RTL customer-portal shell containing Toranj identity, account context, navigation to overview, owned requests, and new-request selection, plus a safe logout action. The shell MUST preserve private `noindex` and `no-store` behavior and MUST NOT expose privileged or internal account data.

#### Scenario: Authenticated customer navigates the workspace
- **WHEN** an active customer opens any account or inquiry route
- **THEN** the same portal shell SHALL identify the current account and provide keyboard-operable destinations without duplicating or losing route content

#### Scenario: Unauthenticated visitor opens a portal route
- **WHEN** a visitor without a valid session opens an account or inquiry route
- **THEN** the server SHALL redirect to login without rendering private shell content

### Requirement: Responsive RTL portal composition
The customer portal SHALL use mobile-first responsive composition at 360, 390, 768, and 1280 pixel widths. Content, navigation, cards, filters, fields, actions, and status history MUST preserve RTL reading order, readable labels, minimum touch targets, visible focus, and MUST NOT cause unintended horizontal page scrolling.

#### Scenario: Customer uses a narrow phone
- **WHEN** the portal is rendered at 360 or 390 pixels
- **THEN** navigation and actions SHALL remain reachable, form sections SHALL use a single readable column, and no control or content card SHALL overflow the viewport

#### Scenario: Customer uses tablet or desktop
- **WHEN** the portal is rendered at 768 or 1280 pixels
- **THEN** available width SHALL be used for structured multi-column content without breaking RTL order or producing excessively wide form fields

### Requirement: Structured inquiry forms
Each inquiry form SHALL organize approved inputs into titled semantic sections that separate request context, technical information, quantity/delivery information, and additional explanation as applicable to the selected request type. Required and optional controls SHALL remain accurately labeled, and submission, error, disabled, pending, and attachment-deferral states SHALL remain accessible.

#### Scenario: Customer scans a long technical form
- **WHEN** a customer opens an injection-service or material inquiry form
- **THEN** related controls SHALL appear in distinct fieldsets with legends and predictable keyboard order instead of one undifferentiated input grid

#### Scenario: Customer submits from a narrow viewport
- **WHEN** a customer completes and submits a valid form at 360 pixels
- **THEN** the primary action SHALL remain full-width and usable, pending state SHALL disable repeat submission, and validation feedback SHALL be associated with the form

### Requirement: Legible request tracking surfaces
The portal dashboard, owned-request list, and request detail SHALL use a consistent hierarchy for titles, calls to action, request type, current status, timestamps, submitted data, and status history. Status treatment SHALL use approved labels and design-system status tokens without implying an unapproved quotation, price, delivery promise, or inventory state.

#### Scenario: Customer views the request list
- **WHEN** owned requests exist
- **THEN** each list item SHALL expose its request identity, approved type/status label, and date as a clearly focusable responsive row or card

#### Scenario: Customer views request detail
- **WHEN** a customer opens an owned request
- **THEN** current status, submitted fields, and customer-visible history SHALL be visually distinct and readable without exposing internal fields

### Requirement: Current design-system token usage
Customer portal styles SHALL use the current Design System v2 token contract for surfaces, borders, text, actions, focus, and status feedback in both light and dark themes. Undefined legacy token names MUST NOT be used.

#### Scenario: Portal theme changes
- **WHEN** the active theme changes between light and dark
- **THEN** portal surfaces, controls, borders, text, actions, and feedback SHALL retain sufficient visual distinction using the shared tokens
