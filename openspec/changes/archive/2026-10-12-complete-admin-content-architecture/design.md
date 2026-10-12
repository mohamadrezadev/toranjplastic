## Context

The completed `refactor-admin-content-boundaries` change split backend CMS resources and introduced an `AdminContentUnitOfWork`. Its rollback test uses a transactional fake, and current CI runs API E2E tests without a PostgreSQL service. On the frontend, resource forms live in route folders while API clients, server actions, and form mapping are centralized in `lib/admin-content.ts` and `app/admin/content/`.

The accepted v1.2 handoff and current OpenSpec specs remain authoritative. This is a structural refactor only: preserve `/api/v1`, authentication, CSRF, validation, caching, response shapes, route URLs, and user-visible behavior. Do not add Inquiry/Quotation functionality or invent business data.

## Goals / Non-Goals

**Goals:** complete feature ownership for six admin CMS resources; prove transaction rollback with PostgreSQL; prevent forbidden imports in CI; provide traceable verification and rollback instructions.

**Non-Goals:** schema or migration changes, API changes, new dependencies unless the existing stack cannot satisfy an acceptance test, changing UI design, moving backend directories into a new physical module layout, or adding product capabilities.

## Decisions

1. **Feature modules own frontend CMS logic.** Place per-resource server-only API client/types, server actions, and form parsing under `frontend/src/features/admin-content/<resource>/`. Keep truly shared lifecycle, paging, image/specification contracts and error primitives in a small shared area under the feature root. Route files retain routing, metadata, page composition, and imports from each feature's public entrypoint. This avoids the current aggregate becoming the next coupling point while keeping behavior changes out of scope.
2. **Use PostgreSQL 17 in an isolated integration test.** Follow the repository's Compose-pinned major version and provision a dedicated test database/schema. Test the actual Prisma unit of work and actual persisted content/audit rows under injected failures, with cleanup that cannot target a developer or production database. CI starts a disposable service and waits for health before running the dedicated test script.
3. **Enforce boundaries with a deterministic repository-local checker.** Use TypeScript source scanning/resolution or an already-installed dependency rule tool; do not add a runtime dependency by default. Check frontend-to-backend imports, feature deep imports (allow public entrypoints), and cycles among admin-content features. Include intentionally forbidden fixture cases and assert the checker rejects each.
4. **Keep compatibility evidence adjacent to extraction.** Preserve/extend unit and Playwright coverage for all six resources at 360, 390, 768, and 1280 widths; retain existing backend contract E2E as the route/payload security guard. No baseline performance claim will be fabricated; report measurement as not applicable unless a reproducible pre-change baseline is available.

## Risks / Trade-offs

- [Moving many imports can cause accidental route or server/client boundary regressions] → migrate one resource at a time, keep routes thin, run typecheck/build and existing browser tests after each group.
- [Integration tests could accidentally touch non-test data] → require an explicit test-only database name/URL, fail closed if absent or unsafe, use isolated transaction/test schema and disposable CI service, and never use production credentials.
- [A naïve import checker can miss aliases or generate false positives] → resolve TS path aliases, test positive allowed paths and negative fixtures, and document its supported import syntax.
- [Full frontend extraction is a broad diff] → keep form behavior/markup unchanged and split by resource; no visual redesign or API changes.

## Migration Plan

1. Add and validate the architecture checker and PostgreSQL integration harness before relying on them as gates.
2. Extract resource client/actions/mapping by feature, updating route imports without changing route placement.
3. Add a pinned PostgreSQL CI service, readiness checks, and an explicit root test command; CI must fail rather than silently skip the database test.
4. Run OpenSpec validation, lint, typecheck, unit/integration tests, backend contract E2E, all six admin browser flows, four viewport checks, and both production builds.
5. Document reversible commit-level rollout. Rollback is a code revert because this change must not alter schema/data; rerun quality gates after revert.

## Open Questions

- None for this scope. If safe isolation for a real PostgreSQL test cannot be guaranteed with repository configuration, stop and propose an explicit design update rather than pointing tests at an unspecified database.
