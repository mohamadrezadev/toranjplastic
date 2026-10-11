## Why

The public catalog is ready, but the project has no trusted identity, session, or server-side authorization boundary. A secure foundation is required before any CMS mutation or private customer/admin workflow can be exposed.

## What Changes

- Persist customer accounts, password credentials, revocable sessions, and explicit `CUSTOMER`/`ADMIN` roles with `CUSTOMER` as the default.
- Add versioned registration, password login, current-session, and logout APIs using normalized Iranian mobile numbers, Argon2id password hashing, opaque session cookies, and non-enumerating authentication errors.
- Enforce authentication and Admin authorization in the NestJS backend and prove that UI manipulation cannot grant privileged access.
- Add a non-public, auditable bootstrap path for the first Admin; no public API may self-assign or elevate roles.
- Add Persian RTL login/registration surfaces and a protected Admin shell with `noindex` and `no-store` behavior.
- Apply rate limiting, CSRF defenses, sensitive-data redaction, session expiry/revocation, and negative security tests.
- Add a named, non-destructive Prisma migration with rollback/backup notes and document the new environment variables.
- Defer SMS delivery, OTP login/recovery, profile management, CMS mutation, inquiry workflows, and additional Sales/Operator roles until their operational decisions and dedicated changes are approved.
- This change does not add ecommerce, pricing, inventory, payment, capacity, certification, or delivery-time behavior.

## Capabilities

### New Capabilities
- `identity-accounts`: Customer-by-default account creation, normalized mobile identity, password credentials, account status, and secure initial Admin bootstrap.
- `session-authentication`: Password login, opaque cookie sessions, current-session lookup, logout, expiry/revocation, CSRF protection, rate limiting, and safe error/log behavior.
- `role-authorization`: Backend-enforced Customer/Admin authorization and private-page security boundaries.

### Modified Capabilities

None.

## Impact

- Backend: new identity/database modules, authentication endpoints under `/api/v1`, guards/decorators, rate limiting, hashing, session cookies, bootstrap tooling, and security tests.
- Database: new account, credential, session, and audit-related persistence with a named Prisma migration.
- Frontend: new `/auth/login`, `/auth/register`, and protected `/admin` foundations using existing RTL primitives and feedback states.
- Configuration: cookie/session secrets, trusted frontend origin, session lifetime, bootstrap inputs, and documented production requirements.
- Dependencies: a maintained Argon2 implementation and the minimum NestJS support needed for cookies and rate limiting.
