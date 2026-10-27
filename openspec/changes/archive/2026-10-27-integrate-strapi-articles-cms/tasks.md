## 1. Strapi Package and Infrastructure Setup (Phase 1)

- [x] 1.1 Create `cms/` package in monorepo with pinned Strapi v5 dependencies and configure root `pnpm-workspace.yaml` and `.npmrc` hoisting. Evidence: `cms/package.json` created with `@strapi/strapi` 5.59.0, added to `pnpm-workspace.yaml`, and root `.npmrc` hoisting configured.
- [x] 1.2 Configure dedicated PostgreSQL database `toranj_strapi` in `compose.yaml` and environment variables in `.env.example`. Evidence: database `toranj_strapi` created in Postgres 17 container, `scripts/init-postgres-databases.sql` added to `compose.yaml`, and `.env.example` updated with Strapi variables.
- [x] 1.3 Configure Strapi database connection, server port 1337, JWT secrets, and persistent upload storage in `cms/public/uploads`. Evidence: `cms/config/server.ts`, `database.ts`, `admin.ts`, `plugins.ts`, and `api.ts` configured; uploads directory created.
- [x] 1.4 Verify Strapi starts cleanly on Node 24 and connects to `toranj_strapi` without modifying tables in `toranj`. Evidence: Strapi started on Node 24.18.0, initialized 41 tables in `toranj_strapi`, responded HTTP 204 to `/_health`, while `toranj` application database maintained exactly its 20 tables untouched.

## 2. Strapi Content Models and Media (Phase 2)

- [x] 2.1 Implement `Category` content model with `name`, `slug`, and `description`. Evidence: `cms/src/api/category/content-types/category/schema.json` defined, database migrated in `toranj_strapi`, verified via `/api/categories`.
- [x] 2.2 Implement `Tag` content model with `name` and `slug`. Evidence: `cms/src/api/tag/content-types/tag/schema.json` defined, database migrated in `toranj_strapi`, verified via `/api/tags`.
- [x] 2.3 Implement `Article` content model with `title`, `slug`, `summary`, rich `body`, `featuredImage` media relation, `category` (Many-to-One), `tags` (Many-to-Many), `seo` component, and Draft & Publish enabled. Evidence: `cms/src/api/article/content-types/article/schema.json` and `cms/src/components/shared/seo.json` defined, relations verified with populated responses.
- [x] 2.4 Configure Public API token permissions allowing read-only `find` and `findOne` access exclusively to published articles, categories, and tags. Evidence: bootstrap auto-configures `plugin::users-permissions` for public role; verified `GET /api/articles` returns 200 with published records and drafts inaccessible.

## 3. Next.js Frontend Integration (Phase 3)

- [x] 3.1 Create `frontend/src/lib/strapi.ts` with server-only client, error handling, and runtime response validation matching `PublicArticle` and `PageResult`. Evidence: `frontend/src/lib/strapi.ts` created, handles articles, categories, tags, SEO, and related content with type-safe mapping.
- [x] 3.2 Update `frontend/src/app/(public)/(content)/articles/page.tsx` to source published articles from Strapi with pagination and category navigation. Evidence: articles page now fetches from Strapi with category filter pills and responsive pagination.
- [x] 3.3 Update `frontend/src/app/(public)/(content)/articles/[slug]/page.tsx` to render Strapi article detail, rich body, SEO metadata, and related articles. Evidence: article detail page renders hero, preserved text, tags, related articles, JSON-LD Schema.org Article metadata, and canonical URL.
- [x] 3.4 Implement `frontend/src/app/(public)/(content)/articles/category/[slug]/page.tsx` for browsing articles by category with breadcrumb and pagination. Evidence: category route created with dynamic metadata, breadcrumb, and category-filtered grid.
- [x] 3.5 Update `frontend/src/app/sitemap.ts` to include published Strapi articles and categories. Evidence: `sitemap.ts` includes Strapi articles and categories alongside products.

## 4. Revalidation and Cache Invalidation (Phase 4)

- [x] 4.1 Implement `frontend/src/app/api/revalidate/route.ts` with secret header verification and `revalidatePath` for affected article and category routes. Evidence: `/api/revalidate` route verifies secret, revalidates `/articles`, sitemap, and specific article/category paths, as well as `revalidateTag`.
- [x] 4.2 Configure Strapi webhook to notify Next.js `/api/revalidate` on entry publish, unpublish, update, and delete events. Evidence: Strapi bootstrap configured to ensure Next.js Revalidation webhook exists in `strapi_webhooks` with secret and events.
- [x] 4.3 Add test proving unauthorized webhook calls are rejected with 401 and valid webhooks trigger path revalidation. Evidence: `frontend/src/app/api/revalidate/route.test.ts` passes with 3/3 tests covering 401 rejection and path revalidation.

## 5. Deployment and Operational Configuration (Phase 5)

- [x] 5.1 Update `compose.yaml` with Strapi service, health check, environment configuration, and persistent uploads volume mount. Evidence: `compose.yaml` updated with `cms` service and `strapi_uploads` volume; `cms/Dockerfile` created.
- [x] 5.2 Add Strapi production runbook covering database backup/restore for `toranj_strapi`, media upload backups, and secret rotation in `docs/runbooks/strapi-operations.md`. Evidence: comprehensive operations runbook written.
- [x] 5.3 Verify health endpoint `http://localhost:1337/_health` or ready check. Evidence: verified Strapi responds HTTP 204 to `/_health`.

## 6. End-to-End Verification and Testing (Phase 6)

- [x] 6.1 Add unit tests for `frontend/src/lib/strapi.ts` parser, mapper, and error handling. Evidence: `frontend/src/lib/strapi.test.ts` passes 10/10 tests.
- [x] 6.2 Add E2E Playwright tests covering `/articles`, `/articles/[slug]`, `/articles/category/[slug]`, RTL rendering, and 360/390/768/1280 viewports without overflow. Evidence: `frontend/e2e/articles-strapi.spec.ts` created covering all target viewports, detail page, and category page.
- [x] 6.3 Run `pnpm check:architecture`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` to verify zero regressions across existing NestJS and Next.js features. Evidence: architecture boundaries passed (227 files checked), typecheck passed on all packages, oxlint & eslint passed with 0 errors, and 390/390 tests passed across frontend (173) and backend (217).
- [x] 6.4 Validate change with `openspec validate integrate-strapi-articles-cms --strict`. Evidence: `openspec validate integrate-strapi-articles-cms --strict` succeeded with exit code 0.
