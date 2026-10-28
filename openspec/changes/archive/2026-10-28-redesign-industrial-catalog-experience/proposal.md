## Why

While the Toranj Plastic public homepage recently received a modern B2B industrial redesign, the public catalog landing and detail pages (`/products`, `/injection-molding`, `/materials`) currently retain earlier layout patterns. Specifically, `/injection-molding` and `/materials` only display static campaign image banners above modest headings, cards lack technical specification badges and direct inquiry pathways, and technical detail views need elevated engineering specification styling and B2B inquiry fast-track reassurance.

This change elevates the visual experience of all three public catalog areas into a coherent, high-end industrial engineering showcase while strictly adhering to non-negotiable product constraints: no ecommerce claims, no carts, no unverified pricing or stock, full Persian RTL, and responsive integrity across 360, 390, 768, and 1280px viewports.

## What Changes

- **Elevated Catalog Landing Heroes**:
  - Replace standalone raster banner image wrappers on `/injection-molding` and `/materials` with cohesive, structured `CatalogLandingHero` components matching `/products`.
  - Provide distinct industrial B2B value propositions, semantic typography, and dual actions (`مشاهده کاتالوگ` and direct inquiry routes `/inquiry/injection`, `/inquiry/material`).
- **Engineered Catalog Cards**:
  - Modernize `ContentCard` with refined industrial card styling, subtle borders, high-contrast badges (e.g. category, polymer family, grade, or service capability), and explicit accessible action links.
- **Enhanced Technical Specification Presentation**:
  - Redesign `Specifications` table into an engineered spec sheet with clear division, technical monospaced LTR values for unit measurements, and enhanced readability across both light and dark themes.
- **Catalog Detail Fast-Track Action Box**:
  - Add a dedicated B2B Inquiry Fast-Track card on detail pages that reassures corporate visitors regarding engineering consultation and prompt quotation issuance, paired with direct slug-bound inquiry links.
- **Visual Verification & Dev Server Readiness**:
  - Verify and inspect pages live across all 4 viewport breakpoints (360px, 390px, 768px, 1280px).

## Capabilities

### New Capabilities
<!-- No new functional capabilities introduced; visual and experience enhancement -->

### Modified Capabilities
- `public-visual-experience`: Enhanced requirements for industrial catalog landing heroes, engineered specification sheets, and B2B inquiry reassurance pathways across products, services, and materials.

## Impact

- `frontend/src/components/content/`: `ContentPage.tsx`, `Content.module.css`, and related catalog components.
- `frontend/src/app/(public)/(content)/`: `products/page.tsx`, `products/[slug]/page.tsx`, `injection-molding/page.tsx`, `injection-molding/[slug]/page.tsx`, `materials/page.tsx`, `materials/[slug]/page.tsx`.
- Automated test suites: `frontend` component tests and E2E Playwright tests.
