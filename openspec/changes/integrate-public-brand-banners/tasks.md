## 1. Campaign assets and primitive

- [x] 1.1 Copy the five supplied campaign images into stable frontend public asset paths with descriptive names.
- [x] 1.2 Implement a reusable responsive `CampaignBanner` component with intrinsic sizing, accessible link naming, focus treatment, and priority/lazy-loading support.
- [x] 1.3 Add component tests for banner image semantics, destinations, and optional loading priority.

## 2. Public route integration

- [x] 2.1 Replace the home hero presentation with the wide campaign artwork, semantic context, and two operable product/inquiry actions.
- [x] 2.2 Add the matching products, injection-services, and materials artwork to their collection pages without replacing API-backed content or feedback states.
- [x] 2.3 Add the contact artwork to the managed contact route while preserving managed content and metadata behavior.

## 3. Responsive verification

- [x] 3.1 Extend browser coverage for campaign artwork, action destinations, visible focus, and absence of horizontal overflow.
- [x] 3.2 Verify light and dark presentation at 360, 390, 768, and 1280 pixel widths and capture screenshots.
- [x] 3.3 Run frontend architecture checks, lint, typecheck, component tests, and production build.
- [x] 3.4 Run `openspec validate integrate-public-brand-banners --strict` and reconcile implementation evidence with this checklist.
