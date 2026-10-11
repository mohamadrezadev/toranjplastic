## Context

The current visual foundation is provisional and the live home page contains internal engineering copy. Catalog layouts use generic card and placeholder patterns. Login and registration share a plain centered card. Product rules prohibit invented commercial claims and unapproved photography.

## Goals / Non-Goals

**Goals:** Create a recognizable, polished site with strong hierarchy across public and authentication routes while retaining present behavior and content boundaries.

**Non-Goals:** Final brand identity, official logo, media library, CMS content, working inquiry submission, backend/auth contract changes, or ecommerce.

## Decisions

- Use an editorial industrial direction: warm canvas, deep ink, restrained copper accent, bold Persian typography, fine lines, and geometric panels. These tokens are a coherent proposal until brand approval. Alternative: generic blue corporate cards; rejected based on direct user feedback.
- Build the hero and missing-media visuals with CSS geometry and typography, with explicit decorative semantics. This avoids presenting generated machinery or products as real Toranj assets. Approved CMS images still render normally.
- Put real navigation and descriptions of the three PRD business areas on the home page. The inquiry CTA stays clearly provisional until the inquiry workflow exists.
- Carry the same visual grammar through shared header/footer and content components, so every public route improves without changing API contracts.
- Use a split authentication layout on wider screens and one column on mobile. Keep the existing server actions and error semantics.
- Preserve the existing theme mechanism and use semantic tokens for both themes. Check 360, 390, 768, and 1280 with browser E2E.

## Risks / Trade-offs

- [Proposed colors may differ from final brand] → keep them as tokens; final brand approval can replace values without restructuring pages.
- [Decorative CSS could obscure content] → keep text in the DOM, mark ornament as hidden from assistive technology, and test small screens and reduced motion.
- [Public catalogs are empty until approved content is published] → make empty presentation attractive without manufacturing product data.

## Migration Plan

Deploy frontend assets only; backend and schema are unaffected. Rollback reverts the frontend redesign. Run lint, typecheck, build, unit/component tests, browser viewport checks, and OpenSpec strict validation.

## Open Questions

Official logo, photography, color approval, and verified company/contact claims remain with the product owner and are not blockers for this proposed visual direction.
