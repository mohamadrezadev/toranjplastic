## ADDED Requirements

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
