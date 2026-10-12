# ADR-0003 — Future business-domain boundaries remain unimplemented

Status: Accepted  
Date: 2026-10-12

## Context

The PRD v1.2 handoff describes future inquiry, quotation, and file workflows. This architecture refactor is limited to completing CMS boundaries and must not create new product behavior, speculative data models, empty runtime modules, or API contracts for those future workflows.

## Decision

- Keep the current NestJS modular monolith and separate frontend feature ownership from App Router route ownership.
- When a future approved OpenSpec change introduces a business domain, that domain owns its application rules and persistence and exposes only documented public contracts; consumers must not import its private repositories or implementation files.
- Cross-domain workflows must be introduced only with approved product requirements and explicit transactional/authorization boundaries in their OpenSpec change. This ADR defines no future entities, statuses, endpoints, or permissions.
- Do not pre-create empty Inquiry, Quotation, or File modules as part of architecture preparation.

## Consequences

The existing architecture diagram may identify future domains as conceptual only. Implementation starts when the corresponding product scope is approved, and each domain boundary must be verified by the import architecture gate.
