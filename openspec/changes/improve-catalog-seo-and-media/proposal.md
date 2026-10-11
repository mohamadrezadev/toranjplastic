## Why

The redesigned public site still lacks product photography and complete search-engine discovery signals. The three user-supplied Toranj catalogs provide an attributable source for approved product visuals and product names, while public routes need canonical metadata, crawl controls, structured data, and a sitemap.

## What Changes

- Extract web-optimized product imagery from the supplied branded catalogs, retain source provenance, and publish only catalog-supported product names and descriptions.
- Publish catalog-backed product records through the existing read-only content API, without price, stock, capacity, delivery, certification, or ecommerce claims.
- Add page-specific canonical URLs, Open Graph metadata, crawlable public metadata, robots rules, sitemap entries, and product structured data.
- Keep authentication, admin, account, inquiry, unavailable, and unpublished surfaces `noindex`; search metadata does not replace server-side access control.
- Treat `Toranj_Household_Catalog_Final_Updated.pdf` as the complete household source where it differs from the visibly incomplete `Corrected` export, and use `Toranj_Products_Catalog_Branded.pdf` for kitchen products.
- Do not publish phone numbers or addresses visible in the catalogs without separate explicit contact-content approval.

## Capabilities

### New Capabilities

- `public-search-discovery`: Search-engine metadata, canonicalization, crawl policy, sitemap discovery, and safe structured data for approved public content.
- `catalog-media-provenance`: Traceable extraction, optimization, accessible alt text, and presentation of catalog-sourced product imagery.

### Modified Capabilities

- `public-content-catalog`: Allow catalog-backed, explicitly sourced product records to be published through the existing content boundary.
- `responsive-public-shell`: Change approved public routes from the placeholder-wide noindex state to route-aware indexing while private and placeholder routes remain excluded.

## Impact

Frontend metadata utilities, public layouts/routes, sitemap and robots handlers, product detail rendering, public assets, content tests, backend catalog data migration, rollback documentation, and environment documentation. No cart, checkout, payment, inventory, automatic pricing, or new public mutation API is introduced.
