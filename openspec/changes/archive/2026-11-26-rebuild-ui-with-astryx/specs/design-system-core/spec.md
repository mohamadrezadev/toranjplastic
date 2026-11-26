## ADDED Requirements

### Requirement: Astryx-backed primitive foundation
The Toranj primitive layer SHALL use supported Astryx public components for adopted actions, form controls, selection, feedback, navigation, layers, responsive collections, pagination, and data-display patterns when those components satisfy the applicable Toranj contracts. Toranj-owned adapters SHALL remain typed and limited to semantic token mapping, Persian defaults, compatibility, and composition; they MUST NOT contain product business rules, authorization decisions, or API access.

#### Scenario: Existing primitive is migrated
- **WHEN** an existing Button, Input, Textarea, Select, Checkbox, Radio, feedback, or navigation primitive is implemented with Astryx
- **THEN** existing Toranj screens SHALL retain their required accessible names, loading, disabled, help, error, focus, RTL, theme, and responsive behavior throughout the compatibility phase

#### Scenario: No suitable Astryx component exists
- **WHEN** the documented Astryx public catalog cannot satisfy a Toranj primitive or domain requirement without violating an approved spec
- **THEN** the project SHALL retain or compose a Toranj-owned implementation behind the correct layer boundary and SHALL document the evaluated gap without importing upstream internals

### Requirement: Stable theme ownership across Astryx and Toranj layers
Toranj semantic tokens SHALL remain the source of product visual meaning, and the Astryx theme integration SHALL map those meanings to supported library roles rather than introducing parallel uncontrolled brand, status, spacing, typography, radius, elevation, or motion values. Domain components MAY use Toranj product tokens but MUST NOT depend on undocumented Astryx internal selectors or generated class names.

#### Scenario: Shared component receives its visual treatment
- **WHEN** an adopted Astryx component or Toranj domain component renders on a migrated screen
- **THEN** its visual meaning SHALL resolve through documented Astryx theme targets and Toranj semantic roles, and it MUST NOT depend on an unstable generated class selector or a component-local brand color

#### Scenario: Base library theme changes during upgrade
- **WHEN** a pinned Astryx upgrade changes a default token, selector, or component presentation
- **THEN** automated and visual checks SHALL detect any Toranj semantic or contrast drift and the upgrade MUST NOT ship until the mapping is corrected or the affected component remains on the prior supported implementation
