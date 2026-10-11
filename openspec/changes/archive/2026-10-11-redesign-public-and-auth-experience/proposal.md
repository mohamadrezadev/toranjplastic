## Why

The public and authentication screens currently look like an engineering prototype. Their copy discusses implementation status, their layouts repeat generic cards, and their visual hierarchy does not help visitors find the relevant product or service path.

## What Changes

- Give the public shell, home page, content collections/details, and authentication screens one distinctive responsive visual language.
- Replace implementation-facing home copy with truthful navigation and descriptions of the three approved business areas.
- Make the home page a useful entry point to products, injection services, materials, and contact; keep unavailable inquiry functionality clearly unavailable.
- Give login and registration a branded layout with clear form hierarchy and readable feedback.
- Improve empty, error, and missing-media presentation without inventing catalog items, business claims, contact details, or photography of actual Toranj operations.
- Preserve the existing read-only public content contract, auth behavior, RTL, light/dark support, private noindex/no-store, and keyboard access.
- This change does not introduce checkout, online payment, stock, automatic prices, verified production claims, CMS publishing, or an inquiry submission flow.

## Capabilities

### New Capabilities

- `public-visual-experience`: Coherent, accessible presentation of the home page, public shell, and public content pages.
- `auth-visual-experience`: Coherent, accessible presentation of the existing login and registration flows.

### Modified Capabilities

None. Existing content and authentication contracts remain unchanged.

## Impact

Frontend design tokens, public layout/navigation/footer, home, shared content components, authentication screens, and visual/responsive tests. No database or backend API changes.
