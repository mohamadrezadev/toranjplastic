## Context

The implementation handoff fixes the stack and product boundaries but the repository had no code, workspace, or delivery workflow. Phase zero crosses frontend, backend, local infrastructure, CI, and agent behavior. Brand identity, domain schemas, OTP, file policy, and detailed permissions remain unresolved product inputs and must not be encoded as final behavior.

## Goals / Non-Goals

**Goals:**

- Create one reproducible pnpm workspace with independently runnable frontend and backend packages.
- Make Persian RTL, semantic tokens, versioned API conventions, configuration safety, and quality gates the default.
- Use the official OpenSpec `spec-driven` schema and generated Codex workflows as the only feature-planning lifecycle.
- Prepare PostgreSQL/Prisma tooling without inventing domain entities or producing a premature migration.

**Non-Goals:**

- Implementing authentication, CMS, inquiry workflows, portals, quotations, uploads, service worker behavior, or production deployment.
- Approving brand colors, typography assets, logos, contact details, industrial claims, or final page content.
- Defining an ecommerce, payment, inventory, ERP, or automatic pricing capability.

## Decisions

### pnpm workspace with two application roots

`frontend/` and `backend/` remain independent packages under one root lockfile. Root scripts orchestrate both without importing runtime code across the boundary. This keeps deployments separable while centralizing onboarding and CI. A single mixed application was rejected because it weakens the API/data boundary; separate repositories were rejected because v1 benefits from atomic contract changes and shared gates.

### Next.js web boundary and NestJS modular-monolith boundary

Next.js owns rendering and browser interaction only. NestJS owns validation, authorization, business rules, persistence, and audit under `/api/v1`. PostgreSQL is reachable only from the backend. Microservices were rejected for phase zero because there is no scaling or ownership evidence that justifies distributed operations.

### Prisma configuration without domain models

Prisma CLI/config/schema and local PostgreSQL are added, but the schema has no business model or initial migration. The first domain change will introduce reviewed models and migration through its own OpenSpec change. This avoids turning handoff ambiguities into durable database contracts.

### Safe bootstrap defaults

The backend uses a validated port/origin, Helmet, strict global validation, a single configured CORS origin, and `/api/v1`. The public health endpoint is a liveness check only and returns no database, host, environment, or secret detail. Future readiness checks belong to a separate protected/operational contract.

### Provisional visual foundation

Design System v2 tokens are copied as semantic CSS custom properties and labelled provisional. The phase-zero page is Persian, RTL, responsive, and `noindex` because it is foundation content rather than approved production content. External web fonts and fake logos are not fetched; approved local assets can be added later.

### Official OpenSpec lifecycle

`openspec init --tools codex` owns the structure and workflow files. Project constraints live in `openspec/config.yaml`; each behavior change lives in `openspec/changes/<name>/` and reaches `openspec/specs/` only through sync/archive. A parallel custom `specs/` framework is prohibited.

## Risks / Trade-offs

- **[Provisional UI could be mistaken for approved brand]** → Label the tokens/content as provisional and keep the page `noindex` until brand/content approval.
- **[No initial domain migration delays database connectivity tests]** → Validate and generate Prisma now; add database integration with the first approved domain schema.
- **[Node/Next/Nest versions are recent]** → Lock package versions and require lint, typecheck, test, and production build in CI.
- **[A liveness-only endpoint does not prove dependencies are healthy]** → Add a distinct readiness contract when deployment requirements and observability are specified.
- **[CORS single-origin setting may be insufficient for staging]** → Introduce an explicit allowlist in a deployment-focused change rather than permissive wildcard behavior.

## Migration Plan

1. Initialize OpenSpec and commit its generated Codex workflows and project config.
2. Create the root workspace, application scaffolds, environment example, and local PostgreSQL service.
3. Apply frontend RTL/tokens and backend secure bootstrap/health contract.
4. Install a single root dependency graph, generate Prisma, and run all quality gates.
5. Roll back by reverting foundation files; no production resource or database migration is created. Docker volumes are never deleted automatically.

## Open Questions

- Which final logo, font files, colors, and PWA icons are approved?
- Which deployment environments/origins and Node hosting topology will be used?
- What is the first approved domain capability and therefore the first database model/migration?
