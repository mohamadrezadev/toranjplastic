## Context

The current identity model persists only `CUSTOMER` and `ADMIN`. Public registration always creates a Customer, the initial Administrator is provisioned by a one-time non-HTTP bootstrap, and the shared `AdminGuard` effectively treats every management endpoint as Administrator-only. Inquiry operations currently accept only active Administrators as actors and assignees; content operations and the CMS console are also Administrator-only. There is no staff directory or supported path for creating a second privileged account.

This change crosses identity, sessions, authorization, inquiry operations, content operations, audit persistence, the shared management shell, and PostgreSQL schema. It must preserve the existing customer privacy boundary, CSRF behavior, no-store/noindex controls, and atomic write guarantees. The approved product decision is a fixed four-role model rather than user-defined roles.

## Goals / Non-Goals

**Goals:**

- Let an active Administrator create and manage `ADMIN`, `SALES`, and `OPERATOR` accounts safely.
- Enforce the approved role/capability matrix on the backend from current account state.
- Give Sales the existing inquiry workflow and Operator the existing six-resource CMS workflow.
- Prevent last-Administrator lockout, unsafe self-revocation, stale privilege after role/status changes, and lost updates.
- Deliver a coherent Persian RTL, mobile-first staff experience inside the existing management shell.
- Prove authorization failures, transaction atomicity, session revocation, privacy, and required responsive states.

**Non-Goals:**

- User-defined roles, individual permission toggles, teams, approval chains, or branch/territory scoping.
- Public staff registration, invitations by email/SMS, OTP, password recovery, or password-reset administration.
- Hard deletion of accounts or rewriting historical actor/assignee/audit references.
- Changes to approved inquiry status transitions, customer DTOs, ecommerce, pricing, inventory, or commercial claims.

## Decisions

### 1. Represent authorization as fixed capabilities derived from roles

The backend will define a typed capability set and a single role-to-capability mapping:

| Role | Staff management | Inquiry operations | Content management |
|---|---:|---:|---:|
| `ADMIN` | Yes | Yes | Yes |
| `SALES` | No | Yes | No |
| `OPERATOR` | No | No | Yes |
| `CUSTOMER` | No | No | No |

Controllers will declare required capabilities through metadata/decorators, and a capability guard will load/validate the current server-side account and require active status. Existing Administrator-only probes can remain role-specific where they truly test Administrator access, but operational routes will move to capability checks. Frontend capability data is for presentation only; every API and server-rendered protected route remains authoritative.

Alternatives considered: scattering role arrays across controllers would be faster initially but invites drift; storing arbitrary permissions in the database would exceed the approved scope and create a larger security and UI surface.

### 2. Keep staff administration inside identity ownership

The backend identity module will own staff account persistence and lifecycle rules and expose a public application service to a thin `/api/v1/admin/staff` controller. Planned contracts are:

- `GET /api/v1/admin/staff` with bounded `role`, `status`, `page`, and `pageSize` filters.
- `GET /api/v1/admin/staff/:id` for a safe staff detail.
- `POST /api/v1/admin/staff` with display name, Iranian mobile, initial password, and privileged role.
- `PATCH /api/v1/admin/staff/:id/role` with `role` and `expectedVersion`.
- `PATCH /api/v1/admin/staff/:id/status` with `status` and `expectedVersion`.

Create accepts only `ADMIN`, `SALES`, or `OPERATOR`; lifecycle endpoints operate only on staff accounts and never turn a Customer into staff. Promotion of an existing Customer is deliberately excluded because it creates identity-enumeration and account-takeover ambiguity that is not approved. Duplicate normalized mobile responses remain generic.

Alternatives considered: reusing the public registration endpoint would weaken the Customer-by-default boundary; direct database/CLI provisioning after bootstrap would not provide daily operational control or auditability.

### 3. Use optimistic concurrency and transactional safety invariants

`User` will gain a non-negative `version` defaulting to zero. Role and status commands will atomically match `id + expectedVersion`, re-check self-change and last-active-Administrator invariants inside a transaction, increment the version, revoke target sessions, and append one audit event. Stable conflicts will distinguish stale version from last-Administrator and invalid lifecycle operations without disclosing unrelated data.

The last-active-Administrator count and target update must be serialized sufficiently to prevent two Administrators being demoted/disabled concurrently. The implementation will use a PostgreSQL transaction with a lock/advisory-lock strategy scoped to staff privilege mutations, then re-read the active Administrator count before the conditional update. Unit tests will cover policy decisions; disposable PostgreSQL integration tests will prove concurrency and rollback behavior.

Alternatives considered: relying on a UI confirmation is not authoritative; a count followed by an unlocked update permits a race; database triggers would hide application policy and complicate portable test setup.

### 4. Revoke sessions after privilege-affecting changes

All sessions for the affected account will be revoked in the same database transaction as a successful role/status mutation and audit event. This prevents an already-issued Sales/Operator/Admin session from retaining stale access. Authorization will still derive current role/status from server state rather than trusting a client claim. The acting Administrator's session is preserved because self-demotion and self-disable are rejected.

Alternatives considered: waiting for session expiry creates an avoidable privilege window; embedding capability snapshots in session data risks stale authorization even if navigation is refreshed.

### 5. Extend existing operational services without exposing repositories

Inquiry controllers and services will require the inquiry-operation capability. The identity module's public staff lookup contract will provide bounded eligible assignees (`ADMIN` or `SALES`, active only); inquiry code will not import the identity repository. Existing versioning, transition policy, internal-note isolation, histories, audit atomicity, and Customer DTOs remain unchanged.

Content controllers/services will require the content-management capability and accept active Administrator or Operator actors. All six resources—Category, Product, InjectionService, Material, Article, and ManagedPage—retain their current validation, lifecycle, audit, and public visibility contracts.

Alternatives considered: duplicating account eligibility queries in inquiry/content modules violates module boundaries and makes role policy inconsistent.

### 6. Return explicit identity and navigation contracts

The authenticated identity DTO will expose the current fixed role and a bounded list of known capability identifiers, never raw permission records. The Next.js management shell will render navigation from this contract and each protected screen will perform its own server-side capability gate before loading data. `/admin/staff`, `/admin/staff/new`, and `/admin/staff/[id]` will use feature-owned UI and transport code with mobile cards at narrow widths and a table where space permits.

Forms will use server-side CSRF attachment consistent with existing management forms. Password fields will never be repopulated after an error, and success screens will not echo an initial password. Private fetches remain uncached; pages remain noindex.

Alternatives considered: role checks duplicated in individual React components are prone to drift; returning a general permission object exposes internal policy structure unnecessarily.

### 7. Audit only identifiers and non-sensitive authorization changes

New actions will cover staff creation, role change, and status change. Metadata may contain target id, previous/next role or status, and resulting version. It will exclude mobile, name, email, passwords/hashes, session/token identifiers, and raw input. Actor and target references preserve accountability even after an account is disabled.

## Risks / Trade-offs

- [PostgreSQL enum values are difficult to remove during rollback] → Deploy additive `SALES` and `OPERATOR` values before application code; rollback application behavior by denying those roles, and remove enum values only through a reviewed data migration after no rows use them.
- [Concurrent changes could remove all active Administrators] → Serialize privilege mutations and verify the invariant inside the transaction with real-PostgreSQL concurrency tests.
- [Active sessions could retain old access] → Read current account state for authorization and atomically revoke all target sessions on role/status change.
- [Completed but unarchived inquiry/content OpenSpec changes overlap this scope] → Implement against their current contracts, preserve their guarantees, and ensure archive order merges this delta after the underlying operational capabilities.
- [Expanding the shared shell can accidentally expose navigation or preload forbidden data] → Gate routes before data fetch, return bounded capabilities, and test direct URL access for every denied role pair.
- [Initial passwords create an operational secret-handling burden] → Accept them only over the protected CSRF-checked endpoint, hash immediately, never log/return/repopulate them, and leave invitation/recovery flows for a separately approved change.

## Migration Plan

1. Back up the database and verify at least one active Administrator exists.
2. Apply an additive migration for `SALES` and `OPERATOR` enum values and `User.version` with a safe default for existing rows; add only reviewed indexes needed by bounded staff filters.
3. Deploy backend capability policy, staff endpoints, atomic lifecycle commands, session revocation, and adjusted inquiry/content guards before exposing new navigation.
4. Deploy frontend capability-aware shell and staff screens.
5. Verify existing Administrator and Customer flows, then create test Sales and Operator accounts through the new endpoint and verify allowed/denied matrices.
6. Run unit, real-PostgreSQL integration, frontend, architecture, build, and Playwright suites at 360, 390, 768, and 1280 in light/dark coverage where supported.

Rollback will first hide staff-management UI and deploy backend code that denies new-role operations while preserving account/audit rows. Existing `SALES`/`OPERATOR` accounts will be disabled before any schema reversal. Because PostgreSQL enum removal is non-additive, enum cleanup requires a separate reviewed migration that rewrites affected rows/types after backup; it is not part of an emergency application rollback. `User.version` remains harmless if application rollback does not use it.

## Open Questions

None. The fixed role matrix, staff lifecycle safeguards, and initial-password creation flow were approved for this change; password recovery/invitations and custom permissions remain explicitly deferred.
