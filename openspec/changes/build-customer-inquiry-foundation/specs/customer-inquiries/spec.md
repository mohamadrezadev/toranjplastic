## ADDED Requirements

### Requirement: Authenticated inquiry creation
The backend SHALL provide versioned authenticated create operations for product inquiries, injection-service requests, material inquiries, and general contact requests. Ownership, initial status, and creation actor MUST be derived from the validated server-side session; client input MUST NOT set an owner, assignee, status, history, role, internal note, quotation, or price.

#### Scenario: Authenticated customer submits a valid request
- **WHEN** an active authenticated account submits a valid payload to one of the four inquiry create operations with valid Origin and session-bound CSRF proof
- **THEN** the backend SHALL create one owner-linked inquiry of that type and return an explicit customer-safe representation

#### Scenario: Unauthenticated or forged request attempts creation
- **WHEN** a request has no valid session, lacks valid CSRF proof, or supplies owner, role, status, assignee, internal-note, quotation, or price fields
- **THEN** the backend SHALL reject the request and SHALL NOT persist an inquiry or history row

### Requirement: PRD-aligned inquiry form validation
Each create operation SHALL validate only its approved PRD 04 field set. Product inquiries SHALL require an effectively published related product and accept optional approximate quantity, description, delivery city, and requested timing. Injection-service requests SHALL require a part description and accept optional approximate quantity, mold situation including unknown/free-form detail, material, color, delivery location, requested timing, description, and published service context. Material inquiries SHALL require an approved request kind and polymer/material name while allowing optional grade, brand, new/recycled condition, approximate quantity/unit, application, specification, color, delivery city, requested timing, description, and published material context. General contact requests SHALL require a description.

#### Scenario: Customer does not know optional technical detail
- **WHEN** an injection or material request omits grade, material, color, quantity, timing, or another field that PRD 04 marks optional or unknown-capable
- **THEN** the backend SHALL accept the request when all type-required fields are valid and SHALL NOT invent missing technical values

#### Scenario: Catalog context is not publicly eligible
- **WHEN** a request references a missing, draft, archived, or future-dated product, service, or material
- **THEN** the backend SHALL reject the reference without revealing its lifecycle state

#### Scenario: Type-specific payload is invalid
- **WHEN** required content is blank, a value exceeds its documented bound, an enum is unknown, or a field belongs to a different inquiry type
- **THEN** validation SHALL reject the payload and no inquiry SHALL be created

### Requirement: Initial status and atomic history
Every new inquiry SHALL use the approved `Submitted` initial status and SHALL create its initial status-history record in the same database transaction. The only allowed inquiry statuses are `Submitted`, `UnderReview`, `NeedMoreInfo`, `Quoted`, `Accepted`, `InProgress`, `Completed`, `Rejected`, and `Cancelled`.

#### Scenario: Inquiry creation succeeds
- **WHEN** persistence of both the inquiry and initial history entry succeeds
- **THEN** the stored inquiry SHALL be `Submitted` and its history SHALL contain a creation transition to `Submitted` attributed to the authenticated account

#### Scenario: History persistence fails
- **WHEN** the inquiry row can be written but its required initial history row cannot be persisted
- **THEN** the transaction SHALL roll back and neither row SHALL remain committed

### Requirement: Owner-scoped inquiry reads
The backend SHALL provide owner-scoped, bounded, paginated inquiry list and detail operations. The list SHALL support optional approved type and status filters and deterministic newest-first ordering. Ownership MUST be included in the persistence query rather than enforced only after retrieving the record.

#### Scenario: Customer lists owned inquiries
- **WHEN** an authenticated account requests its inquiries with valid optional type/status filters and pagination
- **THEN** the backend SHALL return only that account's matching inquiries plus bounded pagination metadata

#### Scenario: Customer requests another account's inquiry
- **WHEN** an authenticated account requests an inquiry identifier it does not own
- **THEN** the backend SHALL return the same not-found response used for an unknown identifier and SHALL disclose no existence or owner information

### Requirement: Customer-safe private responses
Inquiry responses SHALL use explicit allowlisted DTOs and `Cache-Control: no-store`. They SHALL include approved submitted fields, current status, customer-visible status history, and catalog display snapshots where applicable. They MUST NOT include internal notes, assignee data, security/session data, unpublished catalog data, future quotations, private file locations, or raw persistence objects, and private payloads MUST NOT be logged.

#### Scenario: Customer views an owned inquiry
- **WHEN** an authenticated owner requests inquiry detail
- **THEN** the response SHALL contain only the customer-safe fields and history defined by the public contract and SHALL be marked `no-store`

#### Scenario: Internal fields exist in a future schema
- **WHEN** a persisted inquiry later contains operational fields not present in the customer DTO
- **THEN** those fields SHALL remain absent from customer list and detail responses by construction

### Requirement: Persian private customer portal
The frontend SHALL provide authenticated Persian RTL screens for selecting and submitting each inquiry type, listing the current account's requests with type/status filters, and viewing owned request details and history. Private account and inquiry pages SHALL be `noindex`, use uncached server reads, and redirect unauthenticated visitors to login without treating metadata as access control.

#### Scenario: Customer completes an inquiry flow
- **WHEN** an authenticated customer submits a valid inquiry form
- **THEN** the UI SHALL show pending/disabled submission behavior, create the request through the protected backend contract, and navigate to its private detail page with a Persian success confirmation

#### Scenario: Portal data is empty or unavailable
- **WHEN** the owned list is empty or a private request fails
- **THEN** the UI SHALL distinguish loading, empty, validation, not-found, and service-error states and offer an appropriate next action without exposing private details

#### Scenario: Required viewports are verified
- **WHEN** inquiry forms, list, filters, and detail history are rendered at 360, 390, 768, and 1280 pixel widths in light and dark themes
- **THEN** they SHALL preserve RTL order, keyboard focus, readable labels, usable touch targets, and avoid unintended horizontal page scrolling

### Requirement: Attachments and commerce remain disabled
This foundation SHALL NOT accept file metadata or binary uploads and SHALL NOT expose quotations, prices, payment, cart, live inventory, guaranteed delivery, or automatic injection-cost behavior. The UI SHALL clearly state that attachments are not yet enabled where the PRD form would otherwise allow them.

#### Scenario: Customer prepares a foundation inquiry
- **WHEN** a customer opens any inquiry form delivered by this change
- **THEN** no upload, checkout, payment, automatic price, or guaranteed availability control SHALL be rendered

