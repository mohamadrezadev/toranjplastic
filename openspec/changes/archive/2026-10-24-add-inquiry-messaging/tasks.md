## 1. Persistence and contracts

- [x] 1.1 Add `InquiryMessage` schema relations, indexes and an additive PostgreSQL migration with rollback/backup notes.
- [x] 1.2 Extend backend message DTOs, explicit customer/Admin response types, repository contracts and safe mappers.
- [x] 1.3 Add unit tests for message validation, ownership, allowed states and `NEED_MORE_INFO` transition policy.

## 2. Backend operations

- [x] 2.1 Implement owner-scoped customer message read/write endpoints with Auth/CSRF, a bounded recent-message window and no-store responses.
- [x] 2.2 Implement capability-protected Admin message endpoint and keep customer messages separate from internal notes.
- [x] 2.3 Implement atomic request-more-info and customer-reply transitions with version/history/audit rollback guarantees.
- [x] 2.4 Add API/e2e and disposable PostgreSQL tests for 401/403/404/409, privacy, ordering, concurrency and transaction failure.

## 3. Frontend experience

- [x] 3.1 Extend customer inquiry contracts/API/actions and render the conversation plus reply form in owned detail.
- [x] 3.2 Extend admin-inquiries public feature API/actions/types and render customer messages with a clearly separate staff composer.
- [x] 3.3 Add accessible Persian loading/empty/error/success/conflict/pending states and responsive styles for 360, 390, 768 and 1280 widths.
- [x] 3.4 Add component/E2E coverage for both roles, privacy boundaries, focus behavior and mobile/desktop layouts.

## 4. Verification

- [x] 4.1 Run Prisma validation/generation, architecture check, lint, typecheck, unit/integration/e2e tests and production builds.
- [x] 4.2 Record verification evidence and confirm no message payload, internal note or private identifier is logged or publicly cached.
