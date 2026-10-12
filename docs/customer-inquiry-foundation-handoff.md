# Customer inquiry foundation handoff

## Scope delivered

- Four authenticated PRD 04 request forms: product, injection service, material supply, and general contact
- Owner-scoped customer list/detail APIs and Persian RTL portal screens
- `Submitted` creation plus status history in one transaction
- Explicit customer DTO allowlists, `no-store` responses, private `noindex` pages, CSRF enforcement, and uniform cross-owner not-found behavior
- Catalog CTA prefill for published products, services, and materials

Attachments, messages, admin handling, status transitions, assignment, notifications, quotations, and prices remain deferred to approved future changes.

## Deployment

1. Back up PostgreSQL according to the environment runbook.
2. Apply `20261012120000_customer_inquiry_foundation` before deploying the new backend.
3. Deploy backend, then frontend.
4. Verify authenticated create/list/detail and cross-owner denial over HTTPS.

Normal application rollback deploys the previous applications and leaves the additive schema dormant. Destructive rollback requires a verified backup and the migration-local `ROLLBACK.md` procedure.

## Verification evidence

- Prisma generate and validate: passed.
- Backend typecheck, 83 unit tests, 32 e2e tests, and production build: passed.
- Frontend typecheck, 62 unit/component tests, architecture checks, and production build: passed.
- Playwright inquiry flow: verified at 360, 390, 768, and 1280 pixels; light and dark themes are covered by the inquiry test.
- Full Playwright run reached 87 passing and one expected desktop mobile-drawer skip; four auth cases initially used a stale pre-fix build, and the complete auth file was rebuilt and rerun with all 12 cases passing.
- A disposable local database named `toranj_inquiry_test_20261012` was created on the dedicated Toranj PostgreSQL container, but Prisma migration deployment stopped with a schema-engine connection/configuration error before applying migrations. The integration suite therefore remains unverified; its guard correctly rejects missing or malformed test database URLs.
