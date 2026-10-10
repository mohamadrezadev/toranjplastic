## Why

Phase zero established the repository and RTL application shell, but the project still lacks reusable, testable UI primitives and page patterns for consistent delivery of the public site, customer portal, and admin workspace. The next phase creates that shared visual foundation before business screens and backend domain behavior begin.

## What Changes

- Establish the first production-oriented component layers: semantic tokens, UI primitives, shared feedback states, and public navigation patterns.
- Implement accessible variants and states for buttons and form controls, including normal, hover, focus, disabled, loading, help, and error behavior.
- Create reusable feedback patterns for loading, empty, success, warning, information, and error states without relying on color alone.
- Create the responsive public shell with Persian RTL header, mobile navigation, footer placeholders, content container, and breadcrumb pattern.
- Define visual verification for RTL and viewport widths 360, 390, 768, and 1280 pixels, including keyboard focus, reduced motion, and horizontal-overflow checks.
- Keep Design System v2 colors and typography explicitly provisional until the Toranj team approves the final palette, vector logo, font assets, imagery, and contact information.
- Non-goals: CMS and catalog data, authentication/OTP, inquiry submission, portal/admin business screens, quotations, uploads, final PWA assets, ecommerce, payment, inventory, automatic pricing, or publication of unverified technical/commercial claims.

## Capabilities

### New Capabilities

- `design-system-core`: Semantic token usage and accessible reusable UI primitives with complete interaction states.
- `ui-feedback-patterns`: Shared loading, empty, success, warning, information, and error presentation rules across application surfaces.
- `responsive-public-shell`: Persian RTL public layout with responsive navigation, content structure, footer placeholders, and breadcrumb behavior.

### Modified Capabilities

None. This change depends on completing the active `initialize-project-foundation` change; its archived foundation specs remain unchanged.

## Impact

The change primarily affects `frontend/src/design-system`, shared UI components, the public route layout, CSS architecture, frontend tests, and responsive/accessibility verification. Backend contracts and database schema are unaffected. Any brand-specific asset or real company content remains blocked on explicit product approval.
