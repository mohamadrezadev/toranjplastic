# versioned-inquiry-quotations Specification

## Purpose
TBD - created by archiving change add-versioned-quotations. Update Purpose after archive.
## Requirements
### Requirement: Manual quotation drafts and server-derived totals
Authorized staff SHALL create and edit one draft quotation per inquiry with 1 through 50 snapshot items, bounded commercial terms, an expiry date, and monetary amounts represented as non-negative integer IRR strings. The backend MUST derive subtotal and final total from item and adjustment inputs and MUST NOT obtain price, availability or delivery promises automatically from catalog or inventory data.

#### Scenario: Sales creates a valid draft
- **WHEN** authorized staff submits valid manually entered items and terms for an eligible inquiry
- **THEN** the backend SHALL create the next quotation version with server-derived totals and return an explicit Admin DTO

#### Scenario: Client supplies inconsistent totals
- **WHEN** submitted line or final totals do not match the backend calculation or overflow accepted bounds
- **THEN** the backend SHALL reject the command and SHALL persist no quotation data

### Requirement: Optimistic immutable quotation versions
Draft updates SHALL require the current quotation `expectedVersion`. A sent quotation and its items MUST be immutable; revising a sent quotation SHALL create a new draft version cloned from its snapshot. At most one draft and one current sent version SHALL exist for an inquiry.

#### Scenario: Staff revises a sent quotation
- **WHEN** authorized staff starts a revision of the current sent version
- **THEN** the backend SHALL create a new numbered version as DRAFT and SHALL leave the sent snapshot unchanged

#### Scenario: Two staff members update one draft version
- **WHEN** concurrent updates use the same expected version
- **THEN** exactly one SHALL commit and the loser SHALL receive a stable 409 without partial item or audit writes

### Requirement: Atomic send and Quoted gate
Sending a valid draft SHALL atomically mark that version `SENT`, record sender and server time, supersede the previous current sent version, transition an eligible Inquiry to `QUOTED`, increment the Inquiry version, and append status history plus metadata-only audit. No other endpoint SHALL create `QUOTED` without a sent quotation.

#### Scenario: Staff sends a valid draft
- **WHEN** an authorized staff account sends the current valid draft with matching quote and inquiry versions
- **THEN** all quotation and inquiry effects SHALL commit once and the sent version SHALL become immutable and customer-visible

#### Scenario: Any send prerequisite or write fails
- **WHEN** the draft is invalid/stale, the inquiry is ineligible, or a required write fails
- **THEN** the backend SHALL return a safe validation/conflict error and SHALL leave quotation, inquiry, history and audit state unchanged

### Requirement: Owner-safe quotation reads
Customer quotation list/detail endpoints SHALL include the authenticated inquiry owner in their database predicates and SHALL expose only `SENT` or later customer-visible versions through allowlisted DTOs. Drafts, internal cost, staff-only metadata and quotations belonging to another customer MUST remain undisclosed, and all private responses SHALL be `no-store`.

#### Scenario: Owner views a sent quotation
- **WHEN** the inquiry owner requests its current sent quotation
- **THEN** the backend SHALL return its version, number, item snapshots, computed amounts, validity and commercial terms without staff-only fields

#### Scenario: Customer probes a draft or foreign quotation
- **WHEN** a customer requests a draft, an unknown quotation, or a quotation for another owner's inquiry
- **THEN** the backend SHALL return the same safe 404 and disclose neither existence nor commercial data

### Requirement: Private deterministic PDF delivery
The backend SHALL render a PDF from the immutable sent snapshot and stream it only from authenticated owner-scoped or authorized staff endpoints. The response MUST use `application/pdf`, a safe filename and `Cache-Control: private, no-store`; public URLs, raw storage paths and draft PDFs are forbidden.

#### Scenario: Owner downloads the current PDF
- **WHEN** the owner requests a sent quotation PDF
- **THEN** the backend SHALL stream a valid PDF matching that exact version's stored values and SHALL not mutate business state

#### Scenario: Unauthorized PDF request
- **WHEN** an anonymous, non-owner, or staff account without the required capability requests the document
- **THEN** the backend SHALL return 401, safe 404, or 403 as appropriate and SHALL send no PDF bytes or private path

### Requirement: Responsive quotation interfaces
The Admin inquiry detail SHALL provide accessible Persian RTL draft, item, totals, revision and send controls; the customer detail SHALL provide sent-version cards and private PDF download. Both interfaces SHALL cover loading, empty, validation, conflict, success and disabled states without unintended overflow at 360, 390, 768 and 1280 pixels in light and dark themes.

#### Scenario: Staff edits line items on mobile
- **WHEN** the quotation editor is used at 360 or 390 pixels
- **THEN** item fields, amount labels, validation and actions SHALL remain readable and usable without a clipped desktop table or horizontal page scroll

#### Scenario: Customer has no sent quotation
- **WHEN** the owner opens an inquiry without a sent version
- **THEN** the UI SHALL show a neutral empty state and SHALL NOT imply a price, availability or delivery commitment

### Requirement: Customer notification on official quotation issuance
When an authorized sales representative or administrator transitions a quotation to `SENT` status, the backend SHALL dispatch an SMS notification to the inquiry owner's mobile number.

#### Scenario: Quotation issued and customer notified
- **WHEN** a quotation is successfully marked as `SENT`
- **THEN** an SMS notification containing the inquiry ID, quotation number, and a link to the customer account portal SHALL be dispatched to the customer's verified mobile number

