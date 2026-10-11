## 1. Catalog media

- [x] 1.1 Extract, crop, optimize, and visually review approved product imagery from the selected catalog pages.
- [x] 1.2 Add a media provenance manifest with source filename, page, slug, output asset, and Persian alt text.

## 2. Catalog content

- [x] 2.1 Add a reversible Prisma data migration for catalog-backed categories, products, images, and SEO fields without unapproved claims.
- [x] 2.2 Apply the migration locally and verify the existing public content API returns the catalog records and normalized media.

## 3. Search discovery

- [x] 3.1 Add canonical origin configuration and route-specific title, description, canonical, robots, and Open Graph metadata for approved public pages.
- [x] 3.2 Add robots and sitemap handlers that include approved public routes and exclude private, placeholder, and unpublished routes.
- [x] 3.3 Add safe Product JSON-LD to catalog product detail pages without ecommerce or unverified properties.

## 4. Presentation and verification

- [x] 4.1 Integrate catalog images into product collections/details and verify alt text, RTL layout, light/dark themes, and widths 360, 390, 768, and 1280.
- [x] 4.2 Add or update unit, backend, and end-to-end coverage for catalog data and SEO outputs.
- [x] 4.3 Run strict OpenSpec validation, lint, typecheck, tests, build, migration checks, and responsive browser tests.
