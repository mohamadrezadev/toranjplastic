## Why

Toranj Plastic currently stores uploaded media (`backend/` via `MountedDiskStorage`) and editorial images (`cms/` Strapi `local` provider) on local/persistent disk. Supporting an S3-compatible object storage backend enables stateless compute deployments, eliminates single-writer persistent disk coupling on Runflare, and allows testing against a local S3-compatible container (MinIO) before switching credentials to production object storage.

## What Changes

- Extend `backend/src/config/environment.ts` and `.env.example` to support `MEDIA_STORAGE_PROVIDER=s3` alongside `mounted-disk`, with validated S3 configuration (`MEDIA_S3_ENDPOINT`, `MEDIA_S3_REGION`, `MEDIA_S3_BUCKET`, `MEDIA_S3_ACCESS_KEY_ID`, `MEDIA_S3_SECRET_ACCESS_KEY`, `MEDIA_S3_FORCE_PATH_STYLE`, `MEDIA_S3_KEY_PREFIX`).
- Implement `S3MediaStorage` in `backend/src/media/storage/s3.storage.ts` conforming to the provider-neutral `MediaStorage` interface (`put`, `open`, `exists`, `finalize`, `delete`, `checkReadiness`, `cleanTemporaryFiles`, `listAllKeys`, `getChecksum`) using `@aws-sdk/client-s3`.
- Wire `MediaModule` to select `MountedDiskStorage` or `S3MediaStorage` based on `MEDIA_STORAGE_PROVIDER`.
- Update `cms/config/plugins.ts` (and `cms/config/middlewares.ts` if needed) to support `@strapi/provider-upload-aws-s3` when `STRAPI_UPLOAD_PROVIDER=aws-s3`, while preserving `local` as the default when S3 is not configured.
- Add unit tests for `S3MediaStorage` and `environment.ts` S3 validation, and verify end-to-end against a local S3-compatible (MinIO) container.
- Keep all v1 non-commerce rules, server-side ownership/authorization, and provider-neutral relative object keys unchanged.

## Capabilities

### New Capabilities

- `s3-media-storage`: Provider-neutral S3-compatible object storage adapter for `backend/` (`MediaStorage`) and `cms/` (Strapi upload provider), testable locally with MinIO and deployable to Runflare/S3-compatible providers.

## Impact

- `backend/package.json`, `cms/package.json`, and `pnpm-lock.yaml` gain `@aws-sdk/client-s3` and `@strapi/provider-upload-aws-s3`.
- `backend/src/config/environment.ts`, `backend/src/media/media.module.ts`, and `cms/config/plugins.ts` gain S3 provider selection and validation.
- `.env.example` and `docs/runbooks/runflare-deployment.md` document S3 environment variables.
- No database schema changes, no URL contract changes, and no breaking changes to existing `mounted-disk` or `local` setups.
