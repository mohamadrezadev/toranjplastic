## Context

The repository already has secure password sessions, session-bound CSRF protection, a Customer-by-default identity model, public catalog APIs, and protected admin routes. The `/inquiry` and `/account` destinations are still provisional and there is no persisted business-request domain. PRD 04 defines four inquiry types and nine approved statuses; PRD 05 reserves assignment, operational status changes, internal notes, messages, and quotations for the later operations phase.

This change crosses Next.js, NestJS, Prisma, PostgreSQL, and the private-page security boundary. It therefore introduces a deliberately narrow Inquiry domain that can later be consumed by the operations/quotation domains without pre-implementing them.

## Goals / Non-Goals

**Goals:**

- Accept the four PRD 04 inquiry forms from an authenticated account.
- Persist a request and its initial `SUBMITTED` history event atomically.
- Expose owner-scoped, paginated list and detail reads with type/status filters.
- Render private Persian RTL submission, list, and detail experiences with loading, empty, validation, and service-error states.
- Keep private responses uncached and prevent internal/future operational fields from entering customer DTOs.

**Non-Goals:**

- File upload/download, storage-provider selection, retention, malware scanning, or attachment metadata.
- Customer/admin message threads, notifications, assignment, status mutation, internal notes, or admin inquiry screens.
- Quotations, prices, inventory, payment, contract acceptance, or automatic cost calculation.
- Profile editing, OTP, password recovery, or Sales/Operator roles.

## Decisions

1. **Use a dedicated `inquiries` backend module with its own controller, application service, repository contract, and Prisma repository.** The module owns customer request rules and persistence. Identity is consumed only through exported guards/types, and catalog models are referenced through database relations rather than importing another module's private repository. Directly adding methods to identity or content was rejected because it would mix business ownership and create the cross-domain coupling prohibited by ADR-0003.

2. **Use one typed `Inquiry` aggregate with nullable type-specific columns and explicit enums.** `InquiryType` distinguishes `PRODUCT`, `INJECTION_SERVICE`, `MATERIAL`, and `GENERAL_CONTACT`; DTOs enforce the required field set for each endpoint. This keeps list/history/ownership behavior uniform while retaining queryable fields. A raw JSON payload was rejected because it weakens schema validation and migration visibility; four unrelated root tables were rejected because they duplicate security, status, and portal queries.

3. **Store every PRD-approved status in the database enum but expose no status mutation in this change.** Creation always sets `SUBMITTED` and creates an `InquiryStatusHistory` row in the same transaction. This records the authoritative vocabulary without inventing transition permissions or workflows reserved for PRD 05.

4. **Use four explicit create endpoints plus shared owner reads.** `POST /api/v1/inquiries/product`, `/injection-service`, `/material`, and `/contact` each receive a type-specific DTO. `GET /api/v1/inquiries` accepts bounded pagination and optional approved type/status filters; `GET /api/v1/inquiries/:id` returns an owner-safe detail. A polymorphic create body was rejected because mutually exclusive validation would be harder to audit and document.

5. **Derive ownership solely from the validated server-side session.** No create DTO accepts `ownerId`, role, status, assignee, internal note, or history. Repository reads always include `ownerId` in the database predicate and map missing/non-owned IDs to the same not-found response. Customer DTOs are constructed explicitly from allowlisted fields and contain no internal-note, assignee, quotation, raw relation, or private file field.

6. **Validate optional catalog context without publishing hidden content.** Product inquiries require an effectively published product. Injection-service and material requests may carry an optional effectively published service/material reference for CTA prefill, while their free-form PRD fields remain authoritative. Missing, draft, archived, or future-dated catalog references are rejected as invalid without revealing lifecycle state.

7. **Keep transport and UI server-first.** A server-only frontend inquiry client forwards the session cookie and CSRF cookie/header to the backend. Server Actions map form data into typed payloads and use redirects for success/error state. `/account` is protected by a shared server layout, carries `noindex`, and uses `no-store` reads; no token or private payload is rendered into client scripts.

8. **Defer attachments completely instead of accepting inert metadata.** PRD 04 requires private storage, authorization checks, type/size limits, traversal prevention, and non-execution. Because provider and retention policy remain unresolved, the forms explain that attachments are not yet enabled. This avoids misleading users or persisting unusable paths.

## Risks / Trade-offs

- **[Wide nullable inquiry table]** → Type-specific DTOs, service invariants, database enums, and tests prevent invalid combinations; a later split remains possible if operational querying proves materially different.
- **[Future status workflow may need richer transition metadata]** → History has actor, from/to status, and timestamp from the start, but only the creation event is written now.
- **[Catalog content may be archived after submission]** → The inquiry retains the foreign key and an immutable display-name snapshot so the customer detail remains understandable without exposing current draft content.
- **[No attachments in the first slice]** → UI states the limitation explicitly; upload controls are not rendered until storage and retention are approved.
- **[Migration rollback is destructive once requests exist]** → Deployment requires backup verification; normal application rollback leaves additive tables/enums dormant, while destructive rollback is a separately documented operator action.

## Migration Plan

1. Add the inquiry/status enums, `Inquiry`, and `InquiryStatusHistory` relations and indexes in a named additive migration.
2. Generate and validate Prisma Client; review migration SQL for destructive statements.
3. Run unit/e2e tests and apply the migration to an isolated PostgreSQL database whose name contains `test`.
4. Deploy the backend migration before the backend application, then deploy the frontend.
5. For application rollback, deploy the previous backend/frontend and leave the additive schema dormant. Before destructive schema rollback, back up any inquiry data and follow the migration's `ROLLBACK.md`; do not drop tables automatically.

## Open Questions

- The upload provider, allowed MIME/size matrix, antivirus strategy, retention period, and deletion policy remain unresolved for a later attachment change.
- Status-transition matrix, Admin versus future Sales/Operator permissions, message semantics, notification provider, and quotation acceptance behavior remain PRD 05 work.

