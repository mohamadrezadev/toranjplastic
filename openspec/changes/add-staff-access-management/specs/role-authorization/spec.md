## MODIFIED Requirements

### Requirement: Backend-enforced authenticated and Administrator access
Protected backend operations SHALL derive identity, active account status, role, and capabilities only from a validated server-side session and current server-side account state. `ADMIN` SHALL receive staff, inquiry, and content-management capabilities; `SALES` SHALL receive inquiry-operation capabilities; `OPERATOR` SHALL receive content-management capabilities; and `CUSTOMER` SHALL receive no management capability. UI state, request body fields, query parameters, client headers, and hidden controls MUST NOT grant authentication or a protected capability.

#### Scenario: Customer calls a protected management endpoint
- **WHEN** an authenticated `CUSTOMER` calls an endpoint requiring any management capability
- **THEN** the backend SHALL return HTTP 403 without performing the protected operation

#### Scenario: Staff member calls outside assigned capability
- **WHEN** an authenticated `SALES` or `OPERATOR` calls an endpoint outside that role's fixed capability set
- **THEN** the backend SHALL return HTTP 403 without performing the protected operation or disclosing protected data

#### Scenario: Anonymous caller supplies a forged role
- **WHEN** an unauthenticated request supplies a privileged body field or header
- **THEN** the backend SHALL return HTTP 401 and ignore the forged role

### Requirement: Private authentication and Admin pages
The frontend SHALL provide Persian RTL registration and login pages plus a protected management shell under `/admin`. Authentication and management responses SHALL be non-indexable and non-cacheable. The shell SHALL redirect unauthenticated users to login, SHALL render a permission-safe forbidden state for Customers, and SHALL expose only destinations allowed by the active staff account's server-derived capabilities without treating hidden navigation as authorization.

#### Scenario: Anonymous visitor opens the management shell
- **WHEN** an unauthenticated visitor requests `/admin`
- **THEN** the frontend SHALL redirect to `/auth/login` without rendering protected management content

#### Scenario: Customer opens the management shell
- **WHEN** an authenticated Customer requests `/admin`
- **THEN** the frontend SHALL show a Persian access-denied state and MUST NOT render staff navigation or management data

#### Scenario: Staff member opens a forbidden management route
- **WHEN** an authenticated `SALES` or `OPERATOR` requests an `/admin` route outside that role's capabilities
- **THEN** the frontend SHALL render a permission-safe forbidden state and MUST NOT render the route's protected data

