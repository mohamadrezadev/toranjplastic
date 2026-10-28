# inquiry-customer-messaging Specification

## Purpose
TBD - created by archiving change add-inquiry-messaging. Update Purpose after archive.
## Requirements
### Requirement: Separate append-only customer-visible messages
The system SHALL persist inquiry messages separately from internal notes. Each message MUST use a session-derived author, an explicit `CUSTOMER` or `STAFF` sender type, trimmed plain text of 1 through 4000 characters, and a server timestamp; messages SHALL NOT be edited or deleted in this change.

#### Scenario: Staff sends a normal message
- **WHEN** an authorized staff account posts valid text to a non-terminal inquiry
- **THEN** exactly one customer-visible message SHALL be appended without exposing or modifying internal notes

#### Scenario: Client forges message metadata
- **WHEN** a client supplies an author, sender type, role, timestamp, owner, or visibility field
- **THEN** validation SHALL reject the unapproved input and persistence SHALL use server-derived metadata only

### Requirement: Owner and staff authorization boundaries
Customer message reads and writes MUST include the authenticated owner identifier in the persistence predicate. Staff reads and writes MUST require the server-derived `INQUIRY_OPERATIONS` capability. Unknown and non-owned inquiry identifiers SHALL be indistinguishable to customers.

#### Scenario: Customer accesses another customer's thread
- **WHEN** an authenticated customer reads or posts to an inquiry it does not own
- **THEN** the backend SHALL return the same safe 404 used for an unknown inquiry and SHALL disclose no thread or owner data

#### Scenario: Staff without inquiry capability posts a message
- **WHEN** an authenticated staff account without `INQUIRY_OPERATIONS` calls an Admin message endpoint
- **THEN** the backend SHALL return 403 and SHALL persist no message, history, status, version, or audit change

### Requirement: Message-driven information-request transitions
The backend SHALL create `UNDER_REVIEW -> NEED_MORE_INFO` only when an authorized staff message explicitly requests more information, and SHALL create `NEED_MORE_INFO -> UNDER_REVIEW` when the owner successfully replies. Each status-changing message, inquiry update, status-history row, and metadata-only audit event MUST commit in one transaction with optimistic concurrency.

#### Scenario: Staff requests more information
- **WHEN** staff sends a valid message with `requestMoreInfo=true` and the current inquiry version while status is `UNDER_REVIEW`
- **THEN** the message and transition to `NEED_MORE_INFO` SHALL commit once and the inquiry version SHALL increment once

#### Scenario: Customer answers the request
- **WHEN** the owner posts a valid reply while the inquiry is `NEED_MORE_INFO`
- **THEN** the reply and transition to `UNDER_REVIEW` SHALL commit atomically and become visible in both safe timelines

#### Scenario: Transaction or version check fails
- **WHEN** any required message, inquiry, history, audit write, or expected-version match fails
- **THEN** no partial write SHALL remain and a stale status-changing command SHALL return 409

### Requirement: Safe deterministic thread contracts
Message responses SHALL be explicit allowlisted DTOs, return a bounded window of at most the 200 most recent messages in deterministic `createdAt ASC, id ASC` presentation order, and carry `Cache-Control: no-store`. Customer DTOs MUST NOT contain internal notes, capabilities, staff mobile numbers, audit metadata, sessions, or messages from another inquiry.

#### Scenario: Owner loads an inquiry conversation
- **WHEN** an authenticated owner opens an inquiry with customer and staff messages
- **THEN** the response SHALL include only that inquiry's customer-visible messages and safe author labels in deterministic order

#### Scenario: Message content reaches diagnostics
- **WHEN** a message command succeeds or fails
- **THEN** logs and audit metadata SHALL omit the message text and other private payload fields

### Requirement: Persian responsive conversation UI
The Admin and customer inquiry-detail screens SHALL render a Persian RTL conversation, chronological messages, empty/error/success states, accessible labels, focus-visible controls, and pending/disabled submission without unintended page overflow at 360, 390, 768, and 1280 pixels in light and dark themes. Internal-note and customer-message composers MUST be visually and semantically distinct.

#### Scenario: Customer replies on a narrow viewport
- **WHEN** the customer uses the conversation at 360 or 390 pixels
- **THEN** message text, timestamps, composer, validation and submit feedback SHALL remain readable and keyboard/touch usable without horizontal document scrolling

#### Scenario: Admin views notes and messages together
- **WHEN** authorized staff opens inquiry detail
- **THEN** customer-visible messages SHALL be labeled separately from staff-only notes and no control SHALL imply that an internal note will be sent to the customer

### Requirement: Notification on new inquiry message
When a staff member sends a new message to the customer regarding an inquiry, the backend SHALL emit an SMS notification alerting the customer that an update is awaiting their attention.

#### Scenario: Staff sends message and customer is alerted
- **WHEN** a staff user posts a message to an inquiry discussion
- **THEN** an SMS notification alert SHALL be dispatched to the inquiry owner's mobile number

