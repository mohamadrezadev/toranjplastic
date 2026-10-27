## MODIFIED Requirements

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
