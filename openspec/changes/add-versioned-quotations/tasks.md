## 1. Quotation persistence and authorization

- [x] 1.1 Add quotation/item enums, models, constraints, relations, indexes and additive PostgreSQL migration with rollback/backup notes.
- [x] 1.2 Add `QUOTATION_MANAGEMENT` to server-derived capabilities and cover Admin/Sales allow plus Operator/Customer deny paths.
- [x] 1.3 Define explicit BigInt-as-string quotation DTOs, validation bounds, calculation utilities and unit tests.

## 2. Backend quotation workflow

- [x] 2.1 Implement QuotationsModule draft create/read/update and revision cloning with one-draft/current-sent invariants and optimistic concurrency.
- [x] 2.2 Implement atomic send, supersede and Inquiry `QUOTED` transition with status history and metadata-only audit.
- [x] 2.3 Implement owner-scoped customer sent-quotation list/detail endpoints and prohibit draft/staff metadata disclosure.
- [x] 2.4 Add a bounded Persian-capable PDF renderer and authenticated no-store Admin/customer streaming endpoints.
- [x] 2.5 Add unit, API/e2e and disposable PostgreSQL tests for totals, concurrency, atomicity, ownership, draft isolation and PDF authorization.

## 3. Admin and customer UI

- [ ] 3.1 Add admin quotation feature types/contracts/actions and a mobile-first draft editor with line items, totals, terms, revision and send confirmation.
- [ ] 3.2 Add customer quotation cards, sent-version detail and private PDF download to owned inquiry detail.
- [ ] 3.3 Cover Persian RTL loading/empty/error/validation/conflict/success/disabled/focus states at 360, 390, 768 and 1280 widths.
- [ ] 3.4 Add component/E2E tests ensuring no automatic/public price or ecommerce controls are introduced.

## 4. Verification

- [ ] 4.1 Run Prisma validation/generation, architecture check, lint, typecheck, unit/integration/e2e tests and production builds.
- [ ] 4.2 Record PDF visual smoke evidence, migration/rollback evidence and private cache/log review.
