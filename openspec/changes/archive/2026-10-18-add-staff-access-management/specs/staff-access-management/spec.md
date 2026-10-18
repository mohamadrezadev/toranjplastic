## ADDED Requirements

### Requirement: Fixed server-enforced staff capability matrix
The backend SHALL authorize every protected operation from the validated session account's current active status and fixed role: `ADMIN` SHALL receive staff, inquiry, and content-management capabilities; `SALES` SHALL receive inquiry-operation capabilities only; `OPERATOR` SHALL receive content-management capabilities only; and `CUSTOMER` SHALL receive no staff-management capability. Client navigation, submitted role fields, hidden controls, and stale session claims MUST NOT grant a capability.

#### Scenario: Sales attempts content mutation
- **WHEN** an active `SALES` account calls a protected content create, update, publish, or archive endpoint
- **THEN** the backend SHALL return 403 and SHALL perform no content or audit write

#### Scenario: Operator attempts inquiry operation
- **WHEN** an active `OPERATOR` account calls a protected inquiry list, detail, assignment, note, or status endpoint
- **THEN** the backend SHALL return 403 without disclosing inquiry data

#### Scenario: Customer forges a staff role
- **WHEN** a `CUSTOMER` supplies an Admin-like role or capability in a request body, query, or header
- **THEN** the backend SHALL ignore the forged privilege and return 403 without performing the operation

### Requirement: Administrator-controlled staff directory
The backend SHALL expose bounded, deterministic staff list and detail operations under `/api/v1/admin/staff` to active `ADMIN` accounts only. Staff DTOs SHALL be explicit, SHALL omit password hashes, credentials, sessions, CSRF values, and audit internals, and responses MUST use `Cache-Control: no-store`.

#### Scenario: Administrator lists staff
- **WHEN** an active `ADMIN` requests the staff list with valid role, status, page, and page-size filters
- **THEN** the backend SHALL return matching `ADMIN`, `SALES`, and `OPERATOR` accounts in deterministic order with bounded pagination and safe profile fields only

#### Scenario: Non-Administrator requests the staff directory
- **WHEN** an authenticated `SALES`, `OPERATOR`, or `CUSTOMER` requests a staff list or detail endpoint
- **THEN** the backend SHALL return 403 and SHALL disclose no staff record or count

### Requirement: Administrator can create a staff account
An active `ADMIN` SHALL be able to create an active staff account with a unique normalized Iranian mobile number, display name, initial password, and exactly one role from `ADMIN`, `SALES`, or `OPERATOR`. The backend SHALL strictly validate and bound the payload, hash the initial password with the approved Argon2id policy, and MUST NOT return or log the plaintext password.

#### Scenario: Administrator creates a Sales account
- **WHEN** an active `ADMIN` submits valid staff details with role `SALES`
- **THEN** exactly one active Sales account and one metadata-only audit event SHALL commit atomically, and the response SHALL omit all credential material

#### Scenario: Staff creation requests Customer or an unknown role
- **WHEN** a staff creation request supplies `CUSTOMER`, an unknown role, or an extra unapproved field
- **THEN** validation SHALL return 400 and no account or audit event SHALL be created

#### Scenario: Staff mobile already exists
- **WHEN** a staff creation request normalizes to an existing account mobile number
- **THEN** the backend SHALL return a generic conflict without exposing the existing account's role, status, or credentials

### Requirement: Safe staff role and status lifecycle
An active `ADMIN` SHALL be able to change another staff account among `ADMIN`, `SALES`, and `OPERATOR`, and to activate or disable that account, using a non-negative `expectedVersion`. Staff accounts MUST NOT be hard-deleted. The backend SHALL reject self-demotion, self-disable, changes to `CUSTOMER` accounts through the staff API, and any operation that would leave zero active Administrators.

#### Scenario: Administrator changes another staff role
- **WHEN** an active `ADMIN` submits an allowed role and the current expected version for another staff account
- **THEN** the role and version SHALL update and one audit event SHALL commit atomically

#### Scenario: Two Administrators update the same staff version
- **WHEN** two valid mutations use the same current expected version
- **THEN** exactly one SHALL commit and the other SHALL return a stable 409 version-conflict response without an additional account or audit change

#### Scenario: Last active Administrator would be removed
- **WHEN** a role or status mutation would demote or disable the only active `ADMIN`
- **THEN** the backend SHALL return a stable 409 last-Administrator conflict and SHALL preserve the account, version, sessions, and audit state

#### Scenario: Administrator changes own privileged access
- **WHEN** an `ADMIN` attempts to demote or disable the account belonging to the current session
- **THEN** the backend SHALL reject the mutation without changing account, session, or audit state

### Requirement: Privilege changes revoke affected sessions
Every successful staff role or status change SHALL revoke all active sessions belonging to the affected account in the same transaction as the account and audit changes. Subsequent use of a revoked session MUST return 401; changing another account MUST NOT revoke the acting Administrator's session.

#### Scenario: Sales account is disabled while signed in
- **WHEN** an Administrator successfully disables a `SALES` account that has active sessions
- **THEN** all of that account's sessions SHALL be revoked atomically and its next authenticated request SHALL return 401

#### Scenario: Session revocation fails
- **WHEN** session revocation cannot be persisted during a role or status change
- **THEN** the account, version, session, and audit changes SHALL all roll back and the endpoint SHALL NOT report success

### Requirement: Staff lifecycle is metadata-only audited
Every successful staff creation, role change, and status change SHALL write an audit event containing the acting account identifier, affected account identifier, action, previous and next non-sensitive role or status values where applicable, and server timestamp. Audit metadata MUST NOT contain passwords, password hashes, mobile numbers, email addresses, names, session identifiers, tokens, or raw request payloads.

#### Scenario: Administrator changes a staff role
- **WHEN** a valid role change succeeds
- **THEN** exactly one role-change audit event SHALL identify the actor, target, previous role, next role, and resulting version without personal or credential data

### Requirement: Sales inquiry operation and assignment eligibility
Active `SALES` accounts SHALL be authorized for the existing inquiry list, summary, detail, assignment, internal-note, and approved status-transition operations. An inquiry assignee SHALL be null or an active `ADMIN` or active `SALES` account; `CUSTOMER`, `OPERATOR`, suspended, disabled, and unknown accounts MUST be rejected as assignees. Existing customer response isolation and inquiry atomicity requirements SHALL remain unchanged.

#### Scenario: Sales operates an inquiry
- **WHEN** an active `SALES` account performs a valid inquiry assignment, note, or allowed status transition
- **THEN** the operation SHALL use the same validation, concurrency, history, audit, and privacy guarantees as the existing Administrator operation

#### Scenario: Operator is selected as assignee
- **WHEN** a staff member attempts to assign an inquiry to an `OPERATOR`
- **THEN** the backend SHALL return `409 INQUIRY_INVALID_ASSIGNEE` and make no assignment, version, history, or audit change

### Requirement: Responsive capability-aware staff workspace
The frontend SHALL provide Persian RTL staff list, create, and detail/edit experiences inside the shared management shell. Navigation and actions SHALL be derived from the authenticated account's returned capabilities for usability, while the backend remains authoritative. Loading, empty, error, success, validation, disabled, forbidden, version-conflict, and focus states SHALL remain usable in light and dark themes without unintended document overflow at 360, 390, 768, and 1280 pixels.

#### Scenario: Administrator manages staff on mobile
- **WHEN** an active `ADMIN` uses the staff list and forms at 360 or 390 pixels
- **THEN** records SHALL use a readable mobile presentation, fields and actions SHALL remain touch-accessible, and no page-level horizontal overflow SHALL occur

#### Scenario: Sales opens the management shell
- **WHEN** an active `SALES` account opens `/admin`
- **THEN** the shell SHALL expose inquiry navigation, omit staff and CMS navigation, and render no data from forbidden areas

#### Scenario: Operator opens the management shell
- **WHEN** an active `OPERATOR` account opens `/admin`
- **THEN** the shell SHALL expose all six CMS areas, including category management, omit staff and inquiry navigation, and render no data from forbidden areas

