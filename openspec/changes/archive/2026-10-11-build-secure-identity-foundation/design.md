## Context

The repository currently has public read-only content APIs and public Next.js pages, but no account, credential, session, or authorization model. CMS mutation cannot safely begin until the backend has an identity boundary that cannot be bypassed by client-side state. PRD 02 requires mobile/password and OTP login; PRD 07 requires Argon2id or equivalent, rate limiting, secure cookies, CSRF defense, and a secure initial Admin path. The SMS provider and OTP operating limits are not approved, so this change establishes the password/session/RBAC foundation without simulating SMS delivery.

## Goals / Non-Goals

**Goals:**

- Establish Customer-by-default accounts, password authentication, revocable sessions, and backend-enforced `CUSTOMER`/`ADMIN` authorization.
- Make the first Administrator bootstrap non-public, repeat-safe, auditable, and fail-closed after initial use.
- Provide minimum Persian RTL registration/login and Admin-boundary UI needed to exercise the contracts.
- Add security failure tests, migration/rollback evidence, private caching/indexing controls, and documented configuration.

**Non-Goals:**

- SMS/OTP delivery, verification, resend, or recovery before provider and operating policy approval.
- Profile editing, inquiry ownership, file access, CMS mutation, preview, audit viewer, or general user management.
- Sales/Operator permissions before a product-approved permission matrix.
- Ecommerce, prices, inventory, payments, capacity, certification, or delivery commitments.

## Decisions

### Identity and persistence boundary

Add an `IdentityModule` that owns account, credential, session, and security-audit persistence. Other backend modules may consume its exported authorization services/contracts but MUST NOT import its repository internals. Prisma gains `User`, `PasswordCredential`, `AuthSession`, and `SecurityAuditEvent` models plus `UserRole` (`CUSTOMER`, `ADMIN`) and `AccountStatus` (`ACTIVE`, `SUSPENDED`, `DISABLED`) enums.

Mobile numbers are stored only in canonical `+989XXXXXXXXX` form. The API accepts the common `09XXXXXXXXX`, `989XXXXXXXXX`, `00989XXXXXXXXX`, and `+989XXXXXXXXX` representations and rejects all other structures. The database unique constraint is the final concurrency boundary.

Alternative considered: storing raw and normalized numbers. Rejected because the raw value is not needed for authentication and expands personal-data retention.

### Password and login behavior

Passwords are accepted only within a bounded 10–128 character range and are hashed with Argon2id using explicit reviewed parameters. Login performs a dummy hash verification for unknown users to reduce timing-based enumeration and returns one generic Persian-facing authentication error for unknown user, wrong password, and inactive account.

Alternative considered: JWT access tokens. Rejected because the current browser-only system needs immediate revocation, server-side session management, and simpler secret containment rather than bearer tokens exposed to JavaScript.

### Opaque sessions and cookie transport

Login generates a 256-bit random token. Only a SHA-256 digest is stored with user id, expiry, revocation time, creation time, last-seen time, and minimal client metadata. The raw token exists only in an HttpOnly cookie. Authentication compares the digest, account status, expiry, and revocation state. Login rotates a presented session; logout revokes it and expires the cookie.

The production cookie is `Secure`, `HttpOnly`, `SameSite=Lax`, host-only, and scoped to `/`. Development may omit `Secure` only through an explicit environment mode. Private API responses use `Cache-Control: no-store`.

Alternative considered: stateless signed cookies. Rejected because forced logout, account suspension, and later privileged-session review require server-side revocation.

### CSRF, Origin, and CORS

All unsafe auth requests validate the exact configured frontend Origin. Authenticated unsafe requests also use a double-submit CSRF token: a random readable `toranj_csrf` cookie must equal the `x-csrf-token` header and the session-bound token digest. The CSRF bootstrap endpoint issues/rotates this proof without authenticating the caller. CORS permits only the configured frontend origin with credentials.

Alternative considered: relying only on SameSite. Rejected because cookie policy can evolve and explicit Origin/CSRF checks provide a stronger mutation boundary.

### Rate limiting

Authentication applies an in-process bounded limiter keyed by route plus trusted client address and, after normalization, a one-way digest of the mobile number. Production deployment remains single-process for this change; a distributed store becomes mandatory before horizontal scaling. Limits and windows are environment-validated, with conservative defaults documented in `.env.example`.

Alternative considered: Redis immediately. Rejected because no Redis operational dependency exists yet; the deployment limitation is explicit and tested.

### Initial Administrator bootstrap

`pnpm --filter backend admin:bootstrap` runs a Nest application context without opening HTTP. It reads mobile, display name, and password from dedicated environment variables, executes one transaction, refuses if any Admin exists, creates or promotes the matching account, and writes a security audit event. Secrets are never command-line arguments or log fields. Subsequent role management is out of scope.

### API and frontend boundary

The versioned backend API adds:

- `GET /api/v1/auth/csrf`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login/password`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/admin/access` as a minimal protected contract probe

Explicit response DTOs contain only id, normalized mobile, display name, optional email/company, role, status, and approved timestamps. The frontend adds `/auth/register`, `/auth/login`, and `/admin`. Browser form submissions go through same-origin Next.js route handlers that forward approved fields and Set-Cookie headers to the backend, avoiding public exposure of backend configuration and keeping mutation orchestration server-side.

### Test strategy

- Unit: normalization, password bounds/hashing, token digesting, session expiry/revocation, rate-limit keys, CSRF/Origin validation, and guards.
- Integration: migration constraints, registration races, login rotation, logout, no-store headers, 401/403 distinctions, bootstrap fail-closed behavior, and sensitive-field omission.
- Frontend/component: Persian validation and loading/error/disabled/focus states.
- E2E: register, login, refresh/session restore, Customer rejection from `/admin`, Admin access, logout, and required viewport/theme checks.

## Risks / Trade-offs

- [In-memory rate limits reset on restart and do not coordinate across replicas] → document single-instance scope, emit no sensitive keys, and require a shared limiter before scaling horizontally.
- [Mobile or password policy may later change] → isolate normalization and credential policy behind Identity services and record changes in a new OpenSpec delta.
- [Database compromise exposes session digests and password hashes] → use high-entropy tokens, Argon2id, short bounded session lifetime, revocation, least-privilege DB access, and backup controls.
- [Bootstrap environment secrets may leak operationally] → read them only in the command process, never echo them, clear documentation examples of values, and fail before partial writes.
- [Frontend/backend cookie forwarding can be implemented incorrectly] → centralize the server-side auth client and test Set-Cookie, CSRF, cache, and redirect behavior.
- [Deferred OTP means PRD 02 is not complete] → expose no OTP façade and schedule a dedicated change only after the provider and operating limits are approved.

## Migration Plan

1. Add and validate environment variables without changing public traffic.
2. Apply the named additive identity migration and verify constraints on an empty and representative database.
3. Deploy backend endpoints with no Admin account and no CMS mutation endpoints.
4. Run the one-time bootstrap command through the protected operator environment and verify its audit event.
5. Deploy the auth pages and protected Admin shell; run authorization and browser E2E gates.
6. Roll back application code first if needed. The additive tables can remain dormant; destructive rollback requires an explicit backup and the migration `ROLLBACK.md` procedure.

## Open Questions

- Which SMS provider, sender identity, delivery observability, expiry, cooldown, and attempt budget will be approved for the later OTP change?
- Which verified channel will be used for password recovery?
- What retention periods apply to revoked sessions, security audit events, and disabled-account personal data?
- When Sales/Operator roles are introduced, what exact permission matrix and role-grant workflow will be approved?
