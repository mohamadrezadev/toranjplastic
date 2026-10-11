## Why

Admin content mutations currently persist the content change and write the required audit event as separate database operations, so an audit failure can leave a successful content mutation without its security record. The same six-resource workflow is also concentrated in large controller, service, repository, and interface files, increasing the risk and cost of extending or verifying the content domain.

## What Changes

- Make every successful admin content create, update, publish, and archive operation atomic with its audit event; failure of either write rolls back the whole operation.
- Introduce an application-facing unit-of-work contract so admin content services no longer depend directly on Prisma for audit persistence.
- Split the admin content controller, application services, repository contracts, and Prisma adapters into resource-focused modules while retaining shared lifecycle, validation, pagination, and mapping utilities where behavior is genuinely common.
- Remove the dependency from the admin content persistence adapter on the public content module's internal mapper by relocating shared stored-content normalization behind a neutral contract.
- Preserve all existing `/api/v1/admin/content` request and response contracts, authorization, CSRF, caching, lifecycle, slug-conflict, and public-visibility behavior.
- Add rollback and contract tests for each content-resource family and include backend end-to-end tests in the repository CI gate.
- Do not change public content presentation, the active brand-identity work, database schema, ecommerce scope, pricing, inventory, or business claims.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `content-management-operations`: Require content mutation and its audit event to commit atomically, including rollback behavior when either persistence step fails.
- `engineering-foundation`: Extend the continuous-integration quality gate to execute backend end-to-end contract tests in addition to the existing unit, frontend end-to-end, type, lint, and build checks.

## Impact

Affected areas are `backend/src/admin-content/`, the shared audit and stored-content normalization boundaries, backend unit and end-to-end tests, root test scripts, and `.github/workflows/ci.yml`. Existing API paths and payloads remain compatible, no Prisma migration or new runtime dependency is expected, and frontend application code is outside the implementation scope.
