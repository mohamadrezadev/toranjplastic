## Why

The repository documents a root Docker Compose stack and already contains service Dockerfiles, but the referenced `compose.yaml` is absent. Developers therefore cannot execute the documented one-command local stack, and container networking, database isolation, migration ordering, persistence, and readiness are not currently enforced as a working deployment contract.

## What Changes

- Restore a version-controlled root `compose.yaml` for PostgreSQL 17, Prisma migration, NestJS Backend, Strapi CMS, and Next.js Frontend.
- Provision the NestJS and Strapi databases separately inside PostgreSQL without sharing schemas or migrations.
- Add persistent volumes for PostgreSQL, Backend-managed media, and Strapi uploads.
- Add bounded health probes and dependency conditions so application services start only after their prerequisites are ready.
- Separate container-internal service URLs from browser-facing localhost URLs.
- Align Dockerfiles, `.env.example`, root quality commands, and local-development documentation with the runnable stack.
- Keep the default stack explicitly local-only: no TLS, production secret management, ecommerce behavior, or automatic administrator credential generation beyond existing opt-in bootstrap behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engineering-foundation`: Strengthen the existing containerized-build requirement into an executable local Compose lifecycle covering database provisioning, migration ordering, persistence, health, loopback exposure, configuration validation, and documented teardown.

## Impact

- Root infrastructure: `compose.yaml`, PostgreSQL initialization assets, `.env.example`, `.dockerignore`, and package scripts.
- Container builds: `backend/Dockerfile`, `cms/Dockerfile`, and potentially `frontend/Dockerfile` where required for deterministic health and runtime behavior.
- Operational documentation: root README and local-development runbook.
- No product API, business schema, role, inquiry status, or public catalog behavior changes.
