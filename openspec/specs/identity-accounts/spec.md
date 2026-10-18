# identity-accounts Specification

## Purpose
TBD - created by archiving change build-secure-identity-foundation. Update Purpose after archive.
## Requirements
### Requirement: Customer-by-default account persistence
The backend SHALL persist accounts with a unique normalized Iranian mobile number, display name, optional email and company name, explicit account status, one fixed role from `CUSTOMER`, `ADMIN`, `SALES`, or `OPERATOR`, creation time, update time, and optional last-login time. New public registrations MUST receive the `CUSTOMER` role and MUST NOT be able to choose or submit a privileged role.

#### Scenario: Customer registers with a valid mobile number
- **WHEN** a visitor registers with valid profile data and a mobile number in an accepted Iranian representation
- **THEN** the backend SHALL store one account with the canonical `+98` mobile form, an active status, and the `CUSTOMER` role

#### Scenario: Registration attempts privilege assignment
- **WHEN** a registration request includes `ADMIN`, `SALES`, `OPERATOR`, or any unknown role field
- **THEN** validation SHALL reject the request and no account SHALL be created

### Requirement: Unique non-enumerating mobile identity
The backend SHALL enforce normalized mobile uniqueness at the database boundary and SHALL return a generic conflict response that does not expose account status, credentials, sessions, or privileged role information.

#### Scenario: Equivalent mobile representation already exists
- **WHEN** registration supplies a mobile number that normalizes to an existing account mobile
- **THEN** the operation SHALL fail without creating a duplicate or returning private account fields

### Requirement: Secure password credentials
Password credentials SHALL be hashed with Argon2id using reviewed parameters, MUST never be stored or logged in plaintext, and MUST be omitted from every API response. Password inputs SHALL be length-bounded before hashing to prevent trivial passwords and resource-exhaustion input.

#### Scenario: Password account is stored
- **WHEN** a valid registration or authorized credential replacement succeeds
- **THEN** only an Argon2id hash SHALL be persisted and the original password SHALL not appear in persistence, response data, or application logs

### Requirement: Controlled initial Administrator bootstrap
The first `ADMIN` account SHALL be created or promoted only through a non-HTTP operator command using secret inputs outside Git. The command SHALL refuse to run after an Administrator exists and SHALL record a security audit event without recording the password or session token. After the first Administrator exists, additional `ADMIN`, `SALES`, and `OPERATOR` accounts MUST be created only through the authenticated staff-management capability.

#### Scenario: First Administrator is bootstrapped
- **WHEN** an operator runs the bootstrap command with valid secret inputs and no Administrator exists
- **THEN** exactly one active Administrator SHALL exist and an audit event SHALL identify the affected account and action

#### Scenario: Administrator already exists
- **WHEN** the bootstrap command runs after any Administrator exists
- **THEN** it SHALL fail closed without creating or promoting another account

#### Scenario: Additional privileged account is needed
- **WHEN** at least one Administrator already exists and another staff account is required
- **THEN** the account SHALL be created through the Administrator-only staff endpoint and the bootstrap command SHALL remain unavailable for that purpose

### Requirement: OTP operations remain unavailable until configured
SMS OTP issuance, verification, resend, and recovery MUST NOT be exposed until an approved provider, expiry, cooldown, attempt budget, and operational ownership are recorded in a later change.

#### Scenario: Client probes for OTP authentication
- **WHEN** a client requests an OTP route during this foundation change
- **THEN** no OTP handler SHALL exist and no placeholder code or successful delivery claim SHALL be produced

