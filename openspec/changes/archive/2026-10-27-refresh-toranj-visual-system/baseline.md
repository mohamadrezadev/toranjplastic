## Baseline recorded 2026-10-20

- Pre-change UI used Estedad Variable, light canvas `#f4f2eb`, dark canvas `#111b18`, and orange action colors.
- Playwright defines Chromium projects at 360×800, 390×844, 768×1024, and 1280×800.
- E2E uses a mock content server on port 3199 and production Next.js on port 3100. Public, auth, inquiry, account, and quotation suites capture screenshots; authenticated admin coverage depends on its mock/session setup.
- Risks found before migration: primary/danger foregrounds derived from `surface-card`, fixed light action text in Navigation/Content, and fixed orange/green Auth decoration.
- Every SHA-256 hash and byte size declared by the v3 handoff manifest matched its file.
