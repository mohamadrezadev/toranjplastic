# Migration safety — content read foundation

This migration only creates the `ContentStatus` enum, six empty content tables, their indexes, and the nullable Product → Category foreign key. It contains no seed, update, delete, or rewrite statement.

Before applying outside a disposable local environment:

1. Take a PostgreSQL backup using the deployment platform's managed backup or `pg_dump` with credentials supplied through the environment.
2. Run `prisma migrate status` and confirm the target schema and pending migration list.
3. Review `migration.sql` and apply through the normal deployment migration job.

Application rollback does not require database rollback. Deploy the prior backend first and leave the additive tables in place.

Database rollback is allowed only while all six tables are confirmed empty. In that case, drop the foreign key, the six tables, and then `ContentStatus` in reverse dependency order. Once any authored content exists, export/preserve it and use a forward corrective migration; do not drop the tables.
