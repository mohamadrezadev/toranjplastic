## Why

The public catalog and secure customer identity are available, but customers still cannot submit or privately track the commercial requests that are the core of Toranj Plastic v1. This change delivers the first PRD 04 inquiry slice before admin handling and quotations are introduced.

## What Changes

- Add authenticated submission contracts for product inquiries, injection-service requests, material inquiries, and general contact requests.
- Persist each request with the approved `Submitted` initial status and an atomic status-history entry.
- Add authenticated, owner-scoped customer APIs for filtering, listing, and viewing inquiry details.
- Add Persian RTL customer portal screens for choosing a request type, completing each approved form, and viewing the current user's requests and details.
- Keep every private response and page `no-store`/`noindex`, enforce ownership in the backend, and structurally exclude internal notes and future operational data from customer DTOs.
- Add a named Prisma migration, rollback/backup guidance, negative authorization/ownership tests, and responsive UI verification.
- Explicitly defer file upload/download, customer/admin messaging, admin assignment/status handling, notifications, quotations, pricing, payment, live inventory, and automatic cost calculation to separately approved changes.

## Capabilities

### New Capabilities

- `customer-inquiries`: Customer submission, validation, ownership, status history, private list/detail APIs, and customer portal behavior for the four PRD 04 request types.

### Modified Capabilities

- `responsive-public-shell`: Replace the provisional inquiry/account destinations with authenticated customer-portal navigation while preserving private-page indexing and cache rules.

## Impact

- Backend: a new `inquiries` domain module, versioned API routes, DTO validation, Prisma models/enums, and a named PostgreSQL migration.
- Frontend: server-only inquiry transport/contracts, authenticated account layout, inquiry forms, request list/detail screens, and CTA routing.
- Tests: backend unit/e2e and migration coverage plus frontend unit/component/e2e coverage for submission, filtering, ownership failures, RTL states, and private metadata.
- No new external service or runtime dependency is required; attachments and outbound notifications remain disabled until their storage, retention, and provider contracts are approved.
