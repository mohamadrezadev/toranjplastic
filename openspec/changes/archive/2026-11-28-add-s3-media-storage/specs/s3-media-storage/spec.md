# s3-media-storage Specification

## Purpose

Enable S3-compatible object storage for both `backend/` (`MediaStorage`) and `cms/` (Strapi upload provider) without changing database object keys, public delivery routes, or security boundaries.

## ADDED Requirements

### Requirement: Backend S3 storage configuration validation

The backend environment loader MUST accept `MEDIA_STORAGE_PROVIDER=mounted-disk` (default) or `MEDIA_STORAGE_PROVIDER=s3`. When `MEDIA_STORAGE_PROVIDER=s3`, it MUST require a non-empty bucket, region, access key ID, and secret access key, and validate any configured endpoint URL.

#### Scenario: Missing required S3 credentials fail fast on startup
- **WHEN** `MEDIA_STORAGE_PROVIDER=s3` is set without `MEDIA_S3_BUCKET` or `MEDIA_S3_ACCESS_KEY_ID` or `MEDIA_S3_SECRET_ACCESS_KEY`
- **THEN** `loadEnvironment` throws a clear configuration error and refuses to fall back to `mounted-disk`

#### Scenario: Valid S3 configuration selects S3 storage
- **WHEN** `MEDIA_STORAGE_PROVIDER=s3` is set with valid bucket, region, endpoint, and credentials
- **THEN** `loadEnvironment` returns `media.storageProvider === 's3'` and `MediaModule` provides `S3MediaStorage`

### Requirement: Provider-neutral S3MediaStorage contract

`S3MediaStorage` MUST implement every method of `MediaStorage` using relative object keys (with an optional safe prefix) and never expose credentials, bucket URLs, or absolute paths in errors or stored keys.

#### Scenario: Put, finalize, exists, open, checksum, and delete lifecycle
- **WHEN** a stream is written with `put`, finalized with `finalize(tempKey, finalKey)`, read with `open(finalKey)`, and deleted with `delete(finalKey)`
- **THEN** `put` writes to `.tmp/<uuid>.part` and returns `bytesWritten` and `checksumSha256`, `finalize` moves it to `finalKey` without overwriting an existing object, `open` streams the object bytes, `getChecksum` returns the SHA-256 hex digest, and `delete` removes the object idempotently

#### Scenario: Unsafe keys are rejected
- **WHEN** a caller passes a key containing `..`, backslashes, leading slashes, or null bytes
- **THEN** `S3MediaStorage` throws `UnsafeMediaKeyError` without issuing S3 requests

#### Scenario: Readiness check verifies bucket access
- **WHEN** `checkReadiness` is called
- **THEN** it performs a `HeadBucket` check and returns `true` when reachable or `false` without throwing when the bucket is unreachable

### Requirement: Strapi S3 upload provider opt-in

`cms/config/plugins.ts` MUST preserve the `local` upload provider by default and switch to `@strapi/provider-upload-aws-s3` when `STRAPI_UPLOAD_PROVIDER=aws-s3` is configured.

#### Scenario: Strapi uses S3 when configured and local otherwise
- **WHEN** `STRAPI_UPLOAD_PROVIDER=aws-s3` is set with bucket and credentials
- **THEN** Strapi configures `upload` with `provider: '@strapi/provider-upload-aws-s3'` and `s3Options`
- **WHEN** `STRAPI_UPLOAD_PROVIDER` is unset or `local`
- **THEN** Strapi continues using `provider: 'local'`
