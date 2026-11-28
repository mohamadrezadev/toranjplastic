## Context

Per ADR 0004, `MediaModule` depends only on the stream-based `MediaStorage` interface and stores relative object keys in PostgreSQL. Strapi v5 uses `cms/config/plugins.ts` for its `upload` plugin.

## Architecture & Data Boundaries

- **Backend (`backend/src/media/storage/s3.storage.ts`):**
  - Uses `@aws-sdk/client-s3` (`S3Client`, `PutObjectCommand`, `GetObjectCommand`, `HeadObjectCommand`, `CopyObjectCommand`, `DeleteObjectCommand`, `HeadBucketCommand`, `ListObjectsV2Command`).
  - Buffers/streams upload through a `Transform` to compute `bytesWritten` and `checksumSha256` before/during `PutObject`, using `.tmp/<uuid>.part` as the temporary key.
  - Validates all keys with the same relative-path rules as `MountedDiskStorage` (no `..`, no leading `/`, no `\`, no control chars) and optionally prepends a normalized `keyPrefix` internally so callers and PostgreSQL never see provider-specific prefixes.
  - `finalize` checks that `temporaryKey` starts with `.tmp/`, `finalKey` does not already exist (`HeadObject`), copies `temporaryKey` -> `finalKey`, and deletes `temporaryKey`.
  - `checkReadiness` issues `HeadBucketCommand` and returns `false` on any error.
- **Backend config (`backend/src/config/environment.ts`):**
  - When `MEDIA_STORAGE_PROVIDER=s3`, `mediaRoot` is not required; instead `MEDIA_S3_BUCKET`, `MEDIA_S3_REGION`, `MEDIA_S3_ACCESS_KEY_ID`, `MEDIA_S3_SECRET_ACCESS_KEY` are required, and `MEDIA_S3_ENDPOINT` / `MEDIA_S3_FORCE_PATH_STYLE` / `MEDIA_S3_KEY_PREFIX` are optional.
- **CMS (`cms/config/plugins.ts`):**
  - When `STRAPI_UPLOAD_PROVIDER=aws-s3`, configures `@strapi/provider-upload-aws-s3` with `s3Options: { credentials, region, endpoint, forcePathStyle, params: { Bucket } }`.

## Security Controls

- Credentials (`ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`) are read only from environment variables and never logged, serialized into DTOs, or committed to Git.
- Public media URLs remain served through `backend` (`/api/v1/media/public/...`) or configured `STRAPI_MEDIA_ORIGIN` without exposing private bucket credentials.

## Test Strategy

- Unit tests in `backend/src/media/storage/s3.storage.spec.ts` (mocked `S3Client`) and `backend/src/config/environment.spec.ts`.
- Live S3 integration verification against a local MinIO container (`127.0.0.1:9000`).
