## Why

The Toranj Plastic public platform has a critical conceptual distinction between its manufactured catalog products and its custom injection molding services:
1. **Manufactured Products (`/products`)**: These are proprietary, ready-to-produce goods manufactured using Toranj Plastic's owned production molds. The current B2B fast-track inquiry card mistakenly used default copy referencing "mold and CAD file reviews" (بررسی قالب و نقشه), which is an operational error. Product buyers require batch volume, custom masterbatch/color options, grade specifications, delivery schedules, and official commercial quotations—not mold engineering.
2. **Services (`/injection-molding`) vs Materials (`/materials`)**: Mold review and CAD analysis strictly belong to custom injection services, while polymer analysis (CoA) belongs to materials.
3. **Managed About & Contact Pages (`/about`, `/contact`)**: These core institutional pages currently lack seeded database records (resulting in 404 responses), lack specialized visual styling for factory facilities, equipment tonnage, and direct contact avenues, and lack comprehensive Google Search structured data (JSON-LD schemas for `Organization`, `LocalBusiness`/`IndustrialBusiness`, `ContactPage`, and `AboutPage`).

Fixing these establishes complete industrial accuracy, eliminates 404s on primary navigation routes, and maximizes search engine discovery and credibility.

## What Changes

- **Product Detail Inquiry Differentiation**:
  - Update `DetailInquiryCard` on `/products/[slug]` to explicitly focus on direct factory manufacturing, batch order volume, custom coloration/masterbatch, and prompt official quotation issuance—removing all mentions of mold/CAD review.
  - Update default `DetailInquiryCard` copy in `ContentPage.tsx` to align with manufactured catalog goods rather than mold-making.
- **Seeded Managed Pages for About & Contact**:
  - Add idempotent database seeding in `scripts/seed-catalog-data.mjs` for `/about` and `/contact` with verified, professional Persian industrial content, production capacities (machines ranging 80T to 450T), quality assurance standards, plant address, official landlines, and business hours.
- **Dedicated Presentation & UI for About and Contact**:
  - Elevate `/about` and `/contact` presentation with structured sections: plant profile, machine fleet overview, quality control commitment, direct communication channels (sales, engineering, administration), map/navigation links, and fast-track consultation actions.
- **Google Search Optimization & Structured Data (SEO / JSON-LD)**:
  - Implement comprehensive Schema.org JSON-LD structured data generators for `Organization`, `IndustrialBusiness` / `LocalBusiness`, `ContactPage`, `AboutPage`, and `ContactPoint`.
  - Ensure canonical links, OpenGraph metadata, meta descriptions, and semantic headings adhere to Google Search guidelines.

## Capabilities

### New Capabilities
<!-- No new capabilities; refining and completing existing content and experience specs -->

### Modified Capabilities
- `public-visual-experience`: Product inquiry cards must accurately distinguish between factory-owned ready products and client-supplied mold services.
- `public-content-pages`: Managed `/about` and `/contact` pages must render structured company and contact information with industrial integrity.
- `public-search-discovery`: Public institutional routes must emit valid Schema.org structured data for organization and contact discovery.

## Impact

- `frontend/src/app/(public)/(content)/products/[slug]/page.tsx`: Pass product-specific B2B inquiry props.
- `frontend/src/components/content/ContentPage.tsx`: Refine default inquiry card copy.
- `frontend/src/app/(public)/(content)/about/`: Dedicated visual presentation and SEO metadata.
- `frontend/src/app/(public)/(content)/contact/`: Dedicated visual presentation, contact points, and business hours.
- `frontend/src/lib/jsonld.ts`: Utilities for `Organization`, `ContactPage`, and `AboutPage` Schema.org generation.
- `scripts/seed-catalog-data.mjs`: Seed data for `ManagedPage` (`about` and `contact`).
- Automated tests: Frontend unit tests and accessibility tests.
