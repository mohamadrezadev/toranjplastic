## Context

The Toranj Plastic homepage is the primary entrance for industrial procurement officers, factory owners, and consumer product distributors looking for plastic injection manufacturing, custom tooling/mold making, engineering polymers, and plastic home/cleaning goods.

Previously, the homepage was an initial placeholder containing only the approved campaign banner and 3 basic static area cards. Now that both the NestJS core backend and Strapi CMS are fully hardened, running in production, and backed by automated tests, the homepage can be elevated into a comprehensive B2B portal that showcases Toranj Plastic's manufacturing expertise, displays real published technical guides, and guides prospective clients into the quotation inquiry funnel.

## Goals / Non-Goals

**Goals:**
- Provide a modern, Persian RTL, mobile-first homepage adhering to Design System v2.
- Preserve the approved wide campaign hero artwork (`/branding/banners/home-hero.png`) while maintaining semantic headings and keyboard-operable actions.
- Highlight core manufacturing pillars: Precision Injection Molding (`/injection-molding`), Industrial Tooling & Mold Making (`/injection-molding#tooling`), Engineering Materials (`/materials`), and Products Catalog (`/products`).
- Integrate real published technical guides from Strapi CMS via `listStrapiArticles({ pageSize: 3 })` with robust server-side error boundaries.
- Provide a dedicated B2B Inquiry Fast-Track section explaining the 3-step quotation workflow and routing users to `/inquiry`.
- Support responsive viewports across 360, 390, 768, and 1280px without any horizontal document overflow.
- Ensure full keyboard accessibility and visible focus rings in both light and dark themes.

**Non-Goals:**
- No ecommerce features: strictly no shopping cart, no online payment, no live inventory, and no instant automated pricing.
- No fabricated engineering data, certifications, customer logos, or pricing claims that have not been approved.
- No client-side waterfall fetching: Strapi articles must be loaded on the server (RSC) with a short timeout and graceful fallback.

## Decisions

### 1. Server-Side Data Fetching with Resilient Fallback for CMS Articles
- **Decision:** Fetch articles directly within the Server Component (`page.tsx`) using `listStrapiArticles({ pageSize: 3 })` wrapped in a `try/catch` block.
- **Rationale:** If Strapi CMS is temporarily down, redeploying, or slow to respond, the homepage must continue to render instantly without throwing a 500 error or showing an ugly error banner. If 0 articles are returned or an exception occurs, the homepage simply hides or adapts the articles section gracefully without fabricating fake articles.
- **Alternatives Considered:** Client-side SWR/React Query fetch (rejected because it hurts SEO, introduces layout shift, and violates server-side first architecture).

### 2. Semantic Structure & Overlay Actions for Hero Artwork
- **Decision:** Maintain the existing dual-action overlay on desktop (`position: absolute`) that matches the campaign artwork, while keeping semantic `<h1>` and descriptive `<p>` in DOM. On smaller screens (`<= 768px`), switch to a stacked column layout where the text and buttons flow naturally below the artwork image.
- **Rationale:** The campaign artwork has rasterized text on desktop, but accessibility regulations and automated tests (`public-shell.spec.ts`) require real focusable links and semantic headings. Responsive stacking ensures mobile users (360px-768px) have comfortable touch targets (>= 44px) and clear typography.

### 3. B2B Inquiry Fast-Track Workflow Presentation
- **Decision:** Present a 3-step procedural guide explaining how Toranj Plastic handles custom industrial inquiries:
  1. ثبت مشخصات و نقشه فنی (ارسال مشخصات قطعه، ابعاد، یا مدل سه‌بعدی)
  2. بررسی مهندسی و تحلیل قالب (امکان‌سنجی تولید، انتخاب پلیمر و تناژ دستگاه)
  3. صدور پیش‌فاکتور رسمی (ارائه برآورد زمان‌بندی و شرایط ساخت)
- **Rationale:** B2B industrial clients need clarity on the inquiry process before submitting technical specifications or CAD files. This reduces hesitation and sets clear expectations without promising unverified delivery dates.

### 4. Component Structure and Architecture Boundaries
- **Decision:** Keep the page implementation clean in `frontend/src/app/(public)/page.tsx` and modular CSS in `frontend/src/app/(public)/page.module.css`, importing only approved primitives and types.
- **Rationale:** Complies with `pnpm check:architecture` and monorepo boundaries. No backend or database code is imported in frontend.

## Risks / Trade-offs

- **[Risk]** Strapi CMS network latency delaying homepage initial HTML delivery.  
  → **Mitigation:** `fetchFromStrapi` already enforces a configurable `AbortSignal.timeout(5000)` and Next.js ISR revalidation caching (`next: { tags: ["strapi:articles"] }`). In local dev or cold start, failures fall back to `items = []` without blocking page response.
- **[Risk]** Regression in existing Playwright tests in `public-shell.spec.ts`.  
  → **Mitigation:** The heading `<h1>محصولات و خدمات ترنج پلاستیک</h1>` and link `a[href="/products"]` and `a[href="/inquiry"]` are strictly preserved, matching exact selectors in `public-shell.spec.ts`.

## Migration Plan

1. Develop and test the updated homepage in `frontend/src/app/(public)/page.tsx` and `page.module.css`.
2. Add comprehensive component unit tests in `frontend/src/app/(public)/page.test.tsx`.
3. Run `pnpm check:architecture`, `pnpm typecheck`, `pnpm test`, and verify E2E specs.
4. Validate OpenSpec change and archive.

## Open Questions

None. All constraints are strictly governed by PRD v1.2 and existing specs.
