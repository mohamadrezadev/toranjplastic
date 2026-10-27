## ADDED Requirements

### Requirement: Readiness reports required media-storage availability safely
The backend SHALL expose a readiness operation separate from the existing process-liveness endpoint. When mounted-disk media storage is configured, readiness SHALL check that the configured storage root is the intended mount, is readable and writable, and meets the configured minimum free-space threshold. The response MUST expose only a generic readiness status and bounded component names, not paths, capacities, credentials, host identifiers, stack traces or stored data.

#### Scenario: Media mount is ready
- **WHEN** PostgreSQL and the configured mounted media storage pass their bounded readiness checks
- **THEN** the readiness endpoint SHALL return HTTP 200 with a generic ready status and no sensitive infrastructure details

#### Scenario: Media mount is missing or full
- **WHEN** the mounted media root is missing, not writable or below the configured minimum free-space threshold
- **THEN** the readiness endpoint SHALL return HTTP 503 and the application SHALL reject media uploads without falling back to ephemeral storage

#### Scenario: Readiness dependency fails while the process is alive
- **WHEN** media storage is unavailable but the NestJS process remains running
- **THEN** the existing liveness endpoint SHALL continue reporting process liveness while readiness reports failure, and neither response SHALL disclose the underlying path or exception
