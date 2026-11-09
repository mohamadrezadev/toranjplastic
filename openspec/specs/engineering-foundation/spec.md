## Purpose

Define the repository, OpenSpec, local database, and automated quality foundations shared by all Toranj applications.
## Requirements
### Requirement: Independent monorepo applications
The repository SHALL provide separate `frontend` and `backend` pnpm workspace packages with a single root dependency lock and root commands for development, linting, type checking, testing, and building.

#### Scenario: Install and run from the repository root
- **WHEN** a developer installs dependencies and invokes a root quality command
- **THEN** pnpm SHALL resolve both applications through the workspace without requiring package-local lockfiles

### Requirement: Official OpenSpec workflow
The repository SHALL use the official OpenSpec `spec-driven` schema, repository-local `openspec/` store, and generated Codex workflows as its only specification lifecycle.

#### Scenario: Start a behavioral change
- **WHEN** an agent or developer proposes a new behavioral change
- **THEN** the change SHALL be created under `openspec/changes/<change-name>/` and its artifacts SHALL follow instructions returned by the OpenSpec CLI

#### Scenario: Complete a behavioral change
- **WHEN** a change is verified and archived
- **THEN** OpenSpec SHALL merge its delta requirements into `openspec/specs/` and retain the archived change history

### Requirement: Safe local database tooling
The repository SHALL provide a local PostgreSQL service and version-controlled Prisma configuration that can be validated and generated without committing secrets.

#### Scenario: Prepare local database tooling
- **WHEN** a developer supplies local environment values and runs the documented database commands
- **THEN** PostgreSQL configuration SHALL resolve and Prisma SHALL validate and generate from the version-controlled schema

#### Scenario: Domain contract is not approved
- **WHEN** phase zero completes before a domain data model is specified
- **THEN** the repository SHALL NOT create speculative business entities or an initial business migration

### Requirement: Automated quality gate
The repository SHALL expose deterministic quality commands covering lint, TypeScript checking, automated unit and integration tests, backend end-to-end API contract tests, frontend end-to-end tests, architecture boundary checks, real PostgreSQL transaction integration tests, and production builds for both applications. Continuous integration MUST execute backend and frontend end-to-end suites, architecture boundary checks, and the PostgreSQL integration suite through explicit root-level scripts. PostgreSQL integration tests MUST fail closed when the isolated test database is unavailable or unsafe and MUST NOT silently skip.

#### Scenario: Continuous integration runs
- **WHEN** code is pushed to `main` or a pull request is opened
- **THEN** CI SHALL install the frozen root lockfile, generate Prisma, run lint, type checking, unit and integration tests, production builds, backend API contract tests, frontend end-to-end tests, architecture boundary checks, and PostgreSQL transaction integration tests

#### Scenario: Developer runs backend contract tests
- **WHEN** a developer invokes the documented root backend end-to-end test command with its required test environment available
- **THEN** pnpm SHALL run the backend API contract suite without requiring a package-local command invocation

#### Scenario: PostgreSQL integration environment is unavailable
- **WHEN** the PostgreSQL transaction integration command runs without the required isolated test database
- **THEN** the command SHALL fail with an actionable error and SHALL NOT report the integration suite as passed or skipped

### Requirement: Admin content feature boundaries are enforced
Admin content frontend logic SHALL be owned by resource-focused feature modules with documented public entrypoints. Shared contracts/helpers SHALL be dependency-neutral. The automated boundary check SHALL reject frontend imports from backend source, deep imports into another admin content feature, and cycles among admin content features while allowing imports through documented public entrypoints.

#### Scenario: Feature imports another feature through its public entrypoint
- **WHEN** one admin content feature uses a contract exported by another feature's documented public entrypoint
- **THEN** the architecture boundary check SHALL pass

#### Scenario: Forbidden feature dependency is introduced
- **WHEN** a fixture imports another feature's private file, introduces a feature cycle, or imports backend source from frontend
- **THEN** the architecture boundary check SHALL fail and CI SHALL report the offending import path

#### Scenario: Admin content routes use feature-owned logic
- **WHEN** any of the six admin content routes performs a list, detail, create, update, publish, archive, or form-mapping operation
- **THEN** it SHALL delegate that logic to the owning feature public entrypoint while retaining the existing route URL and rendered behavior

### Requirement: Containerized production build verification
The repository SHALL provide multi-stage Dockerfiles for `backend`, `frontend`, and `cms` and a root `compose.yaml` that build cleanly and deterministically from the workspace root with frozen pnpm dependencies, production asset optimizations, and fail-fast environment validation.

#### Scenario: Build backend container
- **WHEN** the backend Docker image is built from the repository root
- **THEN** Docker SHALL compile NestJS and Prisma client, install only production dependencies in the runner stage, and expose port 3001

#### Scenario: Build CMS container
- **WHEN** the CMS Docker image is built from the repository root
- **THEN** Docker SHALL build Strapi admin and server assets, install dependencies cleanly, and expose port 1337

#### Scenario: Build frontend container
- **WHEN** the frontend Docker image is built from the repository root with production build arguments
- **THEN** Docker SHALL build Next.js with Turbopack and partial prerendering, package the production runner, and expose port 3000

#### Scenario: Validate compose deployment configuration
- **WHEN** a developer or CI executes the compose configuration verification command
- **THEN** Docker compose SHALL parse the specification with valid service dependencies, volume definitions, and readiness health probes without syntax errors

### Requirement: Executable local Compose lifecycle
The repository SHALL provide a local-only root Docker Compose stack that builds and runs PostgreSQL 17, a one-shot Prisma migration service, NestJS Backend, Strapi CMS, and Next.js Frontend with deterministic dependency ordering, bounded readiness probes, loopback-only host exposure, environment-driven configuration, and persistent named volumes. The NestJS and Strapi databases MUST remain distinct, and ordinary stack shutdown MUST NOT delete persisted data.

#### Scenario: Validate Compose configuration
- **WHEN** a developer supplies the documented local environment file and runs the root Compose configuration check
- **THEN** Compose SHALL resolve every service, build target, dependency condition, health probe, network reference, port binding, and named volume without syntax or interpolation errors

#### Scenario: Initialize isolated application databases
- **WHEN** PostgreSQL starts against a fresh local data volume
- **THEN** it SHALL create the configured NestJS application database and a distinct Strapi database without sharing ORM schemas or migrations

#### Scenario: Apply migrations before Backend startup
- **WHEN** the stack starts with a healthy PostgreSQL service
- **THEN** the one-shot migration service SHALL run committed Prisma migrations to completion and Backend SHALL NOT start unless migration exits successfully

#### Scenario: Reach a healthy local stack
- **WHEN** all required local environment values are valid and the developer runs `docker compose up --build`
- **THEN** PostgreSQL, Backend, CMS, and Frontend SHALL become healthy, server-to-server calls SHALL resolve through Compose service names, and browser-facing endpoints SHALL remain reachable through loopback host ports

#### Scenario: Preserve local data during ordinary shutdown
- **WHEN** a developer runs `docker compose down` without the volume-removal option and later starts the stack again
- **THEN** PostgreSQL records, Backend-managed media, and Strapi uploads SHALL remain available from their named volumes

#### Scenario: Reject unavailable prerequisites
- **WHEN** PostgreSQL is unhealthy, migration fails, or a required runtime configuration is invalid
- **THEN** dependent services SHALL remain stopped or unhealthy and the stack SHALL expose an actionable container exit or health status instead of reporting readiness

#### Scenario: Keep the default stack local-only
- **WHEN** the default Compose configuration publishes service ports
- **THEN** it SHALL bind them to `127.0.0.1`, SHALL NOT embed production secrets, and SHALL document that TLS and production secret management require a separate deployment configuration

