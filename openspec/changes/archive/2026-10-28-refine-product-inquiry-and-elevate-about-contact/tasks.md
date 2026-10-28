## 1. Product Detail Inquiry Refinement

- [x] 1.1 Update `DetailInquiryCard` default props in `frontend/src/components/content/ContentPage.tsx` to reflect manufactured catalog products rather than mold analysis.
- [x] 1.2 Pass manufactured product inquiry copy on `frontend/src/app/(public)/(content)/products/[slug]/page.tsx` focusing on batch production, coloration/masterbatch, and official quotations.
- [x] 1.3 Verify frontend content tests and ensure no references to mold or CAD reviews appear on product detail pages.

## 2. Seed Managed Pages (About & Contact)

- [x] 2.1 Add idempotent seeding for `about` and `contact` in `scripts/seed-catalog-data.mjs` with verified industrial plant profiles, tonnage fleet, and official contact channels.
- [x] 2.2 Execute seeding script and verify `/api/v1/public/content/pages/about` and `/api/v1/public/content/pages/contact` return HTTP 200 with published status.

## 3. Dedicated Presentation for About and Contact

- [x] 3.1 Implement structured sections for `/about` highlighting corporate mission, machine fleet (80T-450T), quality management, and consultation actions.
- [x] 3.2 Implement structured sections for `/contact` displaying direct departmental channels (sales, engineering, admin), business hours, factory/office location, and inquiry links.
- [x] 3.3 Apply responsive, accessible Persian RTL styles matching Design System v2 across 360px, 390px, 768px, and 1280px in both themes.

## 4. Google Search Optimization & Structured Data (JSON-LD)

- [x] 4.1 Implement `organizationJsonLd`, `aboutJsonLd`, and `contactJsonLd` helpers in `frontend/src/lib/jsonld.ts`.
- [x] 4.2 Embed Schema.org JSON-LD scripts and verify meta titles, descriptions, canonical links, and OpenGraph tags on `/about` and `/contact`.
- [x] 4.3 Add unit tests verifying JSON-LD generation and structure.

## 5. Verification & OpenSpec Archive

- [x] 5.1 Run frontend test suite (`pnpm --filter frontend test`) and confirm all tests pass.
- [x] 5.2 Verify live routes on dev server (`/products/[slug]`, `/about`, `/contact`) with HTTP 200 and zero console errors.
- [x] 5.3 Archive change using `npx openspec archive`.
