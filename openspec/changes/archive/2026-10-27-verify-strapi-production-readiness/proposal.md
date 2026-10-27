## Why

The Strapi CMS integration for articles and editorial content is currently functional in development, but requires verification, hardening, and production readiness controls before deployment to live production environments. This change audits existing implementations, enforces fail-fast production secret validation, hardens client fetch timeouts and webhook revalidation slug guards, proves backup/restore procedures, and adds automated regression tests without rewriting existing features or modifying NestJS business boundaries.

## What Changes

- **Production Secret Validation**: Enforce fail-fast startup checks in Strapi configuration (`server.ts`, `admin.ts`, `database.ts`) preventing boot in `NODE_ENV=production` if critical secrets (`APP_KEYS`, `ADMIN_JWT_SECRET`, `API_TOKEN_SALT`, `TRANSFER_TOKEN_SALT`, database credentials) are missing or using development defaults.
- **Docker Compose Hardening**: Remove insecure default fallback values for production secrets from `compose.yaml`, requiring explicit environment configuration.
- **Frontend Fetch Resilience**: Add request timeout (`AbortSignal.timeout`) to `fetchFromStrapi` in Next.js to prevent SSR worker exhaustion if CMS is slow or unreachable.
- **Webhook Slug Validation**: Sanitize and strictly validate `entry.slug` via regex (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) in `/api/revalidate` before passing to `revalidatePath`.
- **Draft Isolation Verification**: Add automated test asserting draft/unpublished articles return 404 on the public API and cannot be read without authentication.
- **Backup/Restore Provenance**: Execute and document verified database backup and restore test for `toranj_strapi` with media uploads verification.

## Capabilities

### New Capabilities
<!-- No new functional capabilities introduced; this is a hardening and verification change. -->

### Modified Capabilities
- `strapi-headless-cms`: Added requirements for production secret validation, client fetch timeouts, strict webhook slug sanitization, and verified backup/restore procedures.

## Impact

- `cms/config/`: `server.ts`, `admin.ts`, `database.ts` fail-fast validation logic.
- `compose.yaml`: Removal of default secret fallbacks.
- `frontend/src/lib/strapi.ts`: Request timeout handling.
- `frontend/src/app/api/revalidate/route.ts`: Regex input validation for slugs.
- `docs/runbooks/strapi-operations.md`: Validated backup and restore verification instructions and test scripts.
