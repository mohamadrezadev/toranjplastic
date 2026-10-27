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

### Requirement: Content-capable staff can use a protected Media Library
The management console SHALL provide `/admin/media` list and detail interactions only to server-verified active accounts with the content-management capability. The route SHALL be `noindex` and `no-store`, SHALL paginate and bound search results, and SHALL not prefetch or render media data for an unauthorized account.

#### Scenario: Operator opens the Media Library
- **WHEN** an active `OPERATOR` with content-management capability opens `/admin/media`
- **THEN** the console SHALL render the authorized Persian RTL library with bounded pagination, search, usage status and upload controls

#### Scenario: Sales user opens the Media Library directly
- **WHEN** an authenticated `SALES` account requests `/admin/media`
- **THEN** the console SHALL render a permission-safe forbidden state and SHALL NOT request, prefetch or render private media metadata or previews

### Requirement: Product forms provide accessible managed gallery authoring
Product create and edit flows SHALL support upload or Media Library selection, no more than six total images, preview, required per-use alt text, deterministic position, position-zero cover, removal from the unsaved gallery, and pointer plus keyboard reordering. Historical legacy rows SHALL remain explicitly editable until replaced, and form state MUST survive individual upload failures and backend conflicts.

#### Scenario: Operator builds a Product gallery
- **WHEN** an Operator selects ready media, supplies alt text, reorders images and submits the current expected version
- **THEN** the console SHALL send only the validated legacy/managed union and order, show the saved cover and preserve the resulting content version

#### Scenario: Product save conflicts
- **WHEN** the backend returns `CONTENT_VERSION_CONFLICT`
- **THEN** the console SHALL retain unsaved form values, show a Persian stale-data message and offer an explicit refresh/reconcile action without claiming success

### Requirement: Article forms provide explicit featured-media selection and clearing
Article create and edit flows SHALL allow authorized staff to upload or select one featured image, edit its per-use alt, replace it, or explicitly clear it. The form SHALL distinguish unchanged, selected and null states and SHALL submit the expected Article version for managed changes.

#### Scenario: Existing Article image is cleared
- **WHEN** staff invokes the clear action and saves the current Article version
- **THEN** the console SHALL submit explicit null, display the returned no-image state and SHALL not repopulate the previous URL

### Requirement: Media authoring meets required responsive and accessibility states
The Media Library, upload controls, picker dialogs and gallery editor SHALL be keyboard operable, focus-visible, Persian RTL and understandable without color alone in light and dark themes at 360, 390, 768 and 1280 pixel widths. Upload progress and failures SHALL be announced, dialogs SHALL trap and restore focus, and no required state MAY cause unintended page-level horizontal overflow.

#### Scenario: Media picker is used at 360 pixels
- **WHEN** staff opens, searches, selects and closes the picker at a 360-pixel viewport using only the keyboard
- **THEN** all controls and feedback SHALL remain readable and operable, selection SHALL be announced, focus SHALL return to the invoker and the page SHALL not overflow horizontally

