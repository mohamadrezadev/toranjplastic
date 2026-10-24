# admin-console-experience Specification

## Purpose
TBD - created by archiving change build-admin-inquiry-operations. Update Purpose after archive.
## Requirements
### Requirement: Shared admin workspace shell
The frontend SHALL render every `/admin` page inside a Persian RTL management shell with a skip link, branded identity, authenticated Admin summary, secure logout, route-aware navigation, and a bounded main-content workspace. The shell MUST preserve server-side Admin authorization and MUST NOT treat hidden navigation as authorization.

#### Scenario: Admin navigates between management areas
- **WHEN** an active Admin opens the dashboard, a CMS route, or an inquiry route
- **THEN** the shared shell SHALL show the same navigation and account context, SHALL mark the current destination, and SHALL render the route content inside the main workspace

#### Scenario: Unauthorized account requests an admin route
- **WHEN** an anonymous or non-Admin account requests any `/admin` route
- **THEN** the existing server-side gate SHALL redirect or deny access before protected page content is rendered

### Requirement: Responsive admin navigation
The admin shell SHALL provide usable navigation without unintended page-level horizontal overflow at 360, 390, 768, and 1280 pixel widths. Desktop SHALL use a persistent sidebar, while smaller layouts SHALL provide a compact navigation surface with keyboard focus, touch-sized destinations, and an active-page indication.

#### Scenario: Admin uses the shell on a narrow viewport
- **WHEN** the admin shell is rendered at 360 or 390 pixels
- **THEN** destinations SHALL remain reachable and readable, any intentional navigation scrolling SHALL be contained within the navigation region, and the document SHALL NOT overflow horizontally

### Requirement: Consistent management page structure
Admin screens SHALL use shared page-heading, breadcrumb, panel, status, action, feedback, and responsive collection patterns so CMS and inquiry areas present a coherent workspace in light and dark themes.

#### Scenario: Admin opens a CMS list after the shell change
- **WHEN** an existing content-management route is rendered
- **THEN** its functionality SHALL remain available inside the new shell with consistent spacing, focus presentation, and responsive workspace bounds

### Requirement: Admin dashboard navigation
The `/admin` dashboard SHALL provide real navigation to inquiry operations and all six CMS areas and SHALL NOT show fabricated metrics or commercial data.

#### Scenario: Dashboard data is unavailable
- **WHEN** no approved operational summary has been loaded
- **THEN** the dashboard SHALL render navigation and explanatory content without placeholder counts, prices, capacities, inventory, or delivery claims

