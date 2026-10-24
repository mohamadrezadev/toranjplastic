## 1. Data model and contracts

- [x] 1.1 Extend Prisma with inquiry versioning, current assignment, internal notes, assignment history, inverse User relations, and operational indexes.
- [x] 1.2 Add a named additive migration and rollback/backup guide, then regenerate and validate Prisma Client.
- [x] 1.3 Add admin inquiry types, DTO validation, explicit admin/customer mapper tests, stable error codes, and the approved transition-policy unit tests.

## 2. Backend reads and mutations

- [x] 2.1 Extend the inquiry repository boundary with bounded Admin list/search/filter, real summary, active-Admin assignees, and explicit detail projection.
- [x] 2.2 Implement transaction-safe status, assignment, and append-only note commands with history, metadata-only audit, optimistic locking, and rollback behavior.
- [x] 2.3 Add the Admin inquiry service/controller under the inquiry domain with Admin/CSRF guards, no-store responses, allowed-transition calculation, and safe 400/401/403/404/409 behavior.
- [x] 2.4 Add backend unit and e2e tests for authorization, filtering, summary, invalid transitions/assignees, conflicts, note validation, and customer DTO non-disclosure.
- [x] 2.5 Add or extend disposable PostgreSQL integration tests for migration safety, atomic history/audit writes, rollback, and concurrent expected-version mutations.

## 3. Shared admin experience

- [x] 3.1 Build `components/admin` shell and route-aware navigation using the customer portal's responsive/accessibility conventions for dashboard, inquiries, and six CMS areas.
- [x] 3.2 Move the existing admin gate and all existing CMS pages into the shared shell without changing authorization or content-management behavior.
- [x] 3.3 Redesign the admin dashboard navigation and shared management styles with real-data-only presentation, RTL, light/dark themes, and responsive workspace bounds.

## 4. Admin inquiry frontend

- [x] 4.1 Create the `features/admin-inquiries` public boundary with server-only transport, runtime guards, query serialization, Server Actions, and conflict-safe error mapping.
- [x] 4.2 Implement `/admin/inquiries` with real summary, URL filters/search/pagination, desktop table, mobile cards, and loading/empty/error states.
- [x] 4.3 Implement `/admin/inquiries/[id]` with submitted data, owner/assignee context, allowed status actions, staff-only notes, histories, pending/success/error/conflict states, and explicit refresh.
- [x] 4.4 Add component/unit tests for the admin shell, navigation, runtime contracts, form mapping, action errors, responsive collection semantics, and keyboard/focus behavior.

## 5. End-to-end verification and handoff

- [x] 5.1 Extend frontend e2e fixtures and tests for Admin inbox/detail workflows, CMS navigation regression, customer privacy regression, light/dark themes, and 360/390/768/1280 viewports.
- [x] 5.2 Run architecture checks, lint, typecheck, unit tests, backend/frontend e2e tests, builds, and strict OpenSpec validation; fix all regressions.
- [x] 5.3 Run the PostgreSQL integration command only against a disposable database whose name contains `test`, and record any unavailable-environment limitation without using another database.
- [x] 5.4 Review migration SQL plus rollback/backup documentation and record deployment ordering and staging evidence requirements.
