# theme-preferences Specification

## Purpose
TBD - created by archiving change add-light-dark-theme-foundation. Update Purpose after archive.
## Requirements
### Requirement: Effective theme resolution
The frontend SHALL render exactly one effective `light` or `dark` theme. A valid explicit local preference SHALL take precedence over the operating-system color preference; when no valid explicit preference exists, the frontend SHALL follow `prefers-color-scheme`, defaulting safely to light when preference APIs are unavailable.

#### Scenario: Returning user has an explicit preference
- **WHEN** local preference contains `light` or `dark` and the application loads
- **THEN** the frontend SHALL apply that explicit theme regardless of the current operating-system preference

#### Scenario: First-time user has no valid preference
- **WHEN** no valid local theme preference exists and the application loads
- **THEN** the frontend SHALL use dark only when the operating system requests dark and SHALL otherwise use light

### Requirement: Pre-paint theme application
The frontend SHALL set the effective theme on the root document before visible application content is painted and SHALL fail without blocking content if storage or media-preference access is unavailable.

#### Scenario: Page loads or reloads
- **WHEN** the browser begins rendering the root document
- **THEN** `data-theme`, native `color-scheme`, and browser `theme-color` SHALL reflect the resolved effective theme before application hydration

#### Scenario: Browser denies preference storage access
- **WHEN** reading local storage throws or returns invalid data
- **THEN** the page SHALL remain usable and SHALL resolve from the operating-system preference or safe light fallback

### Requirement: Accessible manual theme control
The public shell SHALL expose a reusable control in desktop and mobile navigation that switches between light and dark. The control SHALL have a Persian accessible name describing its action, expose its current state programmatically, support keyboard and pointer activation, and meet the minimum 44 by 44 pixel target.

#### Scenario: User switches the theme
- **WHEN** the user activates the theme control
- **THEN** the frontend SHALL apply the opposite effective theme immediately, update the accessible state and action label, and persist the explicit choice

#### Scenario: User reloads after switching
- **WHEN** the user reloads or revisits after selecting a theme
- **THEN** the saved explicit theme SHALL be restored before the visible application renders

### Requirement: Theme-aware browser surface
The frontend SHALL maintain the existing pre-paint effective-theme resolution contract and keep root `data-theme`, document `color-scheme`, and browser `theme-color` synchronized with the approved petroleum-and-stone semantic canvas values. A valid explicitly saved `light` or `dark` choice under `toranj-theme` SHALL remain effective across reloads and take precedence over the operating-system preference.

#### Scenario: Effective theme changes
- **WHEN** the effective theme changes between light and dark
- **THEN** native control styling and the theme-color meta value SHALL change to the corresponding approved semantic theme values

#### Scenario: Light canvas selected
- **WHEN** the effective theme is light
- **THEN** `data-theme` SHALL be `light`, the browser theme-color SHALL match `#f3f1ec`, and the Light semantic tokens SHALL govern visible surfaces

#### Scenario: Dark canvas selected
- **WHEN** the effective theme is dark
- **THEN** `data-theme` SHALL be `dark`, the browser theme-color SHALL match `#0f1a1c`, and the Dark semantic tokens SHALL govern visible surfaces

#### Scenario: Saved preference and system preference disagree
- **WHEN** the local value `toranj-theme` is a valid explicit preference differing from `prefers-color-scheme`
- **THEN** the frontend SHALL retain the explicitly saved preference and MUST NOT flash the other canvas before hydration

#### Scenario: Preference APIs are unavailable
- **WHEN** local storage or media preference access fails during bootstrap
- **THEN** visible content SHALL remain usable and the page SHALL resolve to a safe effective theme without blocking rendering

### Requirement: Responsive theme consistency
Current public home and inner surfaces SHALL remain readable and operable in both themes at widths 360, 390, 768, and 1280 pixels without clipping or unintended horizontal scrolling.

#### Scenario: Public surface is rendered in either theme
- **WHEN** the home page or a provisional inner page is rendered at a required viewport width in light or dark
- **THEN** text, controls, navigation, feedback, surfaces, and focus states SHALL use the effective semantic tokens and remain usable without horizontal overflow

