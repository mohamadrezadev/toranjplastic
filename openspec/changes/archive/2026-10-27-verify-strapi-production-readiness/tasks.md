## 1. Security Hardening & Secret Validation

- [x] 1.1 Implement fail-fast validation in `cms/config/server.ts`, `cms/config/admin.ts`, and `cms/config/database.ts` for `NODE_ENV=production`
- [x] 1.2 Remove insecure secret fallback defaults from `compose.yaml` and update `.env.example`
- [x] 1.3 Add unit test asserting Strapi configuration throws when mandatory production secrets are missing or default

## 2. Client Resilience & Revalidation Hardening

- [x] 2.1 Add configurable `AbortSignal.timeout` to `fetchFromStrapi` in `frontend/src/lib/strapi.ts`
- [x] 2.2 Implement slug format regex validation (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) in `frontend/src/app/api/revalidate/route.ts`
- [x] 2.3 Add unit/integration tests for revalidation slug rejection and client timeout handling

## 3. Publishing Cycle & Draft Isolation Verification

- [x] 3.1 Verify that draft articles are inaccessible via Public role and return HTTP 404
- [x] 3.2 Verify published articles deliver complete relations (category, tags, SEO)
- [x] 3.3 Add automated regression test asserting draft isolation and proper error handling in Next.js

## 4. Backup & Recovery Verification

- [x] 4.1 Perform database dump and media archive of current Strapi state
- [x] 4.2 Execute restore procedure into a disposable PostgreSQL test database (`toranj_strapi_test`)
- [x] 4.3 Verify table counts, relations, and article content on the restored database, then teardown test database
- [x] 4.4 Document verified backup/restore runbook and verification logs in `docs/runbooks/strapi-operations.md`

## 5. Verification & OpenSpec Finalization

- [x] 5.1 Run full test suite (`pnpm test`) across frontend and backend workspaces
- [x] 5.2 Run architecture check (`pnpm check:architecture`), lint (`pnpm -r lint`), and typecheck (`pnpm typecheck`)
- [x] 5.3 Validate OpenSpec change against strict schema and prepare for archive
