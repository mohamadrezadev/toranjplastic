# معماری پایه

```text
Browser / PWA
    |
    v
frontend (Next.js, RTL, public + portal + admin shells)
    | HTTPS / JSON / api-v1
    v
backend (NestJS modular monolith)
    | Prisma
    v
PostgreSQL        Private object storage (از فاز درخواست‌ها)
```

مرزهای ماژول پیشنهادی backend برای فازهای بعد: Identity، Catalog، Content، Inquiries، Quotations، Files، Users/Authorization، Settings و Audit. این‌ها یک process و deployment دارند، ولی قرارداد و مالکیت داده داخلی‌شان جداست.

frontend سه layout خواهد داشت: Public، Customer Portal و Admin Workspace. primitives و tokenها مشترک‌اند؛ navigation و density مستقل است. هیچ business authorization فقط با مخفی‌کردن UI حل نمی‌شود.

## Architecture verification

Admin-content PostgreSQL transaction integration tests use only a disposable local database whose name contains `test`; the test command refuses remote hosts and non-test database names. Start an isolated PostgreSQL 17 instance (for example, configure the repository Compose service as `toranj_test`), then run:

```powershell
$env:DATABASE_URL = 'postgresql://toranj_test:toranj_test_only@127.0.0.1:5432/toranj_test?schema=public'
pnpm db:migrate:deploy
pnpm test:integration:postgres
```

CI provisions its own PostgreSQL 17 service and runs the same commands. Never point this suite at development, staging, or production data.

Admin CMS feature boundary checks run with `pnpm check:architecture`. See the `frontend/src/features/admin-content/<resource>/index.ts` public entrypoints for resource ownership. Cross-feature deep imports, feature cycles, and frontend imports from backend source are forbidden. Rollback is a code revert; this architecture change must not introduce schema migrations.

No valid pre-change performance baseline was available for this structural extraction, so no p95 regression percentage is claimed. Any later performance gate must compare repeatable measurements under equivalent conditions.
