## Why

The platform currently supports only a one-time bootstrap Administrator and has no safe way to create additional staff accounts or separate inquiry work from content operations. The approved fixed-role model is needed now so daily operations can be delegated without sharing full Administrator access.

## What Changes

- Add an Administrator-only staff-management area and versioned API for listing staff, creating `ADMIN`, `SALES`, and `OPERATOR` accounts, changing a staff role, and activating or disabling access.
- Introduce a fixed server-enforced capability matrix: `ADMIN` has full management access, `SALES` operates inquiries, `OPERATOR` operates the six CMS resources (including catalog categories), and `CUSTOMER` remains limited to customer-owned functionality.
- Extend inquiry access and assignment eligibility to active `SALES` accounts while keeping staff management and CMS mutation forbidden to them.
- Extend content-management access to active `OPERATOR` accounts while keeping inquiry operations and staff management forbidden to them.
- Prevent privilege lockout and unsafe lifecycle actions: public registration remains Customer-only, staff accounts are never hard-deleted, self-demotion/self-disable is rejected, and the last active Administrator cannot be demoted or disabled.
- Revoke active sessions after a staff role or status change and audit staff creation, role changes, and status changes without credentials or personal data in audit metadata.
- Add responsive Persian RTL staff list/create/detail experiences and capability-aware Admin navigation at 360, 390, 768, and 1280 pixels.
- Keep ecommerce, custom permission builders, OTP/password recovery, and public staff registration out of scope.

## Capabilities

### New Capabilities

- `staff-access-management`: Administrator-controlled staff creation and lifecycle, fixed role/capability policy, inquiry assignment eligibility, session revocation, audit behavior, and responsive staff-management UI.

### Modified Capabilities

- `role-authorization`: Replace the Administrator-only protected-workspace assumption with server-enforced fixed capabilities for `ADMIN`, `SALES`, `OPERATOR`, and `CUSTOMER`.
- `identity-accounts`: Add persisted `SALES` and `OPERATOR` roles while preserving Customer-by-default registration and one-time initial Administrator bootstrap.
- `content-management-operations`: Permit active `OPERATOR` accounts, in addition to active Administrators, to use protected content operations.
- `admin-content-console`: Permit active `OPERATOR` accounts to access the CMS console while hiding and denying management areas outside their capabilities.

## Impact

- Backend identity, session, authorization guards/policies, inquiry operations, content-management modules, explicit DTOs, audit events, and tests.
- Prisma role enum and staff concurrency/session-revocation persistence, with a reviewed PostgreSQL migration and rollback/backup notes.
- New `/api/v1/admin/staff` endpoints plus adjusted inquiry assignee and protected content contracts.
- Frontend Admin shell/navigation, staff screens, inquiry/content route gates, shared contracts, responsive states, and end-to-end coverage.
- No new external service or runtime dependency is expected.
