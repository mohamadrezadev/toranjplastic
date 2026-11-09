## Context

The monorepo already has Dockerfiles for Next.js, NestJS, and Strapi, plus an existing engineering requirement for a root Compose deployment. The root `compose.yaml` is absent, so the documented commands cannot run. Container execution also needs two URL domains: Docker DNS names for server-to-server requests and localhost URLs for the browser. NestJS and Strapi require separate PostgreSQL databases, Prisma migrations must complete before Backend readiness, and managed media must survive container replacement.

This design targets local development and acceptance verification. It deliberately does not claim production hardening, TLS termination, external secret management, backup automation, or multi-node orchestration.

## Goals / Non-Goals

**Goals:**

- Build and run PostgreSQL, migration, Backend, CMS, and Frontend from the repository root.
- Preserve the existing Backend/CMS database isolation contract.
- Make startup deterministic through health and completion conditions.
- Persist application data without making teardown destructive by default.
- Keep public host ports loopback-only and document operator workflows.
- Validate Compose statically and prove the stack with real containers when Docker Engine is available.

**Non-Goals:**

- Production deployment, TLS, ingress, CDN, horizontal scaling, or managed databases.
- Committing production secrets or generating credentials silently.
- Changing application APIs, Prisma business schema, Strapi content models, or product behavior.

## Decisions

### 1. One PostgreSQL service with two databases

The stack uses the official PostgreSQL 17 Alpine image and a small idempotent initialization script under `docker/postgres/init/`. The image-created `POSTGRES_DB` remains owned by the Backend; the script creates `STRAPI_DATABASE_NAME` as a distinct database owned by the same local development role.

Using one server reduces local resource use while preserving database isolation. Sharing one database/schema was rejected because it violates the Strapi capability contract. Running two PostgreSQL containers was rejected as unnecessary local overhead.

### 2. One-shot Prisma migration service

`backend-migrate` builds the Backend Dockerfile's builder stage, waits for PostgreSQL health, and runs `prisma migrate deploy`. The Backend depends on successful completion rather than embedding migration into every application restart.

This keeps migration failure visible and prevents the API from serving against an outdated schema. A sleep-based entrypoint was rejected because it is timing-dependent. Running migration inside the Backend command was rejected because it couples schema mutation to every process restart.

### 3. Explicit local runtime profile

Backend and CMS containers run compiled/start commands with `NODE_ENV=development` because the default local stack uses HTTP and development credentials supplied through `.env`. Frontend still runs its production build and production server. The Compose file is explicitly local-only and binds published ports to `127.0.0.1`.

Pretending the stack is production was rejected: Backend production validation requires an HTTPS media origin and secure cookies, while Strapi correctly requires non-placeholder production secrets. Those controls remain intact for real production deployments.

### 4. Internal and browser URL separation

- Server-only requests use `http://backend:3001` and `http://cms:1337`.
- Browser-visible API/media/site URLs use `http://localhost:<published-port>`.
- Frontend build arguments and runtime environment both receive the appropriate values because Next.js uses some configuration during build and some during server execution.
- Strapi revalidation targets `http://frontend:3000/api/revalidate` inside the Compose network.

### 5. Persistent named volumes

Named volumes back PostgreSQL data, Backend media, and Strapi uploads. `docker compose down` preserves them; only the explicitly documented `docker compose down --volumes` removes them. No bind mount to a host absolute media path is required for the default stack.

### 6. Health is service-specific

- PostgreSQL: `pg_isready` against the configured application database.
- Backend: `/api/v1/ready`, proving PostgreSQL and mounted media readiness.
- CMS: Strapi `/_health`.
- Frontend: root HTTP response.

Frontend waits for Backend and CMS health so its server-rendered routes have reachable upstreams. Health probes use bounded intervals, timeouts, retries, and start periods.

### 7. Configuration remains environment-driven

Compose interpolates `.env` and supplies safe local defaults where appropriate. Real `.env` files remain excluded by `.dockerignore` and Git. The configuration fails early when required variables are absent or malformed; it does not commit real secrets.

## Risks / Trade-offs

- [Docker image downloads require network access] → Keep images pinned by major/minor tag and report an external network blocker separately from configuration failure.
- [Alpine native dependency compilation can be slow] → Preserve layer caching and frozen pnpm installs; add only required build packages.
- [PostgreSQL init scripts run only on a fresh volume] → Document that changing database names requires an explicit migration or destructive local volume reset.
- [Local development mode is not production-equivalent] → Label the stack local-only and retain existing production secret/HTTPS validation paths.
- [Health probes can pass before optional seeded content exists] → Define health as process/dependency readiness; seeding remains application-owned and independently observable.
- [Compose teardown can destroy data when `--volumes` is used] → Keep ordinary teardown non-destructive and place the destructive command behind an explicit warning.

## Migration Plan

1. Add PRD and OpenSpec artifacts.
2. Add PostgreSQL initialization asset and root Compose configuration.
3. Align Dockerfiles and environment examples.
4. Validate with `docker compose config --quiet` and Dockerfile builds.
5. Start the stack, wait for healthy services, and verify public health URLs.
6. Restart without removing volumes and confirm readiness.
7. Update the local runbook and README.

Rollback removes the Compose/init assets and reverts Dockerfile/documentation changes. Existing named volumes are not removed automatically.

## Open Questions

None for the local stack. Production container orchestration and secret distribution require a separate deployment change.
