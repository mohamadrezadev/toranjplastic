# role-authorization Specification

## Purpose
TBD - created by archiving change build-secure-identity-foundation. Update Purpose after archive.
## Requirements
### Requirement: Backend-enforced authenticated and Administrator access
Protected backend operations SHALL derive identity, active account status, role, and capabilities only from a validated server-side session and current server-side account state. `ADMIN` SHALL receive staff, inquiry, and content-management capabilities; `SALES` SHALL receive inquiry-operation capabilities; `OPERATOR` SHALL receive content-management capabilities; and `CUSTOMER` SHALL receive no management capability. UI state, request body fields, query parameters, client headers, and hidden controls MUST NOT grant authentication or a protected capability.

#### Scenario: Customer calls an Administrator probe
- **WHEN** an authenticated `CUSTOMER` calls an endpoint requiring any management capability
- **THEN** the backend SHALL return HTTP 403 without performing the protected operation

#### Scenario: Staff member calls outside assigned capability
- **WHEN** an authenticated `SALES` or `OPERATOR` calls an endpoint outside that role's fixed capability set
- **THEN** the backend SHALL return HTTP 403 without performing the protected operation or disclosing protected data

#### Scenario: Anonymous caller supplies a forged role
- **WHEN** an unauthenticated request supplies a privileged body field or header
- **THEN** the backend SHALL return HTTP 401 and ignore the forged role

### Requirement: Safe authorization failure boundaries
Authorization failures SHALL distinguish unauthenticated HTTP 401 from authenticated-but-forbidden HTTP 403 while omitting protected resource data, internal permission structure, session details, and stack traces.

#### Scenario: Forbidden response is inspected
- **WHEN** a Customer receives a forbidden response from an Administrator endpoint
- **THEN** the response SHALL contain the standard API error contract and no privileged data

### Requirement: Private authentication and Admin pages
The frontend SHALL provide Persian RTL registration and login pages plus a protected management shell under `/admin`. Authentication and management responses SHALL be non-indexable and non-cacheable. The shell SHALL redirect unauthenticated users to login, SHALL render a permission-safe forbidden state for Customers, and SHALL expose only destinations allowed by the active staff account's server-derived capabilities without treating hidden navigation as authorization.

#### Scenario: Anonymous visitor opens the Admin shell
- **WHEN** an unauthenticated visitor requests `/admin`
- **THEN** the frontend SHALL redirect to `/auth/login` without rendering protected management content

#### Scenario: Customer opens the Admin shell
- **WHEN** an authenticated Customer requests `/admin`
- **THEN** the frontend SHALL show a Persian access-denied state and MUST NOT render staff navigation or management data

#### Scenario: Staff member opens a forbidden management route
- **WHEN** an authenticated `SALES` or `OPERATOR` requests an `/admin` route outside that role's capabilities
- **THEN** the frontend SHALL render a permission-safe forbidden state and MUST NOT render the route's protected data

### Requirement: Responsive accessible authentication presentation
Registration, login, session feedback, and authorization failure states SHALL be keyboard operable, Persian RTL, understandable without color alone, and free of unintended horizontal scrolling in light and dark themes at 360, 390, 768, and 1280 pixel widths.

#### Scenario: Login is used at a required viewport
- **WHEN** the login page is rendered in either theme at 360, 390, 768, or 1280 pixels
- **THEN** fields, validation, feedback, submit state, and navigation SHALL remain readable, focus-visible, and usable without clipping or overlap

### Requirement: Quotation management capability
The server-derived `QUOTATION_MANAGEMENT` capability SHALL be granted to active `ADMIN` and `SALES` accounts and denied to `OPERATOR` and `CUSTOMER` accounts. Creating, editing, revising, sending, and staff-downloading a quotation MUST enforce this capability in the backend regardless of visible UI controls.

#### Scenario: Sales sends a quotation
- **WHEN** an active Sales session with `QUOTATION_MANAGEMENT` submits a valid send command
- **THEN** the backend SHALL authorize and attribute the command to that Sales account

#### Scenario: Operator forges quotation capability
- **WHEN** an Operator supplies a capability-like header/body value or invokes a hidden Admin action
- **THEN** the backend SHALL return 403 and SHALL persist no quotation, inquiry, history or audit change

### Requirement: Customer response and post-acceptance authorization
The backend SHALL reserve quotation accept/reject actions to the owning active Customer account and SHALL reserve `ACCEPTED -> IN_PROGRESS -> COMPLETED` Inquiry transitions to active staff with `INQUIRY_OPERATIONS`. Neither hidden UI, a forged role/capability, nor knowledge of identifiers SHALL grant either operation.

#### Scenario: Sales advances an accepted inquiry
- **WHEN** active Sales with `INQUIRY_OPERATIONS` performs a valid post-acceptance transition
- **THEN** the backend SHALL authorize and attribute the operation to that Sales account

#### Scenario: Admin attempts to accept for the customer
- **WHEN** staff calls a customer acceptance endpoint for an inquiry it does not own
- **THEN** the backend SHALL not create a customer acceptance and SHALL make no state change

### Requirement: Inquiry messaging authorization
The backend SHALL allow an active `ADMIN` or `SALES` account with `INQUIRY_OPERATIONS` to read and append customer-visible inquiry messages. `OPERATOR`, `CUSTOMER` on Admin routes, inactive accounts, forged client capabilities, and UI-only access MUST NOT grant this staff operation; a customer MAY use only owner-scoped customer message routes.

#### Scenario: Sales replies to an inquiry
- **WHEN** an active Sales account with server-derived `INQUIRY_OPERATIONS` sends a valid staff message
- **THEN** the backend SHALL authorize the operation and attribute it to that account

#### Scenario: Operator calls the staff message endpoint
- **WHEN** an active Operator without `INQUIRY_OPERATIONS` calls the endpoint
- **THEN** the backend SHALL return 403 and SHALL make no persistent change

