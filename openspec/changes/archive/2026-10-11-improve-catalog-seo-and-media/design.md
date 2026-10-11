## Context

Public content is already served from PostgreSQL through an explicit NestJS read boundary and rendered by Next.js. Product records support image metadata and SEO fields, but the live database has no catalog-backed records, the UI mostly shows placeholders, the root/public layouts default to `noindex`, and there are no sitemap, robots, canonical, Open Graph, or structured-data routes. Three user-supplied PDFs are the approved source for this change; their embedded contact data is outside scope.

## Goals / Non-Goals

**Goals:**

- Produce optimized, local product media with Persian alt text and recorded catalog/page provenance.
- Publish a small catalog-backed set through the existing Product/Category models and public API.
- Make approved public pages discoverable with canonical metadata, safe Open Graph fields, robots rules, sitemap URLs, and product JSON-LD.
- Preserve responsive RTL behavior, accessibility, and private-route indexing boundaries.

**Non-Goals:**

- Publishing prices, availability, capacity, lead time, certification, contact details, or claims not directly approved for this change.
- Adding ecommerce, a CMS upload workflow, or public content mutations.
- Treating search metadata as authorization.

## Decisions

1. **Use the complete catalog exports as visual sources.** Kitchen product media comes from `Toranj_Products_Catalog_Branded.pdf`; household/cleaning media comes from `Toranj_Household_Catalog_Final_Updated.pdf`. The `Corrected` file is retained as comparison evidence but is not the image source because pages 2 and 10 are visibly incomplete. Alternative: mix all three exports. Rejected because duplicate and broken artwork would be published.
2. **Create web assets as cropped WebP files.** Extracted page regions are resized to a bounded resolution and encoded once at build/development time. The application serves them from `frontend/public/catalog`; it never renders a PDF at request time. Alternative: serve full PDF pages. Rejected due to poor responsive presentation, oversized payloads, embedded phone/address content, and weak alt-text targeting.
3. **Publish via a reversible Prisma SQL data migration.** Stable category/product IDs, slugs, descriptions, image metadata, and SEO fields are inserted idempotently with catalog provenance documented beside the migration. This preserves the backend as content owner. Rollback deletes only the fixed IDs introduced by this migration after a database backup.
4. **Centralize public metadata.** Metadata helpers receive route paths and optional images, generate canonical/Open Graph values against `NEXT_PUBLIC_SITE_URL`, and retain `noindex` on private/placeholder routes. Sitemap data uses public API results and fails closed to stable public routes if content is unavailable.
5. **Emit minimal Product JSON-LD.** Structured data contains only name, description, image, category, brand, and canonical URL; it omits offers, price, availability, ratings, identifiers, and unverified attributes.

## Risks / Trade-offs

- **[Catalog crops may contain decorative text]** → Crop only the primary product region and visually review desktop/mobile presentation.
- **[Catalog data could later be superseded]** → Fixed IDs and source documentation make the import auditable and replaceable.
- **[Wrong production origin creates bad canonicals]** → Document `NEXT_PUBLIC_SITE_URL`; local fallback is explicitly for development and automated tests.
- **[Sitemap API outage]** → Return stable collection routes without exposing an error page or private route.
- **[Search engines discover unfinished content]** → Only routes with approved content metadata are indexable; inquiry/account/auth/admin and error/not-found pages remain excluded.

## Migration Plan

1. Back up the target PostgreSQL database.
2. Deploy optimized media and frontend SEO handlers.
3. Apply the catalog content migration and verify public API records and image URLs.
4. Configure the verified production `NEXT_PUBLIC_SITE_URL` before deployment.
5. Run metadata, structured-data, sitemap, robots, accessibility, and responsive checks.

Rollback: restore the backup or execute the documented targeted delete for the fixed catalog product/category IDs, then redeploy the prior frontend. Media files can remain harmlessly unreferenced or be removed in the reverting commit.

## Open Questions

- The official production hostname remains deployment configuration and is not inferred from the catalogs.
- Contact information shown inside catalog artwork requires a separate explicit approval before publication as structured or visible contact data.
