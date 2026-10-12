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
The repository SHALL expose deterministic quality commands covering lint, TypeScript checking, automated unit and integration tests, backend end-to-end API contract tests, frontend end-to-end tests, and production builds for both applications. Continuous integration MUST execute both backend and frontend end-to-end suites through explicit root-level scripts.

#### Scenario: Continuous integration runs
- **WHEN** code is pushed to `main` or a pull request is opened
- **THEN** CI SHALL install the frozen root lockfile, generate Prisma, run lint, type checking, unit and integration tests, production builds, backend end-to-end API contract tests, and frontend end-to-end tests

#### Scenario: Developer runs backend contract tests
- **WHEN** a developer invokes the documented root backend end-to-end test command with its required test environment available
- **THEN** pnpm SHALL run the backend API contract suite without requiring a package-local command invocation
