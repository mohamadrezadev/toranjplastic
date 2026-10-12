## MODIFIED Requirements

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

## ADDED Requirements

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
