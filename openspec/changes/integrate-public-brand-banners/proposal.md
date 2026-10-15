## Why

The supplied Toranj Plastic campaign artwork is not represented in the public experience, so the home and key catalog entry pages do not yet communicate the approved visual identity consistently. The artwork must be integrated without turning rasterized button labels into inaccessible or non-operable controls and without weakening the mobile-first contract.

## What Changes

- Replace the current home hero artwork with the supplied wide Toranj Plastic campaign banner and preserve semantic, keyboard-operable routes to products and inquiry.
- Add the supplied products, injection-services, materials, and contact banners to their matching public entry pages.
- Introduce a reusable responsive campaign-banner primitive with meaningful alternative text, real link targets, visible focus treatment, and safe image sizing.
- Verify the new artwork at 360, 390, 768, and 1280 pixels in light and dark themes without horizontal overflow.
- Keep catalog data, inquiry behavior, and managed content unchanged; do not add prices, inventory, capacity, delivery promises, or ecommerce behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-visual-experience`: The public home and primary public entry pages will expose approved campaign artwork through responsive, accessible, operable banner surfaces.

## Impact

- Affected code: the public home page, public collection pages, managed contact page composition, shared public content components, styles, and browser tests.
- Assets: five supplied PNG campaign images will be copied into versioned public assets with descriptive filenames.
- APIs and persistence: no API, database, backend, or schema changes.
- Dependencies: no new runtime dependency.
