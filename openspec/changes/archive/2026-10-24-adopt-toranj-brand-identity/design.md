## Context

`design-system-core` currently requires "Brand assets SHALL remain marked provisional until product approval." The header renders a bare "ت" glyph, `frontend/src/design-system/tokens.css` carries the comment "Provisional editorial palette," and there is no favicon beyond a generic `favicon.ico`. The project owner reviewed `Toranj_Logo_And_Icons_Web_v1` (logo SVG/PNG set, favicon set, 22 semantic icons, an integration guide, and a provenance README) and approved it as the current brand identity, with the explicit caveat — stated by the package itself — that the logo is a vector reconstruction traced from a raster image on an existing catalog cover, not the factory's original vector artwork. The approved navy/orange palette derived from that package stayed in place.

After seeing that logo live in the header, the project owner supplied a second reference photo — a "Toranj" Latin wordmark with a dotted-circle symbol and a "KITCHEN WARE" sub-brand line — and asked for it to replace the whole-site logo, and for the site's fonts to be "fixed" toward that wordmark's more modern, geometric style. This is itself a photo of an existing lockup, not a vector or font file, so it carries the same kind of provenance gap as the first package and is treated the same way: approved for use, documented as a non-official reconstruction.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder brand mark with the approved logo in the header and auth showcase.
- Ship the approved favicon/app icon set through Next.js's static app-icon conventions.
- Move the token palette from the editorial placeholder to the approved navy/orange identity without breaking the existing accessible-contrast requirement.
- Document the logo's reconstruction provenance so it is never mistaken for a confirmed official trademark file.

**Non-Goals:**

- Rewiring every existing UI glyph (mobile menu/close buttons, alert icons) to the new semantic icon set — only the header/auth brand marks change in this pass.
- Enabling a PWA manifest — the maskable icon is staged in `public/` but no manifest is added, since PWA is not active in this repo.
- Sourcing or requesting the factory's original vector logo file — out of this change's control.

## Decisions

1. **Recolor the logo via CSS `mask-image` bound to the existing brand token, instead of shipping pre-colored SVG variants per theme.** The approved package ships separate dark/light/navy-filled SVGs, but swapping between them per theme would need either a new `:global([data-theme="dark"])` CSS pattern (not used elsewhere in this codebase) or a client component (contradicting the "Server Components by default" rule for a static header). Masking one shape-only SVG and coloring it with `background-color: var(--color-brand-primary)` reuses the same token-driven theming every other component already relies on, stays a Server Component, and keeps the logo's color locked to future token changes automatically. Alternative considered: ship both `<Image>` variants and toggle visibility with a new global CSS selector. Rejected as a second, parallel theming mechanism alongside the token system.
2. **Deepen the raw brand orange for interactive surfaces; reserve the literal swatch for the mark itself.** The package's `#FF6900` fails WCAG AA for white button text (~2.9:1 contrast). `--color-brand-action` and its hover state use a darker, hue-matched orange (`#b74a00` family) that reaches ≥4.5:1 against white/near-white button text, matching the contrast the previous terracotta token already provided. The literal `#FF6900` is used only inside the static logo asset and the maskable favicon, where it is not carrying text.
3. **Shift the hero/footer background from editorial dark green to the approved navy family.** `--color-hero` (and its dark-theme variant) move to a navy-based dark value instead of the previous green, since the hero/footer is the site's most prominent brand surface. The one hardcoded footer border hex (`#587263`, tuned to the old green) is replaced with a token-derived value so it does not visually clash with the new navy hero.
4. **Ship favicon/app icons as static files only.** `favicon.ico`, `icon.png`, and `apple-icon.png` go into `frontend/src/app/` per Next.js's file-based icon convention; `favicon.svg` and `icon-maskable.png` go into `frontend/public/` for later PWA use, matching the package's own integration guide, without adding a manifest now.
5. **Stage, don't force, the 22-icon semantic set.** Icons are copied to `frontend/public/icons/` and documented, but existing glyphs (☰, ×, status icons) are left as-is in this change to keep the diff reviewable; adopting them is a follow-up.
6. **Render the wordmark as real text in a bundled geometric font, and recreate the dotted symbol as generated SVG circles, rather than tracing the reference photo.** The second reference is a flat photo, not an asset file — there is no vector or font to extract. Setting "Toranj" as live text (new `--font-family-brand` token, `@fontsource/poppins` 700/800, matching the existing "no runtime third-party font request" rule from this same spec) keeps the wordmark crisp, accessible, and theme-colorable, instead of baking it into a raster/traced image. The dotted-circle symbol is generated programmatically (a radius-graded hex-packed dot grid) as the closest faithful recreation; it is explicitly documented as a recreation, not a traced copy, since the source photo does not give exact dot coordinates. The exact source font could not be identified with certainty from the photo alone; Poppins was chosen as the closest commonly available geometric sans. The "KITCHEN WARE" sub-brand line from the photo is dropped, since this header represents the whole site, not just the kitchenware product area. The first package's wordmark/symbol SVGs are deleted from `public/branding/` (superseded, no longer referenced); its preview/reference photos stay under `public/branding/preview/` as historical comparison material only.

## Risks / Trade-offs

- **[Reconstructed logo may need replacement later]** → Documented explicitly in `docs/brand-identity-provenance.md` and in the updated spec requirement, so a future swap to an official vector is a drop-in asset replacement, not a rediscovery effort.
- **[New palette could reduce contrast somewhere the old one happened to work]** → Chose token values specifically for ≥4.5:1 text contrast on their typical background; existing component and accessibility-sensitive tests (`design-system`, `components/ui`, `components/navigation`) are re-run as part of this change.
- **[`mask-image` browser support]** → Already the documented technique in the package's own integration guide for icons; supported by all browsers this project targets, and a masked element degrades to invisible-but-non-blocking (not broken layout) if unsupported.

## Migration Plan

Frontend-only static asset and token change; no data migration, no backend impact, no environment variables added. Rollback is a plain revert of the commit (no destructive step, no stored data to restore).

## Open Questions

- Whether to request the factory's original vector logo file and exact wordmark font remains a business decision outside this change's scope.
- Incremental adoption of the staged semantic icon set (replacing ☰/×/status glyphs) is left for a future change.
- Whether "Toranj" (Latin-only) as the primary header wordmark, with no Persian "ترنج" lettering visible in the mark itself, is the final direction for a Persian-first site is a brand decision for the project owner; this change implements it as directed and keeps the Persian accessible name (`aria-label="ترنج پلاستیک — صفحه اصلی"`) on the link regardless.
