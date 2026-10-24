## Context

The repository already persists four customer inquiry types, creates the initial `SUBMITTED` history row atomically, and exposes owner-scoped customer list/detail APIs through the `inquiries` backend module. The private customer portal has a mature responsive shell, while `/admin` currently repeats standalone CMS cards, tables, and forms under an access-only layout. There is no administrative inquiry API, assignment model, internal-note model, concurrency token, or inquiry operations UI.

This change spans Next.js, NestJS, Prisma, PostgreSQL, authorization, privacy, concurrent mutations, audit logging, and responsive UI. It therefore keeps inquiry business ownership inside the existing `inquiries` module and introduces a separate frontend `admin-inquiries` feature rather than extending the content-management feature.

The product decisions for this slice are fixed as follows: `SUBMITTED` may move to `UNDER_REVIEW` or `REJECTED`; `UNDER_REVIEW` may move to `REJECTED`, and only a `GENERAL_CONTACT` may move from `UNDER_REVIEW` to `COMPLETED`; `NEED_MORE_INFO`, `QUOTED`, `ACCEPTED`, and `IN_PROGRESS` are not entered by this slice; `COMPLETED`, `REJECTED`, and `CANCELLED` are terminal; Admin-initiated `CANCELLED` and reopening are deferred. Assignees are active Admin accounts only.

## Goals / Non-Goals

**Goals:**

- Give administrators a coherent Persian RTL workspace with the visual quality, responsive behavior, and accessibility conventions of the customer portal.
- Provide an authorized inquiry inbox, real summary counts, deterministic filters/search/pagination, and an operational detail workspace.
- Make assignment, status transitions, assignment history, status history, internal notes, and audit writes secure and traceable.
- Prevent lost updates for status and assignment with optimistic concurrency and stable conflict responses.
- Preserve the existing customer contract while proving that operational fields never cross the customer boundary.
- Verify migration safety and mutation atomicity against disposable PostgreSQL.

**Non-Goals:**

- Quotations, pricing, offer PDFs, customer acceptance, messages, notifications, attachments, Sales/Operator roles, SLA automation, terminal-state reopening, or Admin cancellation.
- Editing the customer's submitted inquiry payload.
- Cart, payment, inventory, automatic pricing, delivery promises, or unverified commercial/technical claims.
- Replacing the existing brand/token system or redesigning public pages.

## Decisions

1. **Keep admin operations inside the inquiry domain, with separate admin-facing classes.** `AdminInquiryController`, `AdminInquiryService`, admin DTOs, and an explicit admin mapper live under `backend/src/inquiries/admin/`, while the repository contract remains owned by `inquiries`. This avoids a new module importing another module's internal repository. A standalone `admin-inquiries` backend module was rejected because it would either duplicate persistence logic or violate the modular-monolith boundary.

2. **Use distinct customer and admin projections.** The existing customer mapper remains allowlisted and unchanged. The admin mapper explicitly exposes `ownerSummary`, `assigneeSummary`, `statusHistory`, `assignmentHistory`, `internalNotes`, and `version`. Raw Prisma entities are never returned. Negative contract tests assert the absence of operational fields from customer JSON.

3. **Add optimistic locking only to status and assignment mutations.** `Inquiry.version` starts at zero. Status and assignment mutations update with `WHERE id = ? AND version = expectedVersion`, increment the version, and write history plus audit in the same transaction. A zero-row update becomes `409 INQUIRY_VERSION_CONFLICT` with no side effects. Internal notes are independent append-only records, do not increment Inquiry version, and are never retried automatically by the UI; this prevents a note from invalidating an otherwise current status/assignment form.

4. **Store operational history additively.** `assignedAdminId`, `version`, `InquiryInternalNote`, and `InquiryAssignmentHistory` are added without rewriting existing inquiry/history rows. Current assignment uses an optional named relation; note authors and assignment actors use `onDelete: Restrict` so auditability is not silently destroyed. Existing users are disabled rather than hard-deleted.

5. **Use an explicit transition policy in the service layer.** The policy returns only destinations valid for the current type/status and is used both for validation and for the admin DTO. The frontend renders only `allowedTransitions`; it does not reproduce the state machine. `CANCELLED`, `NEED_MORE_INFO`, and `QUOTED` remain in the approved enum but cannot be created by this slice.

6. **Define bounded query semantics.** Admin list defaults to page 1/pageSize 20 and caps pageSize at 100. Ordering is `createdAt DESC, id ASC`. `from` is inclusive and `to` is exclusive ISO-8601 UTC. Mobile search is exact after Iranian normalization, ID search is exact/prefix, and catalog snapshot search is bounded case-insensitive text; `q` is capped at 80 and never logged. Filters remain URL-based.

7. **Expose a separate summary endpoint.** `GET /admin/inquiries/summary` returns real counts for total, unassigned, `SUBMITTED`, and `UNDER_REVIEW`. Keeping summary separate prevents list pagination semantics from becoming overloaded and allows the dashboard/inbox to fetch only real operational counts. No placeholder counts are rendered.

8. **Return stable error codes and updated representations.** Business errors use safe objects such as `INQUIRY_VERSION_CONFLICT`, `INQUIRY_INVALID_TRANSITION`, and `INQUIRY_INVALID_ASSIGNEE`. Successful status and assignment mutations return the updated Admin DTO and new version. The frontend uses the code to render a conflict banner and explicit refresh action.

9. **Build a dedicated admin shell inspired by, not coupled to, the customer shell.** `components/admin` owns `AdminPortalShell` and route-aware navigation. It reuses design tokens and interaction conventions but uses grouped destinations suitable for seven management areas. Desktop uses a fixed sidebar; tablet uses a compact top layout; small screens use a sticky horizontally scrollable navigation contained within the viewport. CMS route files remain composition-only and are visually normalized by the shared admin layout.

10. **Keep frontend operations in a feature boundary.** `features/admin-inquiries` owns server-only transport, runtime response validation, form mapping, and Server Actions. `/app/admin/inquiries` owns routing, metadata, and composition. It neither deep-imports `admin-content` features nor imports backend source.

11. **Make atomicity testable through a transaction-scoped repository implementation.** Status, assignment, and note commands execute through Prisma `$transaction`, including audit event creation. Unit tests cover policy and mapping; a real PostgreSQL integration test covers rollback and two concurrent mutations with the same expected version. The integration command retains the existing safety rule requiring a database name containing `test`.

## Risks / Trade-offs

- **[The change is broad across UI, API, and schema]** → Implement and verify in ordered slices: contracts/migration, backend reads, backend mutations, shell, frontend workflow, privacy regression.
- **[Large admin navigation can become crowded on 360px]** → Use contained horizontal navigation with visible active state and touch-size controls; test page width separately from the nav scroller.
- **[Searching PII can leak through logs or slow queries]** → Use bounded semantics, exact normalized mobile matching, indexed owner/mobile relations, capped input, and no query-value logging.
- **[Status policy may expand with quotation/messaging phases]** → Keep one tested policy function; later changes add transitions only after their domain prerequisite exists.
- **[Append-only note retry can duplicate text]** → Disable automatic mutation retry and show a clear result; idempotency keys remain a later change if operational evidence requires them.
- **[Current admin CMS pages have inconsistent internal markup]** → The shared shell normalizes navigation and workspace framing in this change; deeper CMS editor/list redesign remains separate.

## Migration Plan

1. Add the Prisma relations, `version`, assignment field, note/history models, and supporting indexes in an additive named migration with `ROLLBACK.md`.
2. Generate and validate Prisma Client; review SQL for destructive operations.
3. Run schema/migration tests and the inquiry PostgreSQL integration suite against a disposable database whose name contains `test`.
4. Deploy the migration before the backend, then deploy the frontend. Existing inquiries receive `version = 0` and no assignee; existing status history is preserved.
5. Application rollback deploys the previous frontend/backend while leaving additive columns/tables dormant. Destructive rollback requires a verified backup and explicit operator execution; it is never automatic.

## Open Questions

- The repository contract identifies a PRD v1.2 handoff as the highest source of truth, but that package/manifest was not available during this review. Before release, the approved status matrix must be checked against that package; any conflict updates the spec before archive.
- Production/staging backup execution and performance baseline evidence require the deployment environment and remain operational release evidence rather than local implementation assumptions.
