# admin-content-console Specification

## Purpose
TBD - created by archiving change build-admin-content-console. Update Purpose after archive.
## Requirements
### Requirement: Admin console routes are gated identically to the dashboard
Every route under the admin content console SHALL require a server-side content-management capability check that admits only active `ADMIN` and `OPERATOR` accounts, SHALL respond with `Cache-Control: no-store`, and SHALL be excluded from search indexing. Hidden navigation MUST NOT substitute for this route and backend authorization.

#### Scenario: Unauthenticated visitor requests an admin content page
- **WHEN** a request with no valid staff session loads any admin content console route
- **THEN** the server SHALL redirect to the login page before rendering any content data

#### Scenario: Authenticated non-admin visitor requests an admin content page
- **WHEN** a valid `CUSTOMER` or `SALES` session loads any admin content console route
- **THEN** the server SHALL render an access-denied view and SHALL NOT render any content data or form

#### Scenario: Operator requests an admin content page
- **WHEN** an active `OPERATOR` loads any of the six content-management areas
- **THEN** the console SHALL render the requested list, form, preview, and allowed lifecycle actions inside the shared management shell

### Requirement: Admin can list, filter, and paginate content records
The console SHALL display records of any status for all six content types (Category, Product, InjectionService, Material, Article, ManagedPage), SHALL support filtering by status, and SHALL support paging through results.

#### Scenario: Admin filters the category list by status
- **WHEN** an admin selects a status filter on any content type's list
- **THEN** the displayed records SHALL be limited to that status

### Requirement: Admin can create, edit, publish, and archive Category and Product records
The console SHALL provide forms to create a new record, edit an existing record's fields, publish a record, and archive a record, for all six content types, each submitting to the corresponding backend admin content endpoint.

#### Scenario: Admin submits a valid create form
- **WHEN** an admin submits the create form for any content type with valid field values
- **THEN** the console SHALL create the record via the backend API and redirect to a page confirming or listing the result

#### Scenario: Admin submits a create or edit form that the backend rejects
- **WHEN** the backend responds to a create or edit submission with a validation error (400) or a duplicate-slug conflict (409)
- **THEN** the console SHALL redirect back to the same form with an error indicator and SHALL NOT claim the record was saved

#### Scenario: Admin publishes or archives a record from its edit page
- **WHEN** an admin submits the publish or archive action on a record's edit page, for any content type
- **THEN** the console SHALL call the corresponding backend action endpoint and reflect the record's resulting status on the same page

### Requirement: Session CSRF protection is never exposed to the browser
The console's mutating Server Actions SHALL attach the session's CSRF token to the backend request server-side, and no page SHALL render the CSRF token value into HTML, a hidden form field, or client-side script.

#### Scenario: Admin view-source on a create or edit page
- **WHEN** an admin inspects the rendered HTML of a create, edit, publish, or archive form
- **THEN** no CSRF token value SHALL appear anywhere in that HTML

