## Why

The current Toranj Plastic homepage presents basic placeholder cards and static links without reflecting the full capabilities of the platform now that the Strapi CMS integration, product/services catalog, and customer inquiry wizard are operational. To convert industrial B2B visitors effectively, the homepage needs a cohesive visual redesign that elevates Toranj Plastic's core manufacturing capabilities (precision injection molding, engineering materials, product catalog), integrates dynamic technical guides from Strapi CMS, and provides a clear, frictionless pathway to the B2B inquiry wizard, while strictly adhering to non-ecommerce and honest content constraints.

## What Changes

- **B2B Value Proposition & Hero Hierarchy**: Retain the approved campaign artwork while improving typography, keyboard accessibility, and dual primary actions (`/products` and `/inquiry`).
- **Core Manufacturing Capabilities Grid**: Showcase the three foundational pillars (تزریق پلاستیک صنعتی، طراحی و ساخت قالب، مواد اولیه و پلیمرهای مهندسی) with semantic navigation links to `/injection-molding`, `/materials`, and `/products`.
- **Latest Technical Articles Section**: Dynamically display the latest 3 published technical articles and manufacturing guides from Strapi CMS (`listStrapiArticles`) with resilient fallback when Strapi is offline or empty.
- **B2B Inquiry Fast-Track Strip**: Introduce a dedicated industrial inquiry conversion strip detailing the 3-step quotation workflow (ثبت مشخصات/نقشه، بررسی فنی مهندسی، صدور پیش‌فاکتور رسمی) directing users to `/inquiry`.
- **Responsive & Accessibility Hardening**: Ensure strict compliance with Persian RTL, high-contrast dark and light modes, keyboard focus rings, and zero horizontal document overflow at 360px, 390px, 768px, and 1280px.
- **Strict Non-Ecommerce Boundaries**: Reinforce zero presence of cart, online checkout, live inventory, or automatic pricing.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `public-visual-experience`: Expand homepage visual requirements to include the dynamic technical articles showcase, industrial inquiry workflow strip, and enhanced B2B capability presentation while preserving artwork semantics and honest data boundaries.

## Impact

- `frontend/src/app/(public)/page.tsx`: Homepage composition with server-side Strapi integration and capability sections.
- `frontend/src/app/(public)/page.module.css`: Responsive CSS modules for hero, capabilities, articles grid, and inquiry CTA.
- `frontend/src/app/(public)/page.test.tsx`: Component tests verifying RTL layout, Strapi articles rendering, empty/error state fallback, and non-ecommerce guard.
- `frontend/e2e/public-shell.spec.ts`: E2E verification of homepage accessibility, theme toggling, and responsive viewport compliance.
