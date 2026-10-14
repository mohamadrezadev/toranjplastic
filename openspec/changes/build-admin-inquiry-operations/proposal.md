## Why

Customer inquiries are persisted with owner-safe history, but administrators currently have no application workflow to review, assign, annotate, or progress them. The existing admin area is also a set of isolated CMS pages rather than a coherent portal, so the inquiry workflow needs both secure operations and a customer-portal-quality management shell.

## What Changes

- Add a Persian RTL admin shell with persistent desktop navigation, mobile navigation, breadcrumbs, account/logout access, and consistent responsive page structure for both CMS and inquiry routes.
- Add `/admin/inquiries` as an operational inbox with real-data summary counts, URL-based search and filters, deterministic pagination, desktop table and mobile card presentations, and complete loading/empty/error/access states.
- Add `/admin/inquiries/[id]` with customer-safe submitted data, assignment to an active Admin, append-only internal notes, status and assignment timelines, and explicitly allowed status actions.
- Add protected `/api/v1/admin/inquiries` list, summary, assignee, detail, assignment, note, and status endpoints with explicit Admin DTOs, `no-store`, CSRF on mutations, stable error codes, and no raw Prisma serialization.
- Extend the inquiry schema additively with optimistic versioning, optional assignment, internal notes, and assignment history; make status/assignment history and audit writes atomic.
- Keep customer inquiry endpoints backward-compatible and prove that assignee, internal notes, audit data, actors, and other customers' data never enter customer responses.
- Verify PostgreSQL atomicity and concurrency, backend/frontend failure paths, RTL accessibility, light/dark themes, and widths 360, 390, 768, and 1280.
- Keep quotation, pricing, customer messaging, attachments, Sales/Operator roles, reopening terminal states, SLA automation, cart, payment, inventory, and automatic costing out of scope.

## Capabilities

### New Capabilities

- `admin-console-experience`: Shared Persian RTL management shell and responsive navigation/layout behavior across existing CMS and new inquiry operations pages.
- `admin-inquiry-operations`: Authorized inquiry inbox, detail, assignment, internal notes, approved status transitions, concurrency control, auditability, and customer-data isolation.

### Modified Capabilities

None.

## Impact

- `backend/prisma/`: additive inquiry relations, indexes, models, migration, and rollback/backup documentation.
- `backend/src/inquiries/`: separate admin controller/service/DTO/mapper behavior within the inquiry domain and expanded repository/unit-of-work contracts.
- `backend/src/audit/` and identity contracts: transaction-scoped audit reuse and active-Admin assignee lookup without importing another module's private repository.
- `frontend/src/features/admin-inquiries/`: server-only admin inquiry transport, runtime contracts, and Server Actions.
- `frontend/src/components/admin/` and `frontend/src/app/admin/`: shared admin shell plus inbox/detail screens and updated CMS composition.
- Backend unit/e2e/PostgreSQL integration tests, frontend component/e2e tests, architecture checks, and OpenSpec validation.
