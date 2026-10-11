# Identity foundation rollback

This migration is additive. Before any destructive rollback, take and verify a PostgreSQL backup.

1. Roll back application code so no process writes identity records.
2. Export `SecurityAuditEvent`, `AuthSession`, `PasswordCredential`, and `User` if any real account has been created.
3. Drop foreign keys, the four tables, then `AccountStatus` and `UserRole` only after explicit operator approval.

Normal application rollback should leave these dormant tables in place; automatic destructive down-migration is intentionally not provided.
