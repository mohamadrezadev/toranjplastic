## Why

Managing editorial articles through code or basic admin forms limits editorial workflow flexibility and content velocity. Integrating Strapi v5 as a dedicated, standalone headless CMS gives marketing and content teams rich text editing, draft/publish workflows, categories, and tags for articles while strictly isolating editorial operations from Toranj Plastic's core NestJS business logic.

## What Changes

- Add a standalone Strapi v5 CMS package (`cms/`) to the monorepo workspace with its own dedicated PostgreSQL database (`toranj_strapi`).
- Define `Article`, `Category`, and `Tag` content models in Strapi with built-in Draft & Publish workflow, rich text, SEO metadata, and media uploads.
- Integrate Next.js frontend with Strapi's Content API using server-side fetching, secure read tokens, and Zod/value-guard response normalization.
- Add `/articles/category/[slug]` route for category-based article discovery and related article recommendations.
- Implement an authenticated Next.js on-demand revalidation webhook route (`/api/revalidate`) triggered by Strapi lifecycle events (publish, unpublish, update, delete).
- Update dynamic sitemap generation in `frontend/src/app/sitemap.ts` to include Strapi's published articles.
- Keep all core business domain features (products, injection services, materials, inquiries, quotations, customer portal, staff auth) 100% in NestJS.

## Capabilities

### New Capabilities
- `strapi-headless-cms`: Standalone Strapi v5 headless CMS for managing editorial articles, categories, tags, persistent uploads, and publishing webhooks.

### Modified Capabilities
- `public-content-pages`: Sourcing public articles from Strapi Content API, supporting article categories `/articles/category/[slug]`, related articles, and on-demand cache invalidation.

## Impact

- **Monorepo:** New `cms/` workspace package added to `pnpm-workspace.yaml`.
- **Database:** Dedicated `toranj_strapi` database on the existing PostgreSQL instance (`compose.yaml`).
- **Frontend:** `frontend/src/lib/strapi.ts` client, `/articles/category/[slug]` route, `/api/revalidate` route, and updated `sitemap.ts`.
- **Dependencies:** `@strapi/strapi` v5 dependencies in `cms/`. No private Strapi tokens exposed to browser.
- **Backend (NestJS):** Zero breaking changes to core entities (Product, Service, Material, Inquiry, Quotation, Staff).
