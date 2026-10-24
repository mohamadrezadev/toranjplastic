# customer-quotation-response Specification

## Purpose
TBD - created by archiving change add-customer-quotation-response. Update Purpose after archive.
## Requirements
### Requirement: Owner-bound response to current quotation version
Only the authenticated inquiry owner SHALL accept or reject the current, sent, unexpired quotation version through CSRF-protected endpoints. The command MUST bind the inquiry identifier, quotation identifier, quotation version and expected inquiry version, and MUST derive the responder from the session.

#### Scenario: Owner accepts the current valid quotation
- **WHEN** the owner confirms acceptance of the current sent version before expiry with matching versions
- **THEN** the backend SHALL attribute acceptance to that owner and SHALL record the exact quotation version and server time

#### Scenario: Non-owner or forged responder attempts a response
- **WHEN** another customer supplies the identifiers or a forged responder/owner field
- **THEN** the backend SHALL return a safe 404 or validation failure and SHALL reveal no quotation data or change

### Requirement: Atomic acceptance lifecycle
Accepting a valid quotation SHALL atomically mark that quotation `ACCEPTED`, transition the Inquiry from `QUOTED` to `ACCEPTED`, increment relevant versions, append Inquiry status history, and write metadata-only audit. The accepted snapshot MUST remain immutable.

#### Scenario: Acceptance commits successfully
- **WHEN** every acceptance prerequisite and write succeeds
- **THEN** quotation response, Inquiry status, versions, history and audit SHALL commit exactly once

#### Scenario: Acceptance write fails
- **WHEN** any response, quotation, inquiry, history or audit write fails
- **THEN** the transaction SHALL roll back completely and the previous sent/quoted state SHALL remain

### Requirement: Rejection permits a revised offer
Rejecting a valid quotation SHALL mark only that quotation version `REJECTED`, optionally store a trimmed bounded customer reason, and atomically transition the Inquiry from `QUOTED` to `UNDER_REVIEW`. It MUST NOT set the Inquiry to terminal `REJECTED` and staff SHALL be able to prepare a later quotation version.

#### Scenario: Customer rejects an offer
- **WHEN** the owner rejects the current valid sent quotation
- **THEN** that version SHALL record rejection and the Inquiry SHALL return to `UNDER_REVIEW` with one history and audit event

#### Scenario: Staff creates a revision after rejection
- **WHEN** authorized staff starts a quotation revision for the returned inquiry
- **THEN** the new draft SHALL receive the next version while the rejected snapshot and response remain immutable

### Requirement: Expiry, concurrency and replay safety
The backend MUST reject responses to draft, superseded, expired, non-current or already oppositely-answered quotations. Repeating the same response to the same already-answered version SHALL return the established result without duplicate history/audit; stale or opposite responses SHALL return 409 without side effects.

#### Scenario: Acceptance is retried after an uncertain response
- **WHEN** the owner repeats acceptance for the same version that it already accepted
- **THEN** the backend SHALL return the accepted result and SHALL NOT append duplicate response, history or audit records

#### Scenario: Quote expires before submission
- **WHEN** the server time is later than the quotation expiry at command evaluation
- **THEN** the backend SHALL return a stable conflict, keep the Inquiry `QUOTED`, and persist no response

### Requirement: Post-acceptance staff workflow
The backend SHALL allow authorized staff to transition `ACCEPTED -> IN_PROGRESS -> COMPLETED` with optimistic concurrency, status history and metadata-only audit. Customers and staff without `INQUIRY_OPERATIONS` MUST NOT perform these transitions, and `COMPLETED` SHALL remain terminal.

#### Scenario: Staff begins fulfillment
- **WHEN** authorized staff changes an accepted Inquiry to `IN_PROGRESS` with the current expected version
- **THEN** the status, version, history and audit SHALL commit atomically

#### Scenario: Customer attempts operational completion
- **WHEN** a Customer calls an Admin transition endpoint or forges a target status
- **THEN** the backend SHALL deny the operation and SHALL make no state change

### Requirement: Clear responsive response experience
The customer UI SHALL show the current quotation number, version, total, expiry and immutable commercial summary before explicit accept or reject confirmation. It SHALL display pending, success, already-answered, expired and conflict states in Persian RTL without automatic mutation retry. Admin detail SHALL show response status/time and only backend-provided allowed transitions. Both SHALL remain usable at 360, 390, 768 and 1280 pixels in light and dark themes.

#### Scenario: Customer confirms on mobile
- **WHEN** the owner responds at 360 or 390 pixels
- **THEN** the summary, accept/reject distinction, confirmation, focus and feedback SHALL remain readable and touch/keyboard usable without unintended overflow

#### Scenario: Response conflicts with a newer version
- **WHEN** submission returns a quotation or inquiry version conflict
- **THEN** the UI SHALL explain that the offer changed, provide an explicit refresh action, and SHALL NOT silently retry

