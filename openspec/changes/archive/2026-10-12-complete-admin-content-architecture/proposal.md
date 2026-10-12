## Why

The archived backend boundary refactor established six resource slices and transactional audit writes, but its acceptance evidence does not yet include a real PostgreSQL rollback test or automated import-boundary checks. Admin frontend transport, actions, and form mapping also remain aggregated, so the architecture work is only partially complete.

## What Changes

- Extract the six admin content clients, server actions, and form mappings into feature-owned modules while keeping App Router routes as thin orchestration and preserving every URL, payload, authorization check, and visible interaction.
- Add real PostgreSQL integration coverage for content-plus-audit atomicity and execute it in CI against a pinned PostgreSQL service.
- Enforce frontend/backend and feature import boundaries in CI, including negative fixtures that prove forbidden imports fail.
- Record the architecture, test commands, rollback approach, and requirement-to-evidence mapping in project guidance.

Non-goals: no new business capabilities, API or database-schema changes, design changes, ecommerce behavior, speculative modules, or physical backend folder move.

## Capabilities

### New Capabilities
- None. This change strengthens existing repository and CMS implementation requirements without adding product behavior.

### Modified Capabilities
- `engineering-foundation`: Require verifiable PostgreSQL integration and automated architecture boundary checks as part of the quality gate.

## Impact

Affected areas: `frontend/src/app/admin`, new `frontend/src/features/admin-content`, backend integration-test setup, root/frontend/backend package scripts, `.github/workflows/ci.yml`, and architecture/agent documentation. Public and admin HTTP contracts and the Prisma schema remain unchanged.
