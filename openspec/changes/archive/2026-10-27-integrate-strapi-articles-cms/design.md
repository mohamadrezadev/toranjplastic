## Context

Toranj Plastic currently maintains Article records directly inside the NestJS modular monolith's PostgreSQL schema (`toranj`). Articles are exposed through NestJS public content endpoints and rendered on Next.js routes (`/articles` and `/articles/[slug]`). While this works for simple text, marketing and editorial teams need rich typography, category organization, tag taxonomy, draft preview, and independent publishing control without risking or coupling with core business features (products, custom injection service specs, material formulations, inquiries, and quotations).

To solve this, we are integrating Strapi v5 as a standalone headless CMS strictly bounded to the editorial articles section.

## Goals / Non-Goals

**Goals:**
- Provide a standalone, dedicated Strapi v5 service in the monorepo workspace under `cms/`.
- Isolate Strapi data in a separate PostgreSQL database (`toranj_strapi`) on the same PostgreSQL container.
- Implement `Article`, `Category`, and `Tag` models with rich text (Markdown/blocks), SEO metadata, single featured image, and draft/publish workflow.
- Connect Next.js server-side rendering to Strapi's Content API with strict Zod/value-guard schema validation and zero client-exposed tokens.
- Add category filtering route (`/articles/category/[slug]`) and related articles recommendations.
- Implement an authenticated on-demand cache revalidation webhook in Next.js triggered by Strapi publishing lifecycle events.
- Update `sitemap.ts` to include published articles and categories from Strapi.
- Maintain Persian RTL, mobile-first responsiveness (360, 390, 768, 1280), and full accessibility.

**Non-Goals:**
- Moving products, injection molding services, materials, managed pages, inquiries, customer quotations, staff accounts, or authentication out of NestJS.
- Replacing NestJS with Strapi.
- Providing customer commenting, user accounts, or e-commerce features inside Strapi.
- Exposing Strapi admin or API credentials to client-side bundles.

## Decisions

### 1. Dedicated `cms/` workspace package
Strapi v5 will be installed in a dedicated workspace directory `cms/` managed by `pnpm`. Root `.npmrc` is configured with necessary hoisting patterns to ensure Strapi plugins resolve reliably in a monorepo structure.

### 2. Dedicated PostgreSQL database (`toranj_strapi`)
Strapi manages its own relational schema migrations via Knex. To prevent migration conflicts or schema pollution with NestJS Prisma models, Strapi connects to a dedicated database `toranj_strapi` within the existing PostgreSQL 17 Docker container.

### 3. Server-side only Strapi communication
Next.js server components and server utilities (`frontend/src/lib/strapi.ts`) communicate with Strapi over the internal network using `STRAPI_API_URL` and `STRAPI_API_TOKEN`. No API keys or internal Strapi endpoints are sent to client browsers.

### 4. Adapter pattern to existing `PublicArticle`
Strapi's nested REST response (`data.attributes...` or v5 flattened REST format) is parsed and mapped into the frontend's existing `PublicArticle` interface. This preserves complete compatibility with existing UI components (`ContentCard`, `DetailHero`, `Breadcrumb`).

### 5. On-Demand Revalidation via Webhooks
Instead of frequent polling or pure dynamic rendering, Next.js implements `/api/revalidate` protected by `REVALIDATION_SECRET`. Strapi webhooks ping this endpoint on publish, unpublish, update, and delete events to immediately revalidate `/articles`, `/articles/[slug]`, and `/articles/category/[slug]` paths.

### 6. Media storage for Strapi
Strapi manages article uploads independently via its standard local provider stored in `cms/public/uploads` (mounted as a durable Docker volume in deployment). Strapi media URLs are mapped to complete URLs in Next.js image components.

## Risks / Trade-offs

- [Risk: Strapi v5 compatibility with Node 24] → Mitigation: Use explicitly pinned Strapi v5 version (>= 5.31.0) verified to run on Node 24.
- [Risk: Strapi draft articles leaking to public] → Mitigation: Strapi API token is granted `find` and `findOne` permissions only for published records. Frontend type-guards reject non-published articles.
- [Risk: Monorepo pnpm hoisting issues] → Mitigation: Configure `.npmrc` with `public-hoist-pattern[] = ['*strapi*']`.
- [Risk: Webhook revalidation abuse] → Mitigation: Authenticate webhook requests with a shared bearer secret header.
