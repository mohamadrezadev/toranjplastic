## 1. Docker Compose Configuration & Healthchecks

- [x] 1.1 Add backend healthcheck probe (`/api/v1/ready`) to `compose.yaml`
- [x] 1.2 Configure build arguments and `service_healthy` dependencies in `compose.yaml`
- [x] 1.3 Add `check:docker` script in root `package.json` for deterministic compose validation

## 2. Dockerfile Verification & Multi-Stage Builds

- [x] 2.1 Verify and execute Docker build for NestJS backend container
- [x] 2.2 Verify and execute Docker build for Strapi CMS container
- [x] 2.3 Verify and execute Docker build for Next.js frontend container
- [x] 2.4 Verify end-to-end `docker compose config` and build validation across all services

## 3. Deployment Runbook & Final Quality Checks

- [x] 3.1 Update `docs/runbooks/runflare-deployment.md` with verified health probes, build args, and deployment instructions
- [x] 3.2 Run monorepo regression suite (`check:architecture`, `typecheck`, `test`) to ensure 100% integrity
- [x] 3.3 Archive change into OpenSpec specs
