## MODIFIED Requirements

### Requirement: Semantic token registry
The frontend SHALL expose color, typography, spacing, radius, control-size, border, elevation, and motion values through semantic design tokens rather than component-local business colors or arbitrary numeric values. Every supported light or dark theme SHALL preserve stable semantic token roles and accessible interaction contrast. The active visual direction SHALL use a restrained corporate-minimal palette with neutral surfaces, deep navy hierarchy, and a controlled blue interactive accent. Brand assets SHALL remain marked provisional until product approval, and business-area accents MUST remain separate from brand-action and status colors.

#### Scenario: Component consumes a visual value
- **WHEN** a shared component needs a color, spacing, radius, control size, typography, elevation, or focus style in either theme
- **THEN** it SHALL use an appropriate semantic token from the design-system registry instead of defining an unrelated hard-coded or theme-specific component value

#### Scenario: Business accent and status are displayed together
- **WHEN** a component appears inside the industrial or kitchen product area and also communicates success, warning, information, or error in either theme
- **THEN** it SHALL use the business accent only for section identity and a separate status token plus text or icon for the status meaning

#### Scenario: Corporate primary action is displayed
- **WHEN** a shared public surface presents its primary valid action in light or dark theme
- **THEN** it SHALL use the corporate interactive accent and MUST NOT reuse warning, danger, or section-identity colors as the global action meaning

#### Scenario: Theme changes on a shared surface
- **WHEN** the effective theme switches between light and dark
- **THEN** shared components SHALL retain their semantic hierarchy, visible focus, readable text, and distinguishable interactive and status states without changing component APIs
