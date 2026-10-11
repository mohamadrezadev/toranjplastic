# session-authentication Specification

## Purpose
TBD - created by archiving change build-secure-identity-foundation. Update Purpose after archive.
## Requirements
### Requirement: Versioned password authentication endpoints
The backend SHALL expose registration, password login, current-session, CSRF bootstrap, and logout operations below `/api/v1/auth`. Authentication failures MUST use a generic contract that does not reveal whether a mobile number, account status, password, or session record caused the failure.

#### Scenario: Active account logs in with a valid password
- **WHEN** an active account submits its normalized mobile identity and correct password within rate limits
- **THEN** the backend SHALL rotate any supplied session, create a new revocable session, update last-login time, and return only the approved account summary

#### Scenario: Login credentials are invalid
- **WHEN** the mobile number is unknown, the password is wrong, or the account is not active
- **THEN** the backend SHALL return the same generic unauthorized response and MUST NOT create a session

### Requirement: Opaque revocable cookie sessions
Authentication SHALL use a cryptographically random opaque token in an HttpOnly cookie while persisting only its one-way digest. Session records SHALL have absolute expiry and revocation timestamps, and logout SHALL revoke the server-side session and expire the browser cookie.

#### Scenario: Valid session requests current account
- **WHEN** a request presents a non-expired and non-revoked session cookie
- **THEN** the backend SHALL return the approved account summary with `Cache-Control: no-store`

#### Scenario: Revoked or expired session is reused
- **WHEN** a request presents a revoked, expired, malformed, or unknown session token
- **THEN** the backend SHALL reject it as unauthenticated without exposing session internals

### Requirement: Cookie and cross-site request protections
Production authentication cookies SHALL be `HttpOnly`, `Secure`, path-scoped appropriately, and use an approved `SameSite` policy. Every unsafe browser request SHALL validate its Origin against the configured frontend origin, and authenticated unsafe requests SHALL additionally require a CSRF token bound to the session.

#### Scenario: Authenticated logout lacks CSRF proof
- **WHEN** a browser sends logout with a valid session cookie but missing or mismatched CSRF proof
- **THEN** the backend SHALL reject the request and keep the session active

#### Scenario: Unsafe request comes from an untrusted Origin
- **WHEN** registration, login, or logout is sent with an Origin outside the configured allowlist
- **THEN** the backend SHALL reject it before changing account or session state

### Requirement: Authentication rate limiting
Registration, password login, and other sensitive authentication operations SHALL enforce bounded attempt budgets using both client address and normalized mobile identity where available. A limited request SHALL return a stable error without performing password hashing or revealing account existence.

#### Scenario: Login attempt budget is exceeded
- **WHEN** a client exceeds the configured login budget for an address or mobile identity
- **THEN** subsequent attempts SHALL return HTTP 429 for the configured window and MUST NOT create a session

### Requirement: Sensitive authentication data is private
Passwords, password hashes, raw session tokens, session digests, cookie values, and future OTP values MUST NOT appear in API bodies or application logs. Authentication and account responses SHALL use explicit DTOs and private responses SHALL use `no-store` caching.

#### Scenario: Authentication operation fails internally
- **WHEN** an unexpected authentication error is logged and returned
- **THEN** logs and responses SHALL omit credential and token values while retaining a correlation-safe error signal

