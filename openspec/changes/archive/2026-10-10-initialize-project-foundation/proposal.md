## Why

The repository started empty while the implementation handoff requires independently deployable Next.js and NestJS applications, shared quality gates, and a controlled path from PRD to code. A reproducible foundation and the official OpenSpec workflow are needed before domain features can be added without inventing product behavior.

## What Changes

- Initialize the official OpenSpec `spec-driven` workflow and Codex integration at the repository root.
- Establish a pnpm monorepo with separate `frontend/` and `backend/` applications.
- Add a Persian RTL frontend foundation using the provisional Toranj design tokens and no unverified commercial content.
- Add a versioned NestJS API bootstrap and public liveness health contract.
- Add local PostgreSQL and Prisma configuration without premature domain models or migrations.
- Add root quality commands, CI, environment examples, architecture guidance, and scoped agent rules.
- Non-goals: authentication/OTP, CMS, inquiry persistence, customer/admin portals, quotations, uploads, production PWA, ecommerce, payment, inventory, and automatic pricing.

## Capabilities

### New Capabilities

- `engineering-foundation`: Reproducible workspace, environment, quality gates, database tooling, and agent boundaries for future delivery.
- `rtl-web-foundation`: Persian RTL application shell and semantic design-token baseline that clearly identifies provisional content.
- `service-health`: Stable, versioned liveness endpoint for the backend process.

### Modified Capabilities

None.

## Impact

This change affects the repository root, `frontend/`, `backend/`, local Docker development, Prisma generation, GitHub Actions, and contributor/agent workflows. It introduces Node.js 24 and pnpm workspace requirements but does not create a production database schema or externally consumed business API.
