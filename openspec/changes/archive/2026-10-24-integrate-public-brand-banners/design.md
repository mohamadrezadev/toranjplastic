## Context

Five approved raster campaign images were supplied: one wide home banner and four portrait banners for products, injection services, materials, and contact. The files include rendered Persian copy and button artwork. The current site uses semantic HTML, API-backed public content, and shared responsive primitives; a raw image swap would make the depicted buttons inert and would leave assistive technology without equivalent structure.

## Goals / Non-Goals

**Goals:**

- Integrate each supplied artwork in the matching public route.
- Preserve intrinsic image ratios at 360, 390, 768, and 1280 pixels.
- Provide semantic headings and real keyboard-operable actions alongside rasterized labels.
- Keep campaign presentation reusable and visually consistent in light and dark themes.
- Preserve existing API-backed lists, empty/error states, metadata, and inquiry routes.

**Non-Goals:**

- Editing, regenerating, or inventing claims inside the supplied artwork.
- Adding ecommerce, pricing, live inventory, capacity, delivery, or certification behavior.
- Changing public APIs, persistence, CMS ownership, or inquiry contracts.
- Making banner text administrable in this change.

## Decisions

1. **Version the supplied files as public assets with descriptive stable names.** This avoids runtime dependency on Downloads paths and makes deployment deterministic. Remote hosting was rejected because no approved asset host or retention contract was provided.

2. **Use a shared `CampaignBanner` component for portrait entry banners.** The component owns intrinsic sizing, responsive containment, accessible link naming, priority/loading behavior, and focus styling. Route-specific markup was rejected because it would duplicate accessibility and responsive behavior across four pages.

3. **Treat rendered button artwork as presentation, not as the only control.** Each portrait banner is a real link with an explicit accessible label. The home banner exposes two real links positioned over the depicted CTA regions at wide sizes and as visible full-width controls below the artwork on narrow sizes. A single whole-home-banner link was rejected because the supplied design contains two distinct destinations.

4. **Retain semantic page copy and API-backed states.** Existing headings and descriptions remain in the document, while the home artwork gets a concise semantic heading context. Removing semantic copy was rejected because raster text is not selectable, adaptable, or sufficient for assistive technology and search discovery.

5. **Use native public image URLs rather than a new media service.** The artwork is static, approved, and local. No API or CMS model change is justified.

## Risks / Trade-offs

- **[Large PNG payloads]** → Use explicit intrinsic dimensions, lazy-load non-home banners, prioritize only the home banner, and allow Next.js image optimization.
- **[Raster Persian copy scales down on phones]** → Preserve the complete aspect ratio, avoid cropping, and keep semantic HTML copy and visible mobile actions adjacent to the image.
- **[Absolute home action regions could drift]** → Scope overlay placement to the fixed intrinsic aspect ratio and switch to normal-flow visible controls below 768px.
- **[Artwork includes claims that may later change]** → Keep source files isolated under a campaign asset directory so replacement is atomic and requires no component rewrite.

## Migration Plan

1. Copy the five supplied files into `frontend/public/branding/banners/` with stable names.
2. Add and test the shared banner primitive.
3. Integrate the wide banner on home and portrait banners on the four matching entry pages.
4. Run lint, typecheck, unit/component tests, build, and responsive browser checks.
5. Roll back by reverting the asset and presentation commit; no data migration is required.

## Open Questions

- A dedicated mobile crop is not supplied. This implementation preserves the complete artwork instead of inventing or cropping a mobile variant.
