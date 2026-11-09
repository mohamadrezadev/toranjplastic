## 1. Public content failure behavior

- [x] 1.1 Read the repository-local Next.js 16 guidance for dynamic rendering, Suspense, loading, and error boundaries and record the chosen route behavior in the implementation diff.
- [x] 1.2 Update `frontend/src/app/(public)/(content)/` public-read routes so upstream timeout/network/invalid/5xx failures leave loading and reach the shared privacy-safe ErrorState with idempotent retry.
- [x] 1.3 Add or update frontend component/route tests proving loading, error, retry success, and non-disclosure of internal error details.

## 2. Semantic home campaign and responsive composition

- [x] 2.1 Refactor `frontend/src/app/(public)/page.tsx` and `page.module.css` so the Hero uses semantic visible copy and real CTA controls once, with the approved artwork cropped as supporting media rather than raster interaction.
- [x] 2.2 Implement continuous mobile/tablet/desktop capability-card grids, bounded media ratios, and a proportionate 768px layout without the 768/769 one-to-three-column jump.
- [x] 2.3 Recompose the closing consultation section so its section label, copy, and action remain visually related at mobile, tablet, and desktop widths.
- [x] 2.4 Update home component tests for one semantic campaign heading, operable CTA destinations, and preserved approved non-ecommerce copy.

## 3. Adaptive content grids and theme integration

- [x] 3.1 Extend the shared `ContentGrid` contract and CSS so one and two children use balanced tracks while three or more retain the existing catalog grid behavior.
- [x] 3.2 Add stable theme-aware media surfaces and action hierarchy for light/dark cards without recoloring verified bitmap media.
- [x] 3.3 Add component tests for one-, two-, and three-item ContentGrid rendering and theme-independent semantic structure.

## 4. Compact responsive footer

- [x] 4.1 Refactor `frontend/src/components/navigation/Footer.tsx` and its CSS to keep brand/primary contact visible and expose lower-priority mobile navigation as keyboard-operable native disclosures while preserving desktop columns.
- [x] 4.2 Update navigation tests for mobile disclosure state, reachable links, RTL order, and local LTR contact formatting.

## 5. End-to-end responsive verification

- [x] 5.1 Extend frontend Playwright coverage for 360, 390, 768, and 1280 widths plus adjacent breakpoints, asserting no horizontal overflow and proportionate card layouts.
- [x] 5.2 Add Playwright coverage for mocked public-content failure/retry, light/dark Hero and media surfaces, campaign keyboard focus, and mobile footer disclosure.
- [x] 5.3 Run frontend lint, typecheck, unit/component tests, relevant Playwright tests, architecture checks, build, and strict OpenSpec validation; record only verified task completion.
