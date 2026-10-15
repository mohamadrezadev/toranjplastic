## MODIFIED Requirements

### Requirement: Admin-only content mutation
Every content create, update, publish, and archive endpoint SHALL require an authenticated active account with the content-management capability, which is granted only to `ADMIN` and `OPERATOR`, enforced server-side, and SHALL require a valid CSRF token on every mutating request. These endpoints MUST respond `Cache-Control: no-store`.

#### Scenario: Unauthenticated request attempts a mutation
- **WHEN** a request with no valid session cookie calls a content create, update, publish, or archive endpoint
- **THEN** the server SHALL respond `401` and SHALL NOT create, modify, or change the status of any record

#### Scenario: Authenticated account without content capability attempts a mutation
- **WHEN** a valid `CUSTOMER` or `SALES` session calls a content create, update, publish, or archive endpoint
- **THEN** the server SHALL respond `403` and SHALL NOT create, modify, or change the status of any record

#### Scenario: Operator mutates content
- **WHEN** an active `OPERATOR` submits a valid content mutation with a valid CSRF token
- **THEN** the backend SHALL perform the operation with the same validation, transaction, lifecycle, and audit guarantees used for an Administrator

#### Scenario: Authorized session without a valid CSRF token attempts a mutation
- **WHEN** an authenticated `ADMIN` or `OPERATOR` request omits the CSRF header or sends a CSRF value that does not match the session
- **THEN** the server SHALL reject the request and SHALL NOT create, modify, or change the status of any record

