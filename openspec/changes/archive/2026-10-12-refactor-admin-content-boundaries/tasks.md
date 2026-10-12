## 1. Characterization and Shared Boundaries

- [x] 1.1 Expand backend admin-content unit tests to characterize all six resources, idempotent publish/archive auditing, unique-slug translation, and current public response contracts before moving production code.
- [x] 1.2 Move stored image and specification normalization into a neutral `content-shared` boundary, update public/admin consumers, and prove unchanged mappings with existing mapper and repository tests.
- [x] 1.3 Split the aggregate admin-content types and repository interface into shared paging/lifecycle types plus explicit resource contracts without changing exported DTO shapes.

## 2. Atomic Mutation Infrastructure

- [x] 2.1 Define the `AdminContentUnitOfWork`, transaction context, audit writer, and narrow Prisma-client-compatible contracts used by application services.
- [x] 2.2 Implement the Prisma unit of work and transaction-scoped resource repository factory without nested transactions or direct Prisma access from application services.
- [x] 2.3 Add unit tests proving commit on successful content+audit writes, rollback when audit persistence fails, and no committed audit event when content persistence fails.
- [x] 2.4 Add shared mutation/lifecycle helpers for validation, conflict translation, and audit metadata while keeping resource-specific field mapping explicit.

## 3. Resource-Focused Admin Content Slices

- [x] 3.1 Move Category routes, application operations, repository contract, Prisma adapter, and tests into a focused category slice using the unit of work.
- [x] 3.2 Move Product routes, application operations, repository contract, Prisma adapter, and tests into a focused product slice using the unit of work.
- [x] 3.3 Move InjectionService routes, application operations, repository contract, Prisma adapter, and tests into a focused injection-service slice using the unit of work.
- [x] 3.4 Move Material routes, application operations, repository contract, Prisma adapter, and tests into a focused material slice using the unit of work.
- [x] 3.5 Move Article routes, application operations, repository contract, Prisma adapter, and tests into a focused article slice using the unit of work.
- [x] 3.6 Move ManagedPage routes, application operations, repository contract, Prisma adapter, and tests into a focused managed-page slice using the unit of work.
- [x] 3.7 Rewire `AdminContentModule` to the six focused controllers/services, remove obsolete aggregate implementations, and verify no admin-content application service imports `PrismaService` or a public-content internal mapper.

## 4. HTTP Contract and CI Gates

- [x] 4.1 Update backend admin-content end-to-end provider fakes for the split contracts and verify existing URLs, authorization, CSRF, `no-store`, validation, conflict, lifecycle, and response behavior for all six resource families.
- [x] 4.2 Add root `test:e2e:backend`, `test:e2e:frontend`, and aggregate end-to-end scripts while preserving the existing frontend command compatibility where practical.
- [x] 4.3 Update CI to run backend API contract tests and the existing four-viewport frontend Playwright suite through explicit root commands.

## 5. Verification

- [x] 5.1 Run OpenSpec validation and trace every modified requirement scenario to an automated test or an explicit verification command.
- [x] 5.2 Run backend lint, typecheck, unit tests with coverage, end-to-end tests, and production build; keep touched backend files at or above the repository's required coverage threshold.
- [x] 5.3 Run frontend lint, typecheck, unit/component tests, four-viewport Playwright tests, and production build to prove the backend refactor and CI-script changes do not regress public or admin consumers.
- [x] 5.4 Inspect the final dependency graph and source imports to confirm resource slices depend only on public/shared contracts and no forbidden cross-module repository dependency remains.
