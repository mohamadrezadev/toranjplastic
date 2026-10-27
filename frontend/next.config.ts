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

const publicMediaOrigin = process.env.MEDIA_PUBLIC_ORIGIN ?? "http://localhost:3001";
let mediaProtocol: "http" | "https" = "http";
let mediaHostname = "localhost";
let mediaPort: string | undefined = "3001";

try {
  const parsed = new URL(publicMediaOrigin);
  mediaProtocol = parsed.protocol.startsWith("https") ? "https" : "http";
  mediaHostname = parsed.hostname;
  mediaPort = parsed.port || undefined;
} catch {
  // fallback to defaults
}

const strapiMediaOrigin = process.env.STRAPI_MEDIA_ORIGIN ?? process.env.STRAPI_API_URL ?? "http://localhost:1337";
let strapiProtocol: "http" | "https" = "http";
let strapiHostname = "localhost";
let strapiPort: string | undefined = "1337";

try {
  const parsedStrapi = new URL(strapiMediaOrigin);
  strapiProtocol = parsedStrapi.protocol.startsWith("https") ? "https" : "http";
  strapiHostname = parsedStrapi.hostname;
  strapiPort = parsedStrapi.port || undefined;
} catch {
  // fallback to defaults
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: mediaProtocol,
        hostname: mediaHostname,
        ...(mediaPort ? { port: mediaPort } : {}),
        pathname: "/api/v1/media/public/**",
      },
      {
        protocol: strapiProtocol,
        hostname: strapiHostname,
        ...(strapiPort ? { port: strapiPort } : {}),
        pathname: "/uploads/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: serverActionBodySizeLimit,
    },
  },
};

export default nextConfig;
