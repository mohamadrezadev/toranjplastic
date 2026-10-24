# admin-inquiry-operations Specification

## Purpose
TBD - created by archiving change build-admin-inquiry-operations. Update Purpose after archive.
## Requirements
### Requirement: Authorized admin inquiry reads
The backend SHALL expose versioned Admin-only list, summary, assignee, and detail operations under `/api/v1/admin/inquiries`. Every response MUST use an explicit Admin DTO, `Cache-Control: no-store`, bounded inputs, and deterministic ordering; anonymous and Customer sessions MUST receive 401 and 403 respectively.

#### Scenario: Active Admin opens the inquiry inbox
- **WHEN** an active Admin requests the inquiry list with valid filters and pagination
- **THEN** the backend SHALL return all matching inquiries in `createdAt DESC, id ASC` order with bounded pagination metadata

#### Scenario: Customer requests the admin inquiry API
- **WHEN** an authenticated Customer requests any `/api/v1/admin/inquiries` endpoint
- **THEN** the backend SHALL return 403 and SHALL NOT disclose inquiry, assignee, note, owner, summary, or count data

### Requirement: Bounded inquiry search and filtering
The Admin list SHALL support URL-compatible filters for type, status, assigned Admin, unassigned records, inclusive `from`, exclusive `to`, page, and pageSize. Search `q` MUST be at most 80 characters and SHALL match an inquiry identifier by exact/prefix semantics, a normalized mobile exactly, or a catalog snapshot by bounded case-insensitive text without logging the query value.

#### Scenario: Admin combines filters
- **WHEN** an Admin filters by status, type, assignment, and date range
- **THEN** the backend SHALL apply all supplied valid predicates and return matching deterministic results only

#### Scenario: Search input exceeds its contract
- **WHEN** `q` exceeds 80 characters or pagination/date input is invalid
- **THEN** validation SHALL return 400 without running an unbounded query

### Requirement: Real operational summary
The backend SHALL provide real summary counts for total, unassigned, Submitted, and UnderReview inquiries. The frontend MUST render only values returned by the protected API and MUST NOT invent or cache public operational metrics.

#### Scenario: Inbox summary is loaded
- **WHEN** an authorized Admin opens `/admin/inquiries`
- **THEN** the UI SHALL display the returned counts or an explicit unavailable state and SHALL NOT substitute sample values

### Requirement: Explicit admin inquiry detail contract
Admin detail SHALL include the submitted inquiry data, owner summary, current assignee summary, current version, allowed transitions, customer-safe status history, assignment history, and internal notes through an allowlisted Admin mapper. It MUST NOT serialize raw Prisma objects, credentials, sessions, password data, or unrelated customer records.

#### Scenario: Admin opens one inquiry
- **WHEN** an active Admin requests an existing inquiry identifier
- **THEN** the backend SHALL return the explicit Admin DTO and the frontend SHALL present submitted data separately from staff-only operational data

#### Scenario: Inquiry does not exist
- **WHEN** an Admin requests an unknown inquiry identifier
- **THEN** the backend SHALL return a safe 404 without stack trace or unrelated data

### Requirement: Approved status transitions
The backend SHALL enforce the transition policy: `SUBMITTED` to `UNDER_REVIEW` or `REJECTED`; `UNDER_REVIEW` to `REJECTED`; and `UNDER_REVIEW` to `COMPLETED` only for `GENERAL_CONTACT`. This slice MUST NOT create `NEED_MORE_INFO`, `QUOTED`, `ACCEPTED`, `IN_PROGRESS`, or `CANCELLED`, and terminal statuses MUST NOT reopen.

#### Scenario: Admin starts review
- **WHEN** an Admin moves a current `SUBMITTED` inquiry to `UNDER_REVIEW` with the current expected version
- **THEN** the inquiry and version SHALL update and exactly one status-history row and one audit event SHALL be committed in the same transaction

#### Scenario: Admin attempts an invalid transition
- **WHEN** the requested destination is not allowed for the inquiry's current status and type
- **THEN** the backend SHALL return `409 INQUIRY_INVALID_TRANSITION` and SHALL write no inquiry, history, or audit change

### Requirement: Optimistic concurrency for operational mutations
Status and assignment mutations SHALL require a non-negative `expectedVersion`, atomically match it, and increment `Inquiry.version` on success. Two mutations using the same version MUST NOT both succeed; the losing mutation SHALL return `409 INQUIRY_VERSION_CONFLICT` without side effects.

#### Scenario: Two Admins mutate the same version
- **WHEN** two valid status or assignment commands use the same current expected version
- **THEN** exactly one SHALL commit and the other SHALL return a stable conflict response with no additional history or audit row

### Requirement: Active Admin assignment
An inquiry MAY be assigned to one active account whose role is `ADMIN`, or unassigned with `null`. Every successful assignment change SHALL increment the inquiry version and atomically append assignment history and a metadata-only audit event; Customer, suspended, disabled, and unknown accounts MUST be rejected.

#### Scenario: Admin assigns an active Admin
- **WHEN** a current expected version and an active Admin identifier are submitted
- **THEN** the assignee SHALL update and assignment history plus audit SHALL record identifiers and version without private payload data

#### Scenario: Admin assigns an ineligible account
- **WHEN** the target is a Customer, suspended Admin, disabled Admin, or unknown account
- **THEN** the backend SHALL return `409 INQUIRY_INVALID_ASSIGNEE` and SHALL make no assignment, version, history, or audit change

### Requirement: Append-only internal notes
An active Admin SHALL be able to append a trimmed plain-text internal note of 1 through 4000 characters. Notes MUST be immutable in this slice, SHALL be stored with the session-derived author and server timestamp, SHALL write a metadata-only audit event atomically, SHALL NOT increment inquiry version, and MUST NOT be automatically retried by the UI.

#### Scenario: Admin adds an internal note
- **WHEN** an active Admin submits a valid note
- **THEN** one note and one audit event SHALL commit and the refreshed Admin detail SHALL show the escaped note under a clear staff-only label

#### Scenario: Client attempts to forge note metadata
- **WHEN** input includes author, owner, role, or creation timestamp fields
- **THEN** validation SHALL reject the request or strip no unapproved field into persistence, and server-derived metadata SHALL remain authoritative

### Requirement: Customer response isolation
Existing customer list/detail contracts SHALL remain backward-compatible and SHALL expose current status and customer-safe status history only. They MUST never include assignee, assignment history, internal-note content or existence, audit metadata, status actors, version, other customers' identity data, or operational search fields.

#### Scenario: Customer views an inquiry after Admin operations
- **WHEN** the owner requests an inquiry that has assignment changes, internal notes, and an Admin status transition
- **THEN** the response SHALL show the current approved status and safe timeline while every staff-only field remains absent

### Requirement: Admin inquiry frontend states
The frontend SHALL provide `/admin/inquiries` and `/admin/inquiries/[id]` in Persian RTL with URL-based filters, a desktop table, mobile cards, assignment controls, allowed-status controls, staff-only notes, timelines, and explicit loading, empty, error, conflict, success, disabled, and focus states. Private pages SHALL be `noindex` and all server reads SHALL be uncached.

#### Scenario: Version conflict occurs in the detail UI
- **WHEN** a mutation returns `INQUIRY_VERSION_CONFLICT`
- **THEN** the UI SHALL state that another person changed the inquiry, SHALL offer an explicit refresh action, and SHALL NOT silently retry the mutation

#### Scenario: Required viewports and themes are verified
- **WHEN** inbox and detail screens are tested at 360, 390, 768, and 1280 pixels in light and dark themes
- **THEN** controls, timelines, filters, tables/cards, feedback, keyboard navigation, and focus SHALL remain usable without unintended document overflow

### Requirement: Safe migration and verifiable atomicity
The schema change SHALL be additive and default-safe for existing inquiries, SHALL preserve existing status history, and SHALL include reviewed indexes plus rollback/backup documentation. Status, assignment, note, history, and audit atomicity MUST be proven with unit/e2e tests and a disposable PostgreSQL database whose name contains `test`.

#### Scenario: Operational history write fails
- **WHEN** a required status, assignment, note, history, or audit write fails inside its transaction
- **THEN** every write from that command SHALL roll back and the previously committed inquiry state SHALL remain unchanged

