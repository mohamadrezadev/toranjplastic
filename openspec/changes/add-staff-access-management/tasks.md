## 1. Persistence and shared contracts

- [x] 1.1 Extend the Prisma `UserRole` enum with `SALES` and `OPERATOR`, add default-safe `User.version`, create the reviewed PostgreSQL migration, and document backup plus enum-aware rollback steps.
- [x] 1.2 Regenerate Prisma artifacts and extend backend/frontend role, account-status, staff DTO, capability, and stable error contracts without introducing `any` or backend-source imports in the frontend.
- [x] 1.3 Add schema/migration tests proving existing Customers and Administrators retain their roles, public registration still creates only Customers, and privileged role input remains rejected.

## 2. Authorization foundation

- [x] 2.1 Implement the typed fixed role-to-capability policy and backend guard/decorator that authorizes from the validated session and current active account state.
- [x] 2.2 Extend the authenticated identity response with a bounded capability list and update the management route/session gate for `ADMIN`, `SALES`, and `OPERATOR` while preserving Customer 403 and anonymous 401/redirect behavior.
- [x] 2.3 Add backend authorization matrix tests covering every allowed and denied role/capability pair, forged role inputs, inactive staff, safe 401/403 responses, and no protected-data leakage.

## 3. Staff management backend

- [x] 3.1 Implement identity-owned bounded staff list/detail queries and explicit safe DTO mapping for `GET /api/v1/admin/staff` and `GET /api/v1/admin/staff/:id` with deterministic pagination and `no-store` responses.
- [x] 3.2 Implement Administrator-only staff creation with strict DTO validation, Iranian mobile normalization/uniqueness, approved Argon2id hashing, privileged-role allowlisting, generic conflicts, and atomic metadata-only audit.
- [x] 3.3 Implement versioned role/status commands with self-change rejection, Customer exclusion, serialized last-active-Administrator protection, no hard delete, atomic session revocation, and metadata-only audit.
- [x] 3.4 Add unit and HTTP tests for staff filtering, DTO privacy, CSRF, duplicate mobile, invalid/extra fields, role/status transitions, version conflicts, self-change, last-Administrator safety, no-store, and audit redaction.
- [ ] 3.5 Add disposable PostgreSQL integration tests proving concurrent last-Administrator protection and rollback atomicity across account update, version increment, session revocation, and audit persistence.

## 4. Sales and Operator operational access

- [x] 4.1 Move inquiry list/summary/detail/assignment/note/status routes to the inquiry capability and update eligible-assignee lookup to active `ADMIN` or `SALES` through the identity module's public contract.
- [x] 4.2 Add inquiry tests proving Sales parity with existing Administrator operations, Operator/Customer denial, invalid assignee rejection, unchanged concurrency/history/audit behavior, and complete Customer DTO isolation.
- [x] 4.3 Move all six content-resource read/mutation routes to the content capability and preserve CSRF, lifecycle, validation, transaction, audit, preview, and public published-only boundaries for Operators.
- [x] 4.4 Add content tests proving Operator parity with existing Administrator operations and Sales/Customer denial without content writes, audit rows, or protected preview data.

## 5. Capability-aware management frontend

- [x] 5.1 Refactor the shared management shell/dashboard navigation to use the bounded capability contract and render only permitted inquiry, CMS, and staff destinations with server-side route gates and no forbidden prefetch/data load.
- [x] 5.2 Build `frontend/src/features/admin-staff` public feature boundaries, typed transport, Persian labels, and `/admin/staff`, `/admin/staff/new`, and `/admin/staff/[id]` route composition without deep imports or architecture cycles.
- [x] 5.3 Implement staff list filters/pagination and responsive table/card presentations plus create and versioned role/status forms with loading, empty, error, validation, success, disabled, forbidden, and conflict-refresh states.
- [x] 5.4 Add frontend component/route/action tests proving capability-aware navigation, direct forbidden-route behavior, server-side CSRF attachment, password non-repopulation, safe error rendering, noindex/no-store behavior, and RTL keyboard/focus usability.

## 6. End-to-end verification and handoff

- [ ] 6.1 Add Playwright journeys for Administrator staff creation/role/status management, Sales inquiry access, Operator CMS access, cross-role direct-URL denial, session revocation, and last-Administrator/version-conflict feedback.
- [x] 6.2 Verify the management shell and staff list/create/detail flows in light and dark themes at 360, 390, 768, and 1280 pixels with no unintended document overflow and record the evidence.
- [ ] 6.3 Run architecture checks, lint, typecheck, unit tests, disposable PostgreSQL integration tests, touched-file coverage, production builds, and the full relevant end-to-end suite; resolve every regression.
- [ ] 6.4 Update the change artifacts with implementation evidence, confirm every acceptance scenario is traceable, and prepare the completed change for OpenSpec archive only after review.
