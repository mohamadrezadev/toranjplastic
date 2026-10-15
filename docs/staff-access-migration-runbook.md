# Staff access migration runbook

## Before deployment

1. Take and verify a PostgreSQL backup.
2. Confirm at least one `ACTIVE` user with role `ADMIN` exists.
3. Apply `20261015100000_staff_access_management` before deploying application code that writes the new roles.

## Rollback

The application can be rolled back by disabling `SALES` and `OPERATOR` accounts and deploying the previous release. Keep `User.version` and the additive enum values during an emergency rollback.

PostgreSQL enum values cannot be removed safely in-place. Removing them requires a separate reviewed migration after confirming no row uses either value, rewriting the enum type, and taking a fresh backup. Do not drop the column or rewrite the enum as part of an emergency rollback.

