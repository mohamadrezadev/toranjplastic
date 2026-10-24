## Why

The current public catalog uses tall poster artwork as a standalone block and stretches sparse product cards into oversized empty surfaces. Visitors cannot quickly understand the page hierarchy, scan published products, or move from a product summary to a useful detail and inquiry flow, especially on mobile.

## What Changes

- Replace standalone portrait-poster presentation with a composed landing hero that combines semantic Persian copy, real actions, and a controlled media crop.
- Redesign public collection cards and grids for predictable compact sizing, strong scan hierarchy, and responsive one/two/three-column behavior.
- Redesign product detail presentation around a clear media area, product identity, verified metadata, description, specifications, gallery, and inquiry action.
- Apply the shared landing and detail foundations without inventing catalog data or removing honest loading, empty, error, and not-found states.
- Verify the product landing, list, and detail experience at 360, 390, 768, and 1280 pixels in light and dark themes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-visual-experience`: Public catalog landing, list cards, and detail pages gain a composed, responsive hierarchy instead of standalone poster and stretched-card presentation.

## Impact

- Affected code: shared content presentation components and styles, products collection route, product detail route, and public browser/component tests.
- Reuse: the landing hero and detail foundations remain reusable for injection-service and material catalogs.
- APIs, persistence, and backend: unchanged.
- Product boundary: no price, inventory, capacity, delivery promise, ecommerce, or fabricated catalog content is introduced.
