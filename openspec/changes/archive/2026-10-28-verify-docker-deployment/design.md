## Context

Toranj Plastic v1 comprises four containerized services deployed together or independently:
1. `postgres:17-alpine`: Relational database with dual schemas (`toranj` and `toranj_strapi`).
2. `backend` (NestJS 12, Node 24, Prisma 7, Alpine): B2B core business logic, role-based authorization, quotations, inquiries, media uploads.
3. `cms` (Strapi v5, Node 24, Alpine): Headless CMS for articles, categories, tags, and SEO metadata.
4. `frontend` (Next.js 16.4.3, React 19, Node 24, Alpine): Public corporate catalog, inquiry flows, customer portal, and admin interface.

While Dockerfiles were previously created, they have not undergone strict end-to-end multi-stage build tests, healthcheck orchestration tuning in `compose.yaml`, or root validation scripting. Verifying these containers directly against the running Docker engine ensures frictionless deployment on cloud hosts like Runflare.

## Goals / Non-Goals

**Goals:**
- Validate that all three images (`backend`, `cms`, `frontend`) build deterministically using multi-stage Docker builds from repository root.
- Add an explicit health probe for `backend` (`/api/v1/ready`) in `compose.yaml`, mirroring existing healthchecks on `postgres` and `cms`.
- Update `compose.yaml` service dependencies so that `frontend` gracefully awaits both `backend` and `cms` health before accepting live traffic.
- Pass required build arguments to `frontend` so Next.js static and client builds embed intended API origins.
- Add a root script `pnpm check:docker` to validate compose configuration without needing to start containers.
- Align `docs/runbooks/runflare-deployment.md` with verified configuration and commands.

**Non-Goals:**
- Altering application runtime architectures, switching base distributions away from Alpine, or replacing pnpm monorepo structure.
- Deploying to live third-party cloud accounts during local verification.
- Re-architecting database schemas or combining Strapi and NestJS into a single image.

## Decisions

### 1. Multi-Stage Dockerfile Strategy
- **Decision:** Keep multi-stage builds (`builder` -> `runner`) using `node:24-alpine` with `corepack` enabling `pnpm@9.15.9`.
- **Rationale:** Minimizes final container footprint by omitting build dependencies (compilers, devDependencies, typescript) while retaining immutable lockfile guarantees (`--frozen-lockfile`).

### 2. Service Healthcheck Orchestration in Compose
- **Decision:** Define healthchecks across all three app services:
  - `postgres`: `pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}`
  - `backend`: `wget -q -O - http://127.0.0.1:3001/api/v1/ready || exit 1`
  - `cms`: `wget -q -O - http://127.0.0.1:1337/_health || exit 1`
- **Rationale:** Ensures clean startup sequencing. Frontend doesn't encounter connection refused errors during container cold starts.

### 3. Build Arguments Injection for Frontend
- **Decision:** Declare and forward `build.args` in `compose.yaml` for `frontend`:
  - `NEXT_PUBLIC_API_URL`
  - `MEDIA_PUBLIC_ORIGIN`
  - `STRAPI_MEDIA_ORIGIN`
- **Rationale:** Next.js embeds `NEXT_PUBLIC_*` variables into client bundles at build time. Declaring them in `compose.yaml` args guarantees consistent behavior between local development and containerized builds.

## Risks / Trade-offs

- **[Risk] Docker build duration in CI/Local** -> *Mitigation*: Multi-stage layer caching with pnpm store and cached package manifests ensures unchanged layers build in seconds.
- **[Risk] Alpine libc compatibility with native modules (sharp, argon2)** -> *Mitigation*: Both `argon2` and `sharp` provide pre-built linux-musl binaries for Node 24; `libc6-compat`, `python3`, `make`, and `g++` are included in the builder stage as fallback.
