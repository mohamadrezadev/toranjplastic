# Secure identity foundation handoff

## Scope delivered

- Customer-by-default accounts with canonical Iranian mobile identity
- Argon2id password credentials
- opaque, digest-only, revocable database sessions
- Origin and session-bound CSRF checks for unsafe authenticated requests
- backend-enforced Customer/Admin guards
- one-time non-HTTP initial Admin bootstrap
- Persian RTL login, registration, and protected Admin shell

SMS OTP, password recovery, profile management, CMS mutation, and Sales/Operator permissions remain deferred to approved OpenSpec changes.

## Deployment order

1. Configure `DATABASE_URL`, `FRONTEND_ORIGIN`, auth limits, session lifetime, and secure-cookie mode through secret/environment management.
2. Apply Prisma migrations before deploying the identity-enabled backend.
3. Run `pnpm --filter backend admin:bootstrap` exactly once with `BOOTSTRAP_ADMIN_MOBILE`, `BOOTSTRAP_ADMIN_DISPLAY_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` supplied only to that operator process.
4. Confirm the `INITIAL_ADMIN_BOOTSTRAPPED` audit event and remove bootstrap secrets from the runtime environment.
5. Deploy the frontend and verify registration, login, Customer rejection from `/admin`, Admin access, and logout over HTTPS.

Never put bootstrap values in Git, shell history, CI logs, or documentation. The command refuses to run after any Admin exists.

## Migration evidence and rollback

Both repository migrations were applied successfully to an isolated PostgreSQL 17 database on 2026-10-11, and Prisma reported the schema up to date. The project-local database was not changed because port 5432 belonged to another project.

The identity migration is additive. Normal application rollback leaves the new tables dormant. Any destructive database rollback requires a verified backup and the procedure in `backend/prisma/migrations/20261011100000_secure_identity_foundation/ROLLBACK.md`.

## Verification

- `pnpm check`
- `pnpm --filter backend test:e2e`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=<system-chrome> pnpm test:e2e`
- `openspec validate --all --strict`

The Playwright CDN is unavailable from the current location; local verification used the installed system Chrome. CI continues to install its pinned Chromium before E2E.
