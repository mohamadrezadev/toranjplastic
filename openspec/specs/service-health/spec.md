## Purpose

Define the public backend liveness contract and its disclosure boundary.

## Requirements

### Requirement: Versioned liveness endpoint
The backend SHALL expose `GET /api/v1/health` as a public process-liveness endpoint.

#### Scenario: Healthy process responds
- **WHEN** a client requests `GET /api/v1/health` while the NestJS process is running
- **THEN** the service SHALL return HTTP 200 with `status` equal to `ok`, `service` equal to `toranj-backend`, a non-empty `version`, and an ISO-8601 `timestamp`

### Requirement: Liveness response limits disclosure
The liveness response MUST NOT expose database connection details, environment values, host identifiers, stack traces, credentials, tokens, or customer data and MUST NOT depend on database availability.

#### Scenario: Database is unavailable
- **WHEN** the backend process is alive but PostgreSQL is unavailable
- **THEN** `GET /api/v1/health` SHALL continue to report process liveness without including database error details
