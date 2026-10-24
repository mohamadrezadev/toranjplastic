## Context

The products route currently renders a full portrait campaign poster before its semantic heading, then a shared three-column grid whose single card can stretch vertically and leave a large empty body. Product detail uses a generic two-column hero but lacks a clear catalog-oriented information hierarchy. The APIs already provide only approved title, summary, category, images, description, specifications, featured state, and inquiry availability; the redesign must work strictly within those fields.

## Goals / Non-Goals

**Goals:**

- Make `/products` read as an intentional landing page followed by a compact, scannable catalog.
- Keep semantic text and actions in HTML while using supplied campaign artwork as controlled supporting media.
- Give product cards stable media and content proportions with no artificial empty height.
- Make product detail useful at a glance and preserve verified description, specifications, gallery, metadata, and inquiry paths.
- Keep the shared primitives suitable for service and material catalog adoption.

**Non-Goals:**

- Adding filters, categories, sorting, related products, prices, stock, or data not present in the public API.
- Changing backend contracts, CMS data ownership, inquiry behavior, or SEO contracts.
- Editing or regenerating the supplied campaign artwork.

## Decisions

1. **Compose landing heroes from HTML and controlled media.** A new shared landing-hero primitive will render eyebrow, heading, description, real CTAs, and a bounded image crop. Showing the complete portrait poster as the page itself was rejected because it duplicates semantic content and dominates the viewport.

2. **Use campaign artwork as supporting media, not as a clickable poster.** The products artwork will be cropped with deliberate object positioning inside a responsive landscape media panel. The actual actions remain separate HTML links. This keeps branding while preventing raster buttons from defining interaction.

3. **Remove percentage-height behavior from cards.** Cards will use a natural-height flex column, a stable media aspect ratio, line-clamped optional summaries, and a footer action that follows content without forcing the card to fill an arbitrary tall track.

4. **Keep a responsive grid with bounded card width.** The catalog uses one column on small phones, two columns on tablet, and three columns on desktop. Sparse results align to the start instead of stretching to fill the entire section.

5. **Redesign the shared detail hero with media-first composition.** Product imagery gets a bounded, neutral gallery surface; identity, tags, summary, and inquiry action form a separate information panel. The existing description, specifications, and gallery remain below and use a readable content width.

6. **No inferred product attributes.** Visual labels use only API-backed category and featured state. No placeholder price, availability, technical capability, or delivery promise is shown.

7. **Treat a sparse catalog as a featured result.** When the current response contains exactly one product, the collection uses a wide media-and-copy card on tablet and desktop instead of leaving two empty grid tracks. The same card returns to the normal vertical composition on phones.

8. **Keep the mobile landing above-the-fold concise.** Campaign media remains a supporting crop, while tighter media height, copy spacing, and section spacing reduce duplicated visual weight and bring the first published product into view sooner.

## Risks / Trade-offs

- **[Campaign crop hides embedded text]** → The semantic HTML intentionally carries the meaning; object position is tested at required widths and the source asset remains intact.
- **[Shared card/detail changes affect other catalogs]** → Keep markup contract backward-compatible and run the complete public E2E suite across products, services, materials, and articles.
- **[Very long Persian titles or summaries]** → Use wrapping and bounded line clamping without hiding the full linked title from assistive technology.
- **[Products without imagery]** → Preserve an honest neutral placeholder rather than inserting sample media.

## Migration Plan

1. Add the shared landing hero and its tests.
2. Redesign shared cards and detail presentation without changing their data props.
3. Compose the products route with the new landing hero and catalog section.
4. Verify product collection and detail at required widths/themes, then run all frontend quality gates.
5. Roll back presentation files only; no data migration is required.

## Open Questions

- Dedicated crop-safe source images may replace campaign artwork later; the component accepts a normal image path so this does not require another layout rewrite.
