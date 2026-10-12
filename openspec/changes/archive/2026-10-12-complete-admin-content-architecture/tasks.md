## 1. PostgreSQL Atomicity Verification

- [x] 1.1 Add a dedicated backend PostgreSQL integration test setup using the repository's pinned PostgreSQL 17 version; require an explicitly isolated test database and fail closed for missing/unsafe configuration.
- [x] 1.2 Exercise the real Prisma admin-content Unit of Work with persisted content and audit rows; prove successful commit and rollback on audit-write and content-write failures, including no leaked partial rows.
- [x] 1.3 Add explicit backend/root integration scripts, safe test-data cleanup, and documentation for local invocation; run against disposable local PostgreSQL.
- [x] 1.4 Add a PostgreSQL 17 service with health readiness to CI and run the non-skippable integration suite.

## 2. Frontend Feature Extraction

- [x] 2.1 Define a dependency-neutral shared admin-content contract/helper surface and public entrypoints for category, product, material, service, article, and managed-page features.
- [x] 2.2 Move per-resource API types, parsers, transport calls, actions, and form mapping into feature-owned modules without changing validation, HTTP calls, redirects, or behavior.
- [x] 2.3 Update all six admin route trees and tests to consume owning feature public entrypoints; remove obsolete aggregate client/actions/mapping files after references are eliminated.
- [x] 2.4 Verify all six resource admin flows and responsive/RTL behavior at 360, 390, 768, and 1280 pixels; preserve existing route URLs and no-store/security behavior.

## 3. Architecture Boundary Gate

- [x] 3.1 Implement a deterministic boundary checker for frontend-to-backend imports, feature deep imports, and cycles with TypeScript aliases accounted for.
- [x] 3.2 Add positive allowed-import cases and negative fixtures for each forbidden boundary; prove checker output identifies violations.
- [x] 3.3 Wire the checker into root quality scripts and CI; document allowed public entrypoints and the local command.

## 4. Evidence and Handoff

- [x] 4.1 Update architecture documentation and root/backend/frontend agent guidance with ownership boundaries, scripts, CI evidence, and code-only rollback steps; do not alter the scope of product rules.
- [x] 4.2 Run OpenSpec validation, lint, typecheck, unit/integration suites, backend contract E2E, frontend E2E at all required viewports, architecture boundary checks, PostgreSQL integration, and builds; record exact results and any baseline/performance limitation.
- [x] 4.3 Verify no API/schema/migration or visible product behavior changed, then prepare the change for archive only after every acceptance item is evidenced.

### Verification evidence

- `openspec validate complete-admin-content-architecture --strict`: passed.
- `pnpm check`: passed (lint, typecheck, backend unit 78/78, frontend unit 60/60, production builds).
- `pnpm check:architecture`: passed; all 4 boundary fixtures passed.
- `pnpm test:integration:postgres`: passed 3/3 against disposable PostgreSQL 17; migration deploy applied all 3 existing migrations.
- `pnpm test:e2e:backend`: passed 29/29.
- `pnpm test:e2e:frontend`: passed 87/87; one existing desktop-only mobile-drawer test intentionally skipped. Admin list/detail/new and mutation flows covered at 360, 390, 768, and 1280 pixels.
- No Prisma schema or migration changes; API contracts, route URLs, and visible product behavior are unchanged. No valid before/after performance baseline exists, so no performance claim is made.
