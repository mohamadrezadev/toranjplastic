## Context

The admin content capability manages Category, Product, InjectionService, Material, Article, and ManagedPage through one 237-line controller, one 483-line application service, one 660-line Prisma repository, and a single repository interface. Each mutation currently calls a repository and then calls `recordAuditEvent` with `PrismaService`; those calls are separate commits. The service therefore crosses its repository abstraction to access infrastructure directly, while the Prisma admin repository imports normalization helpers from the public content module's internal mapper.

The existing `/api/v1/admin/content` endpoints, DTO validation, Admin/CSRF guards, `no-store` behavior, lifecycle semantics, public read filtering, and Prisma schema are established contracts and must remain compatible. The active brand-identity change is unrelated and must not be modified.

## Goals / Non-Goals

**Goals:**

- Guarantee atomic commit or rollback of every persisted admin content mutation and its audit event.
- Make application services depend on explicit repository and unit-of-work contracts rather than `PrismaService`.
- Give each of the six content resources a focused controller, service, repository contract, Prisma adapter, and test surface inside the existing NestJS modular monolith.
- Keep genuinely shared lifecycle, validation, pagination, audit, and stored-JSON normalization behavior in named shared components.
- Preserve all existing API paths and response shapes and add backend end-to-end execution to CI.

**Non-Goals:**

- No Prisma schema or migration changes.
- No endpoint, DTO, authorization, CSRF, caching, or public-content behavior changes beyond enforcing the already-required audit behavior atomically.
- No frontend UI refactor, brand work, ecommerce behavior, pricing, inventory, or unverified business claims.
- No generic CRUD framework or metaprogramming layer that hides resource-specific business rules.
- No replacement of the authentication rate limiter; that requires a separate security and deployment decision.

## Decisions

1. **Use an application-facing unit-of-work port with a transaction-scoped context.** `AdminContentUnitOfWork.run` will execute a callback inside `PrismaService.$transaction`. The callback receives transaction-scoped resource repositories and an `AuditEventWriter`, so services can read current state, persist the mutation, and record the audit event in one transaction without importing Prisma. The Prisma implementation will construct adapters over a narrow client interface implemented by both `PrismaService` and `Prisma.TransactionClient`. Alternative: inject `PrismaService` into every service and call `$transaction` directly. Rejected because it preserves the current application/infrastructure boundary leak. Alternative: put audit writes inside repository CRUD methods. Rejected because it couples reusable persistence operations to actor and audit policy.

2. **Split by resource while retaining one public Nest module.** `AdminContentModule` remains the capability boundary and wires six resource-focused controllers and services. Each resource owns its repository contract and Prisma adapter; shared code is limited to unit-of-work infrastructure, lifecycle orchestration, validation helpers, paging primitives, and common admin-content types. Existing routes remain under `/admin/content`. Alternative: create six independent Nest modules immediately. Rejected because the resources share one authorization and transaction boundary and separate modules would add wiring without creating an external capability boundary.

3. **Prefer explicit resource operations over a generic CRUD base class.** Resource services may call small shared functions for trimming nullable text, safe media/CTA validation, slug-conflict translation, and lifecycle transitions, but their create/update mappings and repository methods remain explicitly typed. This keeps Product category/media behavior, Material attributes, Article body fields, and ManagedPage semantics visible to reviewers.

4. **Move stored JSON normalization to a neutral shared boundary.** Image and specification parsing currently used by both public and admin projections will move from the public mapper implementation to a small `content-shared` contract/normalizer. Public and admin mappers depend on that neutral code; neither content module imports the other's internal implementation. No response-shape change is permitted.

5. **Preserve HTTP compatibility through characterization and contract tests.** Existing backend end-to-end tests will continue to exercise the same URLs and response contracts. Unit tests will add explicit failure injection proving rollback when audit persistence fails and proving no audit commit when content persistence fails. Each resource family must cover create/update and lifecycle behavior, including the idempotent publish/archive audit requirement.

6. **Expose backend and aggregate end-to-end scripts at the workspace root.** Root scripts will distinguish backend and frontend end-to-end suites and provide an aggregate CI command. The current backend contract suite replaces persistence providers with deterministic fakes, so CI will execute it without introducing a database service; true migration/database integration remains a separate concern. CI will then execute the existing four-viewport Playwright suite. Unit tests remain part of `pnpm check`; end-to-end commands remain explicit because they have different runtime prerequisites.

## Risks / Trade-offs

- **[Large file movement can create accidental API drift]** → Lock routes and payloads with existing and expanded end-to-end characterization tests before deleting the original aggregate classes.
- **[Transaction-scoped repository construction can become complex]** → Define one narrow Prisma-client-compatible interface and one factory; do not introduce a service locator or nested transactions.
- **[Generic lifecycle helpers can erase resource rules]** → Share only the transaction/audit sequence and keep resource-specific mapping and validation explicit.
- **[Idempotent requests add audit volume]** → Preserve the existing normative audit contract and include from/to status metadata; no content timestamp is changed.
- **[Provider-overridden backend end-to-end tests do not prove real PostgreSQL behavior]** → Keep Prisma adapter unit tests for generated query shapes and transaction behavior; propose a separate database-integration change if migration-level coverage becomes necessary.
- **[Parallel work can conflict with the active brand change]** → This change does not edit frontend presentation or brand assets; the only frontend-related CI action is invoking the existing Playwright suite.

## Migration Plan

1. Add characterization tests and root backend end-to-end tooling before moving production code.
2. Introduce the neutral normalizer and transaction/unit-of-work contracts alongside the current implementation.
3. Move one resource at a time to its focused service/controller/repository and keep all existing routes green after each move.
4. Switch every mutation to the unit-of-work path, add rollback tests, then remove direct `PrismaService` access and obsolete aggregate implementations.
5. Run lint, typecheck, unit/integration tests, backend end-to-end tests, frontend end-to-end tests, and production builds before archive.

Rollback is a code revert: there is no schema migration or persistent data transformation. Existing content and audit records remain valid.

## Open Questions

None. Database-backed migration integration is intentionally deferred rather than silently adding CI credentials or infrastructure in this refactor.
