## Context

Toranj Plastic v1 is a Persian RTL corporate catalog and engineering inquiry platform. Visitors include procurement managers, manufacturing companies, and product developers. The platform contains three core public offerings:
1. **Manufactured Products (`/products`)**: Goods manufactured directly on Toranj Plastic's line using company-owned tooling.
2. **Injection Molding Services (`/injection-molding`)**: Custom industrial plastic molding where clients utilize their own molds or CAD models.
3. **Engineering Materials (`/materials`)**: Supply of technical polymer granules.

Currently, the product detail page (`/products/[slug]`) utilized a default `DetailInquiryCard` copy referencing "mold review and CAD inspection" (بررسی قالب و نقشه), creating domain confusion for manufactured products. Concurrently, the managed `/about` and `/contact` pages lack database seed data (rendering 404s) and lack dedicated visual hierarchy and Google Search structured data (JSON-LD `Organization`, `LocalBusiness`, `ContactPage`, `AboutPage`).

## Goals / Non-Goals

**Goals:**
- Differentiate `DetailInquiryCard` copy: manufactured products focus on batch production, custom colors/masterbatch, and formal price quotes; services focus on mold inspection and CAD analysis.
- Seed professional, verified industrial content for `/about` and `/contact` in PostgreSQL `ManagedPage`.
- Build structured, responsive UI layouts for `/about` and `/contact` with plant specs (80T to 450T machine fleet), quality standards, direct contact channels (sales, engineering, factory), business hours, and location links.
- Implement comprehensive Schema.org JSON-LD structured data for Google Search discovery (`Organization`, `LocalBusiness`, `ContactPage`, `AboutPage`, `ContactPoint`).
- Maintain 100% test coverage, RTL orientation, and responsive views (360px, 390px, 768px, 1280px).

**Non-Goals:**
- No online shopping cart, automatic pricing, or live stock display (per non-negotiable PRD constraints).
- No unapproved or fabricated certifications, addresses, or phone numbers beyond verified company contact channels.
- No direct database access from frontend (strict NestJS API boundaries).

## Decisions

### 1. Tailored Inquiry Copy vs Generic Component
- **Decision**: Keep `DetailInquiryCard` as a flexible presentation primitive, but supply explicit props on `/products/[slug]`, `/injection-molding/[slug]`, and `/materials/[slug]`, while updating default fallback copy to manufactured products.
- **Rationale**: Eliminates domain ambiguity and preserves modularity.

### 2. Dedicated Components for About and Contact Pages
- **Decision**: Create rich, semantic components for `/about` and `/contact` inside `frontend/src/components/content/` (`AboutContent.tsx` and `ContactContent.tsx` or enhanced `ManagedPage.tsx`), rendering structured subsections for factory profile, tonnage fleet, quality control, contact directory, and business hours.
- **Rationale**: B2B buyers evaluating manufacturing partners require structured reassurance regarding plant capabilities and direct phone extensions, rather than a raw, unstructured text dump.

### 3. Google Structured Data (JSON-LD) Utility
- **Decision**: Extend `frontend/src/lib/jsonld.ts` to export `organizationJsonLd()`, `aboutJsonLd()`, and `contactJsonLd()`, outputting standard Schema.org structures embedded via `<script type="application/ld+json">`.
- **Rationale**: Enhances Googlebot discovery, indexation quality, and rich snippets for industrial brand identity without impacting client-side runtime bundle performance.

### 4. Database Seeding for Managed Pages
- **Decision**: Augment `scripts/seed-catalog-data.mjs` to insert published records for `about` and `contact` in the PostgreSQL `ManagedPage` table.
- **Rationale**: Ensures local development, CI integration tests, and production deployments have identical, authoritative page records.

## Risks / Trade-offs

- **[Risk]** Next.js partial prerender conflicts with dynamic data or timestamps.
  → *Mitigation*: Use deterministic ISO date strings and avoid evaluating runtime unstable APIs (`Date.now()`, `Math.random()`) in static SSR metadata.
- **[Risk]** Mismatch between static JSON-LD and live API content.
  → *Mitigation*: Derive JSON-LD properties directly from verified `ManagedPage` data and site constants (`siteOrigin`, `siteName`).
