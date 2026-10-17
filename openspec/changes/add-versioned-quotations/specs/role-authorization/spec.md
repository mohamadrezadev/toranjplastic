## ADDED Requirements

### Requirement: Quotation management capability
The server-derived `QUOTATION_MANAGEMENT` capability SHALL be granted to active `ADMIN` and `SALES` accounts and denied to `OPERATOR` and `CUSTOMER` accounts. Creating, editing, revising, sending, and staff-downloading a quotation MUST enforce this capability in the backend regardless of visible UI controls.

#### Scenario: Sales sends a quotation
- **WHEN** an active Sales session with `QUOTATION_MANAGEMENT` submits a valid send command
- **THEN** the backend SHALL authorize and attribute the command to that Sales account

#### Scenario: Operator forges quotation capability
- **WHEN** an Operator supplies a capability-like header/body value or invokes a hidden Admin action
- **THEN** the backend SHALL return 403 and SHALL persist no quotation, inquiry, history or audit change
