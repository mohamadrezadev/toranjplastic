## 1. Data model and migration

- [x] 1.1 Add PRD-approved inquiry enums, owner/catalog relations, typed request fields, and status-history models to Prisma schema.
- [x] 1.2 Add a named additive PostgreSQL migration with indexes, foreign keys, and a rollback/backup guide; generate and validate Prisma Client.
- [x] 1.3 Add migration/schema tests covering the complete status vocabulary, ownership indexes, and required history relations.

## 2. Backend inquiry domain

- [x] 2.1 Add inquiry contracts, type-specific DTOs, explicit customer-safe mappers, and bounded list filters.
- [x] 2.2 Implement the Inquiry repository boundary and Prisma adapter with effective-public catalog lookup, atomic create-plus-history, and owner-scoped list/detail queries.
- [x] 2.3 Implement the inquiry application service and versioned controller with Auth/CSRF guards, no-store responses, validation, and uniform not-found behavior.
- [x] 2.4 Add backend unit tests for form invariants, DTO privacy, catalog eligibility, filters, ownership, and transaction failure behavior.
- [x] 2.5 Add backend e2e and isolated PostgreSQL integration tests for authenticated creation, CSRF/validation rejection, cross-owner denial, no-store headers, and atomic history persistence.

## 3. Frontend inquiry portal

- [x] 3.1 Add a server-only customer inquiry client with runtime response guards, cookie/CSRF forwarding, filter serialization, and safe error mapping.
- [x] 3.2 Add an authenticated `noindex` account layout and Persian RTL account dashboard/request list/detail screens using uncached server reads.
- [x] 3.3 Add inquiry selection plus product, injection-service, material, and general-contact forms with Server Actions, type-specific validation feedback, pending/disabled behavior, and explicit attachment deferral.
- [x] 3.4 Connect public/header and eligible catalog inquiry CTAs to the implemented authenticated flow without adding ecommerce behavior.
- [x] 3.5 Add frontend unit/component and e2e tests for submission, filters, empty/error/not-found states, authentication redirects, private metadata, keyboard behavior, and RTL layouts.

## 4. Verification and handoff

- [x] 4.1 Run architecture checks, lint, typecheck, unit tests, backend e2e, frontend e2e, and production builds; fix all regressions.
- [ ] 4.2 Run the disposable PostgreSQL migration/integration suite against a database whose name contains `test`, recording any environment limitation without using another project's database.
- [x] 4.3 Verify inquiry flows at 360, 390, 768, and 1280 pixels in light and dark themes, including loading, empty, error, disabled, focus, and RTL behavior.
- [x] 4.4 Validate `build-customer-inquiry-foundation` and all OpenSpec artifacts in strict mode and document deployment/rollback evidence.
