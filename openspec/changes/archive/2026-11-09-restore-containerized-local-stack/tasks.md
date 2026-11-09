## 1. Compose foundation and database isolation

- [x] 1.1 Add an idempotent PostgreSQL initialization asset that creates the configured isolated Strapi database on a fresh volume.
- [x] 1.2 Add root `compose.yaml` services for PostgreSQL and one-shot Prisma migration with health/completion dependency conditions and loopback-only database exposure.
- [x] 1.3 Add Backend, CMS, and Frontend services with internal DNS URLs, browser-facing localhost URLs, bounded healthchecks, restart behavior, and persistent named volumes.

## 2. Container build and configuration alignment

- [x] 2.1 Update service Dockerfiles only where needed so the declared build targets and runtime health tools build deterministically from the monorepo root with frozen dependencies.
- [x] 2.2 Align `.env.example`, `.dockerignore`, and root package scripts with Compose interpolation, local-only defaults, database isolation, and configuration verification.
- [x] 2.3 Add a deterministic static verification script or test for required services, dependency conditions, loopback bindings, healthchecks, volumes, and absence of embedded real secrets.

## 3. Operator documentation

- [x] 3.1 Update the root README quick start to distinguish database-only development from the complete containerized stack.
- [x] 3.2 Update the local-development runbook with first boot, status, logs, explicit admin bootstrap, restart, non-destructive shutdown, destructive volume reset warning, and troubleshooting.

## 4. Verification

- [x] 4.1 Run static Compose validation, Docker configuration tests, strict OpenSpec validation, and relevant existing unit/configuration tests.
- [x] 4.2 Build all declared images from the repository root and resolve any deterministic build failures.
- [x] 4.3 Start the real stack, prove migration completion and healthy services, verify Frontend/Backend/CMS host endpoints, and confirm ordinary restart preserves volumes.
- [x] 4.4 Record any external Docker Engine or registry blocker without weakening configuration validation or marking unverified runtime work complete. No external blocker remained after the real Engine and registry verification.
