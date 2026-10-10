## 1. Persistence contract

- [x] 1.1 Add the content lifecycle enum and six model-specific tables with unique slugs, publication fields, safe presentation JSON, indexes, and product-category relation to `backend/prisma/schema.prisma`.
- [x] 1.2 Generate and review a named non-destructive Prisma migration, regenerate the client, and document backup and conditional rollback commands beside the migration.
- [x] 1.3 Add Prisma/database lifecycle providers in `backend/src/database` without making process health depend on an eager database connection.

## 2. Content application boundary

- [x] 2.1 Define explicit public content types, pagination contracts, JSON normalizers, and the `PublicContentRepository` port in `backend/src/content`.
- [x] 2.2 Implement `ContentService` publication/not-found behavior with unit tests covering empty, published, hidden, category-blocked, and malformed presentation cases.
- [x] 2.3 Implement `PrismaPublicContentRepository` with effective-publication filters, deterministic ordering, featured filtering, explicit projections, and repository query tests.

## 3. Public HTTP API

- [x] 3.1 Add validated pagination and featured query DTOs that reject zero, oversized, non-boolean, and unknown inputs.
- [x] 3.2 Add the read-only `/api/v1/public/content` controller and module for all specified list/detail routes with safe caching and standard 404 behavior.
- [x] 3.3 Add API contract tests for collection shape, detail shape, empty state, hidden-state 404 equivalence, invalid queries, unsupported mutations, and health regression.

## 4. Verification and delivery

- [x] 4.1 Validate Prisma schema/migration and verify an empty PostgreSQL migration plus public empty responses without adding seed content.
- [x] 4.2 Run backend and monorepo lint, typecheck, tests, production builds, `git diff --check`, and strict OpenSpec validation.
- [x] 4.3 Record the completed read-foundation result and remaining admin-auth, CMS-write, frontend, media, redirect, and final-SEO work in the phase-two handoff.
