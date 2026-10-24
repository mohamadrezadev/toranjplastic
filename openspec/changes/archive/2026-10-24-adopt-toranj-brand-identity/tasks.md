## 1. Brand assets

- [x] 1.1 Copy the approved logo (wordmark mask source + symbol mark), favicon set, and semantic icon set into `frontend/public/branding/` and `frontend/public/icons/`.
- [x] 1.2 Add `docs/brand-identity-provenance.md` recording the source package, the reconstructed-not-official-vector caveat, the color-token mapping, and the asset manifest.

## 2. Header and auth identity

- [x] 2.1 Replace the header's text monogram with the mask-rendered wordmark logo bound to `--color-brand-primary`, preserving the existing accessible link name.
- [x] 2.2 Replace the auth showcase monogram with the mask-rendered symbol mark, preserving its existing accessible structure.

## 3. App icons

- [x] 3.1 Add `favicon.ico`, `icon.png`, and `apple-icon.png` under `frontend/src/app/` and `favicon.svg` / `icon-maskable.png` under `frontend/public/`.

## 4. Brand color tokens

- [x] 4.1 Update `--color-brand-primary`, `--color-brand-action` (+ hover/soft), and `--color-hero` in both light and dark themes in `tokens.css` to the approved navy/orange identity, keeping ≥4.5:1 contrast for interactive text.
- [x] 4.2 Replace the hardcoded footer border color with a token-derived value compatible with the new hero background.

## 5. Spec

- [x] 5.1 Update the `design-system-core` spec to mark brand assets approved-with-provenance instead of provisional, and describe the approved navy/orange palette.

## 6. Verification

- [x] 6.1 Run lint, typecheck, unit/component tests, and build.
- [x] 6.2 Visually check header, footer, and primary buttons at 360, 390, 768, and 1280 px in light and dark themes. (verified and approved by project owner)

## 7. Logo replacement (second round, per project owner's live review)

- [x] 7.1 Add `@fontsource/poppins` (700/800) as a bundled dependency and a `--font-family-brand` token; import it in the root layout alongside the existing Estedad import, with no runtime third-party font request.
- [x] 7.2 Generate a recreated dotted-circle symbol mark (`frontend/public/branding/toranj-symbol-dots.svg` + regenerated favicon/app icon PNGs/ICO from the same shape) from the project owner's reference photo.
- [x] 7.3 Replace the header and auth-showcase logo with a "T" + dotted-icon + "ranj" lockup (real text in the brand font, `aria-hidden` with the existing Persian `aria-label` preserved on the link), dropping the "KITCHEN WARE" sub-brand text.
- [x] 7.4 Remove the now-superseded first-package wordmark/symbol SVGs from `frontend/public/branding/`; keep its preview/reference images under `frontend/public/branding/preview/` as historical comparison only.
- [x] 7.5 Update `docs/brand-identity-provenance.md` and this change's proposal/design to record the second round of provenance (reference photo, not a vector/font file; font could not be identified with certainty, Poppins chosen as closest match).
- [x] 7.6 Re-run lint, typecheck, unit/component tests, and build after the logo/font swap.

## 8. Homepage real product imagery

- [x] 8.1 Replace the homepage hero's abstract decorative artwork with an already-approved, already-provenance-documented catalog product photo (`/catalog/all-purpose-liquid-dispenser.webp`).
- [x] 8.2 Replace the "محصولات" area card's abstract glyph with an already-approved catalog product photo (`/catalog/spice-dispenser.webp`); leave the "خدمات تزریق" and "مواد اولیه" cards on their existing abstract glyphs, since no real injection-molding or raw-material photography has been published yet and this change does not fabricate any.
- [x] 8.3 Re-run lint, typecheck, unit/component tests, and build after the homepage imagery change.
