# Toranj backend rules

- Root `AGENTS.md`, the active spec and ADRs are mandatory.
- Keep a modular monolith: each domain owns controller/application/domain/infrastructure concerns and exposes an intentional public contract.
- Controllers validate/authorize and delegate; business rules do not live in controllers or Prisma repositories.
- Every protected query enforces role and ownership server-side. Customer DTOs must structurally exclude internal notes.
- Use transactions for status/history, quotation versioning and other atomic workflows.
- Never log password, OTP, token, session cookie, private file URL or raw personal payload.
- Prisma schema changes require a named migration, review of destructive SQL and rollback/backup notes in the spec.
- New endpoints require contract tests plus negative authorization/validation tests.
