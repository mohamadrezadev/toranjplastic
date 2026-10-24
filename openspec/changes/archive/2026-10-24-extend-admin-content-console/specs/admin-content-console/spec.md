## MODIFIED Requirements

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
