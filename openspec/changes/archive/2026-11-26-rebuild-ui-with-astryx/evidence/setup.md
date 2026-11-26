# Astryx setup evidence

## Agent guidance initialization

The reviewed command was run from the repository root:

```text
node frontend/node_modules/@astryxdesign/cli/clients/cli/bin/astryx.mjs init --features agents --agent codex --json
```

The CLI reported `docsWritten: ["AGENTS.md"]`, `docsError: null`, and matching CLI/Core version `0.7.13`. The generated content is retained between the official `ASTRYX:START` and `ASTRYX:END` markers. A repository-specific section immediately after the managed block resolves the following local constraints without editing the generated text:

- the locked `pnpm astryx` command is authoritative instead of an unpinned `pnpm dlx` command;
- OpenSpec, the PRD and Toranj security/product rules keep precedence over template guidance;
- migration is incremental, so existing semantic HTML and CSS modules remain until verified replacement;
- public exports and published CSS are the only approved phase-one integration surface.

## Version alignment gate

`frontend/scripts/check-astryx-versions.mjs` checks every declared `@astryxdesign/*` dependency. It fails when a required package is missing, a version is not exact, or versions diverge. The repository `check:architecture` command invokes this check before the existing architecture checks.
