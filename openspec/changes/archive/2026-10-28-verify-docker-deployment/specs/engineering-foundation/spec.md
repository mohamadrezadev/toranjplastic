## ADDED Requirements

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
