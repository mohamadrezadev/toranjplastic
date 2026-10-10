<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Toranj frontend rules

- Root `AGENTS.md` and the active spec are mandatory.
- Every page defaults to Persian and RTL. Use `.ltrData`/`dir="ltr"` only for identifiers, phone, email, code and URLs.
- Layer UI as `design-system` → `components/ui` → domain components → route screens.
- Server Components are the default; add `"use client"` only for real interaction/browser APIs.
- Private portal/admin responses must use `no-store` and private pages must be `noindex`.
- Never add shopping cart, online payment, fake pricing/inventory or unverified industrial claims.
- All interactive controls need keyboard focus, label, loading, disabled and error behavior.
