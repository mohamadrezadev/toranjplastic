## Context

The Toranj Plastic project integrates Strapi v5 as a headless CMS for public editorial articles, operating as an independent service alongside NestJS backend and Next.js frontend. The CMS persists content into a dedicated PostgreSQL database (`toranj_strapi`) and stores uploaded assets in a mounted persistent volume (`strapi_uploads`).

During the Phase 0 audit, several critical gaps and areas for hardening were identified:
1. Strapi configuration files fall back to insecure default development secrets (`key1`, `admin_jwt_secret_dev`, etc.) without throwing errors if running in production.
2. `compose.yaml` includes fallback defaults for secret environment variables.
3. The frontend `fetchFromStrapi` client lacks an explicit HTTP timeout (`AbortSignal.timeout`), risking connection stalls during SSR.
4. The Next.js revalidation route `/api/revalidate` lacks slug regex validation.
5. Backup and restore documentation has not been proven with an automated or reproducible restore verification test.

## Goals / Non-Goals

**Goals:**
- Enforce fail-fast secret validation in Strapi for `NODE_ENV=production`.
- Secure Docker compose templates and prevent fallback leakage.
- Add timeout handling to frontend Strapi client requests.
- Validate slugs strictly before triggering cache revalidations.
- Formally verify backup and restore execution on a disposable PostgreSQL test database.
- Maintain 100% test pass rate across existing unit and integration suites.

**Non-Goals:**
- Merging Strapi database or media models into NestJS/Prisma.
- Building a custom CMS or rewriting existing article UI.
- Adding ecommerce, cart, or automated pricing.

## Decisions

### Decision 1: Enforce Production Secrets via Configuration Guards
- **Choice:** Add startup assertions in `cms/config/server.ts`, `cms/config/admin.ts`, and `cms/config/database.ts` that check if `NODE_ENV === 'production'`. If running in production and critical secrets are missing or equal to dev defaults, throw a clear `Error` halting the process.
- **Rationale:** Prevents catastrophic misconfiguration where a container boots in production using widely known public default keys.
- **Alternatives Considered:** Relying solely on deployment documentation or container orchestration. Rejected because human error or misconfigured CI/CD could lead to insecure instances running silently.

### Decision 2: Maintain Dedicated Media Storage for CMS Assets
- **Choice:** Maintain Strapi's local disk upload provider mounted to `/app/cms/public/uploads` (or S3/object storage when configured via standard env), isolated from the NestJS media pipeline (`/app/backend/media-uploads`).
- **Rationale:** CMS media consists entirely of public editorial assets (article images, thumbnails), whereas NestJS manages company catalogs, customer inquiry attachments, and internal quotation files. Mixing them creates unnecessary architectural coupling and authorization complexity.

### Decision 3: Add `AbortSignal.timeout` to Frontend Strapi Client
- **Choice:** Configure `fetchFromStrapi` with `signal: AbortSignal.timeout(Number(process.env.STRAPI_TIMEOUT_MS) || 5000)`.
- **Rationale:** Protects Next.js SSR workers from thread starvation if Strapi is unresponsive.

### Decision 4: Strictly Validate Revalidation Slug Format
- **Choice:** Validate `entry.slug` with `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` in `/api/revalidate`.
- **Rationale:** Prevents path traversal, URL injection, or unexpected revalidation attacks.

## Risks / Trade-offs

- **[Risk] Production container fails to start if environment variables are not supplied.**  
  → *Mitigation:* Document all mandatory variables in `.env.example` and emit descriptive error messages identifying exactly which key is missing.
- **[Risk] Slow network in staging causes Next.js fetch timeouts.**  
  → *Mitigation:* Allow `STRAPI_TIMEOUT_MS` to be configured via environment variable with a sensible 5000ms default.
- **[Risk] Strapi backup restore overrides production data if run incorrectly.**  
  → *Mitigation:* Verification tests will always target disposable databases named with `_test` suffix, strictly following `AGENTS.md` rules.

## Migration Plan

1. Update configuration validation files in `cms/config/`.
2. Update `frontend/src/lib/strapi.ts` and `frontend/src/app/api/revalidate/route.ts`.
3. Update `.env.example` and `compose.yaml`.
4. Run integration tests and execute verified backup/restore procedure.
5. Rollback: Code changes are non-destructive and can be reverted cleanly via git if issues arise.
