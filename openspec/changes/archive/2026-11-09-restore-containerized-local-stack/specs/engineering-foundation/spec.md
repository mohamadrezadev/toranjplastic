## ADDED Requirements

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
