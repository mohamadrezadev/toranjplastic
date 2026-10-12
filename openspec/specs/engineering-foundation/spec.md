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

