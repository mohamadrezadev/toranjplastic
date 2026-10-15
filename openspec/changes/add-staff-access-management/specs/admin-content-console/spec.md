## MODIFIED Requirements

### Requirement: Admin console routes are gated identically to the dashboard
Every route under the admin content console SHALL require a server-side content-management capability check that admits only active `ADMIN` and `OPERATOR` accounts, SHALL respond with `Cache-Control: no-store`, and SHALL be excluded from search indexing. Hidden navigation MUST NOT substitute for this route and backend authorization.

#### Scenario: Unauthenticated visitor requests an admin content page
- **WHEN** a request with no valid staff session loads any admin content console route
- **THEN** the server SHALL redirect to the login page before rendering any content data

#### Scenario: Authenticated account without content capability requests an admin content page
- **WHEN** a valid `CUSTOMER` or `SALES` session loads any admin content console route
- **THEN** the server SHALL render an access-denied view and SHALL NOT render any content data or form

#### Scenario: Operator requests an admin content page
- **WHEN** an active `OPERATOR` loads any of the six content-management areas
- **THEN** the console SHALL render the requested list, form, preview, and allowed lifecycle actions inside the shared management shell
