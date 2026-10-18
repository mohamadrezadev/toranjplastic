import type { NextConfig } from "next";

const DEFAULT_MEDIA_MAX_UPLOAD_BYTES = 10_485_760;
const MULTIPART_OVERHEAD_BYTES = 1_048_576;

function positiveInteger(name: string, value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer number of bytes.`);
  }
  return parsed;
}

const mediaMaxUploadBytes = positiveInteger(
  "MEDIA_MAX_UPLOAD_BYTES",
  process.env.MEDIA_MAX_UPLOAD_BYTES,
  DEFAULT_MEDIA_MAX_UPLOAD_BYTES,
);
const serverActionBodySizeLimit = positiveInteger(
  "MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES",
  process.env.MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES,
  mediaMaxUploadBytes + MULTIPART_OVERHEAD_BYTES,
);

if (serverActionBodySizeLimit <= mediaMaxUploadBytes) {
  throw new Error(
    "MEDIA_SERVER_ACTION_BODY_SIZE_LIMIT_BYTES must be greater than MEDIA_MAX_UPLOAD_BYTES to allow multipart overhead.",
  );
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      bodySizeLimit: serverActionBodySizeLimit,
    },
  },
};

export default nextConfig;
