## ADDED Requirements

### Requirement: Persian RTL public layout
The public application shell SHALL declare Persian language and right-to-left direction at the document level and SHALL provide a shared content container that preserves RTL reading order across mobile, tablet, and desktop layouts.

#### Scenario: Public page uses the shared shell
- **WHEN** a public route renders inside the application layout
- **THEN** its header, main content, breadcrumb region, and footer SHALL inherit Persian RTL behavior without route-specific direction overrides

### Requirement: Desktop public navigation
At desktop width, the public header SHALL provide valid destinations for خانه، محصولات، خدمات تزریق، تأمین مواد اولیه، مقالات، درباره ما، and تماس با ما, plus distinct «استعلام قیمت» and «ورود / ثبت‌نام» actions.

#### Scenario: Desktop navigation is rendered
- **WHEN** the viewport supports the desktop header layout
- **THEN** all approved navigation items SHALL be visible, keyboard operable, and identify the current page where applicable

#### Scenario: Destination is not implemented
- **WHEN** a planned route does not yet have a valid destination
- **THEN** the shell MUST NOT expose a broken or placeholder link for that route

### Requirement: Mobile navigation drawer
At narrow widths, the public shell SHALL replace the desktop navigation list with an accessible menu control and RTL drawer or equivalent compact navigation. The menu SHALL manage focus, expose expanded state, and close predictably.

#### Scenario: User opens and closes the mobile menu
- **WHEN** the user activates the menu control with pointer or keyboard
- **THEN** the control SHALL expose its expanded state, focus SHALL move into the menu, Escape SHALL close it, and focus SHALL return to the trigger

#### Scenario: Background is unavailable while menu is open
- **WHEN** a modal mobile drawer is open
- **THEN** background interactive content SHALL not receive pointer or keyboard interaction

### Requirement: Approved-content footer
The public footer SHALL provide primary navigation and legal links, but company phone, email, address, social accounts, certification, and industrial claims MUST appear only after explicit content approval.

#### Scenario: Contact information is not approved
- **WHEN** the public shell is rendered before verified contact content is available
- **THEN** the footer SHALL use a clearly identified placeholder or omit the contact field and MUST NOT copy values from unverified legacy material

### Requirement: Breadcrumb pattern
The public shell SHALL provide a Persian RTL breadcrumb pattern for nested public pages. The current page SHALL be represented as current location rather than an actionable duplicate link.

#### Scenario: Product detail page renders breadcrumbs
- **WHEN** a nested detail route supplies its hierarchy
- **THEN** the breadcrumb SHALL expose the ordered hierarchy, valid links for ancestors, and `aria-current="page"` for the current Persian page title

### Requirement: Required responsive viewports
The public shell SHALL be visually and functionally verified at 360, 390, 768, and 1280 pixel viewport widths. It MUST prevent unintended horizontal scrolling, preserve readable content order, and maintain usable touch targets.

#### Scenario: Shell is tested at a required viewport
- **WHEN** automated or manual visual verification runs at any required width
- **THEN** header, main content, feedback surfaces, and footer SHALL fit the viewport without clipping, overlap, or unintended horizontal page scrolling

#### Scenario: Long Persian or LTR content is rendered
- **WHEN** navigation, breadcrumb, URL, email, or identifier content exceeds its normal length
- **THEN** the shell SHALL wrap, truncate with an accessible full value, or use controlled local scrolling without forcing page-level horizontal scrolling

### Requirement: Public-shell indexing boundary
The shell SHALL support indexable metadata for approved public content and `noindex` metadata for unapproved placeholders and all future authentication, customer portal, and admin surfaces. Metadata MUST NOT be used as an access-control mechanism.

#### Scenario: Placeholder foundation page is active
- **WHEN** production identity and content remain unapproved
- **THEN** the page SHALL remain `noindex` and `nofollow`

#### Scenario: Private surface later adopts shared primitives
- **WHEN** an authentication, portal, or admin route uses the shared design system
- **THEN** that route SHALL remain `noindex` and protected by server-side authorization independently of UI visibility

### Requirement: Version-one public actions exclude ecommerce
The public shell MUST NOT expose cart, checkout, online payment, confirmed live inventory, or automatic injection-price actions.

#### Scenario: Primary commercial call to action is rendered
- **WHEN** the shell presents a commercial CTA
- **THEN** it SHALL direct the user toward inquiry or approved contact behavior without implying purchase completion, guaranteed stock, or a binding automatic price
