## 1. Dependencies and Configuration

- [x] 1.1 Install `@aws-sdk/client-s3` in `backend/` and `@strapi/provider-upload-aws-s3` in `cms/`.
- [x] 1.2 Extend `backend/src/config/environment.ts` and `backend/src/config/environment.spec.ts` to support `MEDIA_STORAGE_PROVIDER=s3` and S3 environment variables.

## 2. Backend S3MediaStorage Implementation

- [x] 2.1 Implement `S3MediaStorage` in `backend/src/media/storage/s3.storage.ts` conforming to `MediaStorage`.
- [x] 2.2 Wire `MediaModule` in `backend/src/media/media.module.ts` to instantiate `S3MediaStorage` when `storageProvider === 's3'` and `MountedDiskStorage` otherwise.
- [x] 2.3 Add unit tests in `backend/src/media/storage/s3.storage.spec.ts` covering lifecycle, unsafe keys, readiness, cleanup, and checksums.

## 3. Strapi S3 Provider and Documentation

- [x] 3.1 Update `cms/config/plugins.ts` (and `cms/config/middlewares.ts` if needed) to support `STRAPI_UPLOAD_PROVIDER=aws-s3` with `local` fallback.
- [x] 3.2 Update `.env.example` and `docs/runbooks/runflare-deployment.md` with S3 configuration variables.

## 4. Verification against Local S3 Container (MinIO)

- [x] 4.1 Start a local MinIO S3 container (`127.0.0.1:9000`), create test buckets, and verify `S3MediaStorage` + `backend` + `cms` against it.
- [x] 4.2 Run `pnpm --filter backend lint`, `pnpm --filter backend typecheck`, `pnpm --filter backend test`, `pnpm --filter cms test`, and `pnpm build:cms`.
