## Context

The Toranj Plastic platform is a specialized B2B industrial catalog and engineering inquiry platform. While the public homepage was recently redesigned with clean B2B manufacturing highlights, the catalog pages (`/products`, `/injection-molding`, and `/materials`) have slight architectural discrepancies:
- `/products` uses `CatalogLandingHero` with dual actions and bounded media.
- `/injection-molding` and `/materials` currently wrap raw raster banner images in a `CampaignBanner` component without structured heading text or dual action buttons.
- Catalog cards across all three pages have basic styling that can be elevated with technical tags (e.g. polymer family, grade, category) and crisp hover states.
- Catalog item detail pages (`/products/[slug]`, `/injection-molding/[slug]`, `/materials/[slug]`) have basic specifications tables; they can be enhanced with technical engineering styling, LTR units, and a dedicated B2B Inquiry Fast-Track card that clarifies the engineering quote process without online checkout.

## Goals / Non-Goals

**Goals:**
- Provide a consistent, high-end industrial visual identity across all 3 catalog landing pages (`/products`, `/injection-molding`, `/materials`) utilizing `CatalogLandingHero`.
- Elevate `ContentCard` with clear technical badges, subtle border transitions, and accessible "مشاهده مشخصات فنی" actions.
- Enhance `Specifications` component with clean engineering borders, alternating row fills, and clear LTR formatting for technical units and codes.
- Introduce an accessible `DetailInquiryCard` on detail pages explaining the B2B engineering consultation and formal quotation turnaround time, with direct link to `/inquiry/[type]?slug=...`.
- Ensure 100% adherence to non-negotiable constraints: no shopping carts, no buy buttons, no automatic pricing, no live stock claims.
- Guarantee flawless responsiveness and RTL at 360px, 390px, 768px, and 1280px viewports in both light and dark themes.

**Non-Goals:**
- Changing backend database schemas, content types, or API endpoints.
- Introducing online transactions, pricing calculation engines, or checkout flows.
- Replacing existing brand campaign visual assets.

## Decisions

### 1. Unified Catalog Landing Hero Component
- **Decision:** Standardize `/injection-molding` and `/materials` to use `CatalogLandingHero`, featuring their respective campaign artwork (`/branding/banners/injection-services.png` and `/branding/banners/materials.png`), tailored B2B copy, and dual action links (`#catalog-grid` and `/inquiry/[type]`).
- **Rationale:** Delivers visual parity across all industrial offerings, ensuring screen readers receive semantic headings instead of solely depending on raster banner images.

### 2. Engineered Specifications Sheet
- **Decision:** Upgrade the `Specifications` component styling to render crisp, technical table cells with high-contrast borders and automated LTR detection for technical metrics (e.g. `MFI 2.5 g/10min`, `Tensile 32 MPa`, `150T - 450T`).
- **Rationale:** Industrial buyers and procurement engineers review raw specifications before inquiring; formatting them as clean spec sheets increases trust and clarity.

### 3. B2B Fast-Track Consultation Reassurance
- **Decision:** Add a dedicated, accessible card below the detail specifications explaining:
  "بررسی مهندسی نقشه و پلیمر توسط کارشناسان ترنج پلاستیک | صدور پیش‌فاکتور رسمی ظرف ۲۴ الی ۴۸ ساعت کاری"
  with a direct, keyboard-accessible button to the relevant `/inquiry/[type]` form pre-filling the slug.
- **Rationale:** Clearly reinforces that Toranj Plastic is a custom manufacturing and supply partner, not an off-the-shelf retail shop.

## Risks / Trade-offs

- **[Risk] Test regression on existing catalog page tests**: `ContentPage.test.tsx` and `public-shell.spec.ts` test specific testIds and elements.
  - *Mitigation*: Retain existing IDs (`product-catalog`, `injection-campaign` or equivalent IDs, `catalog-landing-title`) and verify all existing component and E2E tests pass.
