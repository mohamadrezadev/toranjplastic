## MODIFIED Requirements

### Requirement: Content lifecycle is create, edit, publish, archive
Every content record, across all six content types (Category, Product, InjectionService, Material, Article, ManagedPage), SHALL be created in `DRAFT` status. Editing a record's fields MUST NOT change its status. Publishing SHALL be a distinct action that sets status to `PUBLISHED` and records a publish timestamp, and SHALL be idempotent when the record is already `PUBLISHED`. Archiving SHALL be a distinct action available from any status that sets status to `ARCHIVED`, SHALL be idempotent when the record is already `ARCHIVED`, and MUST NOT physically delete the record or any record that references it.

#### Scenario: Admin creates a new record
- **WHEN** an authorized admin submits a valid create request for any of the six content types
- **THEN** the record SHALL be persisted with `DRAFT` status and MUST NOT appear in the public read API

#### Scenario: Admin publishes a draft record
- **WHEN** an authorized admin calls publish on a `DRAFT` or `ARCHIVED` record of any content type
- **THEN** its status SHALL become `PUBLISHED`, a publish timestamp SHALL be set, and the record SHALL become eligible to appear in the public read API

#### Scenario: Admin archives a published record that other records reference
- **WHEN** an authorized admin archives a Category that one or more Products reference
- **THEN** the Category's status SHALL become `ARCHIVED`, the referencing Products SHALL be unaffected and SHALL NOT be deleted or have their category reference cleared, and no record SHALL be physically deleted

#### Scenario: Admin publishes an already-published record
- **WHEN** an authorized admin calls publish on a record of any content type that is already `PUBLISHED`
- **THEN** the server SHALL respond successfully without error and the record's existing publish timestamp SHALL be unaffected

### Requirement: Admin preview visibility is separate from the public read boundary
Admin list and detail endpoints for all six content types SHALL return content records of any status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) for preview purposes. The public read API's existing published-only behavior MUST NOT change as a result of this capability.

#### Scenario: Admin previews a draft record before publishing
- **WHEN** an authorized admin requests a `DRAFT` record of any content type by id through the admin API
- **THEN** the server SHALL return the record, and the same record SHALL continue to be absent from the public read API's responses
