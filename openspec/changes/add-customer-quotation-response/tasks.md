## 1. Response persistence and policy

- [ ] 1.1 Add nullable quotation response fields/indexes and an additive migration preserving existing sent versions.
- [ ] 1.2 Implement response eligibility, expiry, same-result replay, opposite-result conflict and post-acceptance transition policies with unit tests.
- [ ] 1.3 Extend explicit customer/Admin DTOs without exposing private staff or audit data.

## 2. Backend response workflow

- [ ] 2.1 Implement owner-scoped CSRF-protected accept/reject endpoints bound to inquiry/quotation identifiers and expected versions.
- [ ] 2.2 Implement atomic accept (`QUOTED -> ACCEPTED`) and reject (`QUOTED -> UNDER_REVIEW`) transactions with history and audit.
- [ ] 2.3 Enable capability-protected `ACCEPTED -> IN_PROGRESS -> COMPLETED` transitions using backend-provided allowed transitions.
- [ ] 2.4 Add API/e2e and disposable PostgreSQL tests for ownership, expired/superseded versions, replay, concurrency, rollback and authorization.

## 3. Customer and Admin UI

- [ ] 3.1 Add customer confirmation/actions for accept and reject with version summary, optional reason and explicit refresh on conflict.
- [ ] 3.2 Show immutable response status/time/version in both panels and expose only valid staff transitions after acceptance.
- [ ] 3.3 Add responsive Persian RTL loading/error/expired/already-answered/pending/success states at 360, 390, 768 and 1280 widths.
- [ ] 3.4 Add component/E2E coverage for accept, reject/revision path, retry safety and keyboard/focus behavior.

## 4. Verification

- [ ] 4.1 Run Prisma validation/generation, architecture check, lint, typecheck, unit/integration/e2e tests and production builds.
- [ ] 4.2 Record migration, audit/log/privacy and responsive verification evidence.
