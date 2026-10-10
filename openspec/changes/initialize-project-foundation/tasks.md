## 1. OpenSpec and repository governance

- [x] 1.1 Initialize official OpenSpec `spec-driven` structure and Codex workflows, then capture Toranj-wide context and artifact rules in `openspec/config.yaml`.
- [x] 1.2 Document repository, frontend, and backend agent boundaries plus architecture and handoff decisions.

## 2. Monorepo and local infrastructure

- [x] 2.1 Configure the root pnpm workspace, shared scripts, environment example, ignore rules, and single dependency lock.
- [x] 2.2 Add local PostgreSQL Compose configuration and Prisma 7 schema/config/generation commands without domain models or migrations.

## 3. Frontend foundation

- [x] 3.1 Configure Persian RTL root metadata, semantic provisional design tokens, LTR data isolation, focus visibility, and reduced-motion defaults in `frontend/`.
- [ ] 3.2 Build the responsive phase-zero foundation page and verify it at the required 360, 390, 768, and 1280 pixel widths.

## 4. Backend foundation

- [x] 4.1 Add validated backend environment bootstrap, `/api/v1` prefix, Helmet, strict request validation, and constrained CORS.
- [x] 4.2 Implement and test the disclosure-limited `GET /api/v1/health` contract.

## 5. Quality and verification

- [x] 5.1 Add root CI for frozen install, Prisma generation, lint, typecheck, tests, and production builds.
- [ ] 5.2 Run OpenSpec validation, Docker Compose validation, Prisma generation, and the complete root quality gate; record all tasks complete only after successful evidence.
