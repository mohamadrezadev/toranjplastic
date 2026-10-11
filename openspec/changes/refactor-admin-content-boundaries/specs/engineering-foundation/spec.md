## MODIFIED Requirements

### Requirement: Automated quality gate
The repository SHALL expose deterministic quality commands covering lint, TypeScript checking, automated unit and integration tests, backend end-to-end API contract tests, frontend end-to-end tests, and production builds for both applications. Continuous integration MUST execute both backend and frontend end-to-end suites through explicit root-level scripts.

#### Scenario: Continuous integration runs
- **WHEN** code is pushed to `main` or a pull request is opened
- **THEN** CI SHALL install the frozen root lockfile, generate Prisma, run lint, type checking, unit and integration tests, production builds, backend end-to-end API contract tests, and frontend end-to-end tests

#### Scenario: Developer runs backend contract tests
- **WHEN** a developer invokes the documented root backend end-to-end test command with its required test environment available
- **THEN** pnpm SHALL run the backend API contract suite without requiring a package-local command invocation
