## 1. Contract and persistence

- [x] 1.1 Add reviewed backend dependencies and validated auth/session/origin/rate-limit/bootstrap environment configuration; document every new variable in `.env.example`.
- [x] 1.2 Add Prisma identity enums/models/indexes and a named additive migration with `ROLLBACK.md` backup and rollback guidance.
- [x] 1.3 Add migration/schema tests proving mobile uniqueness, Customer default, session relations, and non-destructive SQL.

## 2. Identity and session core

- [x] 2.1 Implement and unit-test Iranian mobile normalization, bounded password policy, Argon2id hashing/verification, and constant-work invalid login behavior.
- [x] 2.2 Implement Identity-owned repositories and explicit public account DTO mapping without credential, session, or audit leakage.
- [x] 2.3 Implement and unit-test opaque token generation/digesting, persisted session creation/rotation, expiry/revocation, and current-user lookup.
- [x] 2.4 Implement and test Origin validation, session-bound CSRF proof, cookie policy, sensitive authentication rate limits, and `no-store` responses.

## 3. API and authorization

- [x] 3.1 Add `/api/v1/auth` CSRF, registration, password-login, current-session, and logout contracts with strict DTO validation and generic authentication failures.
- [x] 3.2 Add reusable authenticated/Admin guards and the minimal `/api/v1/admin/access` probe with explicit 401/403 failure tests.
- [x] 3.3 Add backend integration tests for registration, duplicate/role injection rejection, login rotation, inactive/wrong/unknown login equivalence, CSRF/Origin rejection, logout, rate limiting, private cache headers, and sensitive-field omission.
- [x] 3.4 Add the fail-closed, non-HTTP first-Admin bootstrap command and tests for one-time behavior and redacted audit output.

## 4. Private frontend foundation

- [x] 4.1 Add a centralized same-origin frontend auth boundary that forwards approved payloads/cookies/CSRF and validates account responses without exposing backend configuration.
- [x] 4.2 Build Persian RTL `/auth/register` and `/auth/login` pages with validation, loading, error, disabled, keyboard, focus, light/dark, and private metadata/cache behavior.
- [x] 4.3 Build the protected `/admin` shell with anonymous redirect, Customer forbidden state, Admin-only content boundary, and `noindex`/`no-store` behavior.
- [x] 4.4 Add component and Playwright coverage for registration/login/session/logout, Customer/Admin access, and 360/390/768/1280 light/dark layouts.

## 5. Verification and handoff

- [x] 5.1 Generate Prisma client, validate/apply the migration on PostgreSQL, and capture rollback/bootstrap/deployment notes without secret values.
- [x] 5.2 Run lint, typecheck, unit/integration tests, build, browser E2E, sensitive-log review, and `openspec validate --all --strict`; document any environment-only limitation.
