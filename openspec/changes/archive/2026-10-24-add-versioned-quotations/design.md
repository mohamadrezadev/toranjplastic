## Context

Inquiry statuses already reserve `QUOTED`, but the operations contract forbids entering it without a real quotation. The system has no price model, document numbering, PDF or private document delivery. This change adds the commercial snapshot while preserving the product rule that v1 is not a store and never derives price, stock or delivery promises automatically.

## Goals / Non-Goals

**Goals:**

- Manual, versioned quotation drafts associated with one inquiry.
- Immutable sent snapshots, private customer visibility and PDF rendering.
- Atomic send plus `QUOTED` gate, history and audit.
- Dedicated `QUOTATION_MANAGEMENT` capability and responsive Admin/customer UI.

**Non-Goals:**

- Customer accept/reject, payment, cart, tax invoice, inventory, automatic pricing or guaranteed delivery.
- Public quotation URLs or generic file upload/storage.
- Multi-currency conversion; v1 stores and labels all monetary amounts as IRR.

## Decisions

1. **Quotation is a separate backend domain with a narrow Inquiry integration.** `QuotationsModule` owns its controller, service, mapper and persistence. It does not import an internal Inquiry repository. A public inquiry commercial policy/service supplies transition validation, while the quotation transaction owns quote writes plus the guarded Inquiry/history/audit update.

2. **Money uses non-negative integer `BigInt` rials.** `Quotation` stores discount, tax and additional cost amounts; each `QuotationItem` stores description, quantity as bounded decimal text, unit, unit-price rials and line-total rials. The backend recomputes subtotal/total and rejects client totals that do not match. Floating point and automatic catalog pricing are rejected alternatives.

3. **Version and document identity are distinct.** One inquiry has quotation versions 1..n under a stable server-generated quotation number. A quote starts `DRAFT`; draft edits use `expectedVersion`. Sending sets `SENT`, captures `sentAt`, makes the rows immutable, supersedes the previous SENT version, and moves the Inquiry to `QUOTED` in one transaction.

4. **Revision clones the last sent snapshot.** The Admin requests a revision, the server creates a new DRAFT version with copied items/terms, and changes apply only to that draft. There is at most one DRAFT per inquiry and at most one current SENT version.

5. **Customer sees only sent versions for owned inquiries.** Drafts and staff audit data never enter customer DTOs. List/detail reads and PDF download include ownerId in the database query and respond with safe 404 for unknown/non-owned identifiers.

6. **PDF is generated on demand from the immutable snapshot.** It is streamed from an authenticated endpoint with `application/pdf`, safe filename and `private, no-store`; no filesystem path or public object URL is persisted. A bundled Persian-capable font and deterministic server-side renderer are required and covered by a smoke test. The document is labelled «پیش‌فاکتور / پیشنهاد قیمت» and does not claim to be a tax invoice.

7. **Capability is additive.** `ADMIN` and `SALES` receive `QUOTATION_MANAGEMENT`; `OPERATOR` and `CUSTOMER` do not. Both create/update/send endpoints require this capability plus CSRF; reads from the Admin surface require the same capability or `INQUIRY_OPERATIONS` as explicitly mapped.

8. **Frontend remains orchestration-only.** Admin forms live under the inquiry feature/quotation subfeature, send integer rial strings, and display computed server totals. Customer pages fetch sent quotations independently with `no-store`. All identifiers and numbers use isolated LTR containers inside RTL UI.

## Risks / Trade-offs

- **[BigInt JSON serialization]** → mappers emit decimal strings; raw Prisma entities are never serialized.
- **[Persian PDF shaping/font failure]** → ship a reviewed font asset/dependency and assert `%PDF` plus expected metadata in tests; visual smoke-check the generated document.
- **[Concurrent sends or revisions]** → unique indexes and expected versions combine with a serializable/guarded transaction; conflict returns stable 409.
- **[Incorrect commercial amount]** → backend derives every total from integer inputs and sent versions are immutable; correction requires a new version.
- **[PDF generation cost]** → generate on demand with bounded item count and text sizes; no unbounded HTML/browser process.

## Migration Plan

1. backup, additive enum/table/index migration and Prisma generation.
2. deploy backend before UI; existing inquiries remain unchanged and no quote is synthesized.
3. rollback app safely while retaining additive tables; destructive rollback requires export/backup of quotation rows first.

## Open Questions

- Configurable legal seller/tax identity and external object-storage retention belong to a later approved change; v1 uses verified brand identity only and makes no tax-invoice claim.
