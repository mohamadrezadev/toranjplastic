## Why

The public frontend currently renders a plain text monogram ("ت") instead of a logo, uses an editorial placeholder palette explicitly marked provisional, and ships no favicon or app icons. The project owner first supplied a logo/favicon/icon package (`Toranj_Logo_And_Icons_Web_v1`, a reconstruction traced from a raster catalog image) and approved it as the brand identity and palette source. After reviewing the result live, the project owner then supplied a second, more polished reference — a "Toranj" Latin wordmark with a dotted-circle symbol (cropped from a "KITCHEN WARE" sub-brand lockup) — and directed that **this second logo replace the whole-site logo** (header and favicon), while keeping the already-approved navy/orange palette unchanged for now. The design system moves from provisional brand placeholders to this approved identity while recording both rounds of provenance honestly, since neither source is a confirmed official vector file from the brand owner.

## What Changes

- Add a code-rendered "Toranj" wordmark (real text, not an image) using a bundled geometric Latin webfont (`@fontsource/poppins`), plus a programmatically recreated dotted-circle symbol mark (`frontend/public/branding/toranj-symbol-dots.svg`), as the site's logo. The "KITCHEN WARE" sub-brand text from the reference photo is intentionally dropped since the site is not kitchen-only.
- Replace the header's text monogram and the auth showcase monogram with this wordmark+symbol lockup, rendered through the existing theme-token system (no new client-side theme-swap logic); add `--font-family-brand` for the Latin wordmark.
- Regenerate and wire the favicon/app icons (`favicon.ico`, `icon.png`, `apple-icon.png`, maskable/192px) from the same dotted-circle symbol.
- Update the `--color-brand-primary`, `--color-brand-action` (and hover/soft derivatives), and `--color-hero` design tokens in both light and dark themes to the approved navy/orange identity, deriving values that keep the existing accessible-contrast requirement, and remove the one hardcoded footer border color that no longer fits the new hero background.
- Record both rounds of provenance (first package, then the replacement logo and font) in a dedicated doc and update the `design-system-core` spec so brand assets are no longer described as provisional, while requiring provenance documentation for any asset that is not yet a confirmed official vector.
- Keep the first package's 22-icon semantic set staged under `public/icons/` for incremental adoption; this change does not rewire every existing glyph (e.g., the mobile menu/close buttons) to it. The first package's own wordmark/symbol SVGs are removed from `public/branding/` since they are superseded; its preview/reference images are kept under `public/branding/preview/` purely as historical comparison material.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `design-system-core`: Move brand assets from "provisional" to "approved, with documented provenance," and update the active palette description from the editorial placeholder to the approved navy/orange identity.

- Replace the homepage hero's and "محصولات" area card's abstract decorative artwork with already-approved, already-provenance-documented catalog product photos; the "خدمات تزریق" and "مواد اولیه" cards keep their abstract glyphs since no real photography exists yet for those capabilities, and none is fabricated.

## Impact

Frontend design tokens, the header and auth-showcase components and their CSS modules, root layout font imports, a new `@fontsource/poppins` dependency, Next.js app icon files, `frontend/public/branding/` and `frontend/public/icons/` assets, the homepage hero/area-card markup and styles, and a brand-identity provenance doc. No backend, database, or API changes. No cart, payment, inventory, or pricing behavior is touched.
