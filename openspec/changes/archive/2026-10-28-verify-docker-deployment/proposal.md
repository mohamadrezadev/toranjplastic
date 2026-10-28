## Why

The Toranj Plastic production deployment relies on containerized services (NestJS backend, Next.js frontend, Strapi CMS, and PostgreSQL) defined via Dockerfiles and `compose.yaml`. While these files exist, they must be validated, hardened, and verified under real Docker builds to guarantee that images build cleanly without missing build-time arguments, that container health checks are established, that volume mounts and permissions are properly aligned, and that deployment on PaaS/IaaS providers (such as Runflare) will execute deterministically without unexpected runtime failures.

## What Changes

- **Docker Build Validation**: Verify and validate independent and compose builds for `backend`, `cms`, and `frontend` Docker images.
- **Compose Service Health & Dependency Hardening**:
  - Add backend healthcheck (`GET /api/v1/ready`) to `compose.yaml`.
  - Update `frontend` service dependency in `compose.yaml` to wait on `backend` and `cms` reaching healthy states.
  - Ensure build arguments (e.g. `NEXT_PUBLIC_API_URL`, `BACKEND_API_URL`, `STRAPI_API_URL`, `MEDIA_PUBLIC_ORIGIN`, `STRAPI_MEDIA_ORIGIN`) are properly passed to frontend build stage.
- **Root Docker Validation Tooling**: Expose deterministic npm/pnpm script or validation command (`pnpm check:docker` or docker compose config validation) to assert compose configuration and syntax integrity in continuous workflows.
- **Runflare Deployment Guide Alignment**: Update and verify that [runflare-deployment.md](file:///c:/project/toranjplastic/docs/runbooks/runflare-deployment.md) accurately reflects the verified image build steps, required environment variables, and health probe configurations.

## Capabilities

### New Capabilities
<!-- No new functional capabilities introduced -->

### Modified Capabilities
- `engineering-foundation`: Added requirements and scenarios for containerized production build verification and docker compose deployment readiness.

## Impact

- `compose.yaml`: Service health checks, depends_on conditions, and build args configuration.
- `backend/Dockerfile`, `frontend/Dockerfile`, `cms/Dockerfile`: Multi-stage build validation and runner optimizations.
- `package.json`: Addition of `check:docker` script for compose validation.
- `docs/runbooks/runflare-deployment.md`: Operational alignment with verified container parameters.
