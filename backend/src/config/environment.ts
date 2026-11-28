import { isAbsolute, parse, resolve } from 'node:path';

export type MediaStorageProvider = 'mounted-disk' | 's3';

export interface S3MediaConfig {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  keyPrefix?: string;
}

export interface AppEnvironment {
  port: number;
  frontendOrigin: string;
  auth: {
    sessionDays: number;
    loginLimit: number;
    loginWindowSeconds: number;
    cookieSecure: boolean;
  };
  media: {
    storageProvider: MediaStorageProvider;
    root: string;
    s3?: S3MediaConfig;
    publicOrigin: string;
    maxUploadBytes: number;
    maxPixels: number;
    minFreeBytes: number;
    maxProductImages: number;
    processingConcurrency: number;
    tempRetentionHours: number;
    unattachedRetentionDays: number;
  };
}

function boundedInteger(value: string | undefined, fallback: number, name: string, minimum: number, maximum: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return parsed;
}

function origin(value: string, name: string, requireHttps: boolean) {
  const parsed = new URL(value);
  const allowedProtocols = requireHttps ? ['https:'] : ['http:', 'https:'];
  if (!allowedProtocols.includes(parsed.protocol) || parsed.origin !== value) {
    throw new Error(`${name} must be an ${requireHttps ? 'https' : 'http or https'} origin without a path.`);
  }
  return value;
}

function mediaRoot(environment: NodeJS.ProcessEnv, requiredInProduction: boolean) {
  const configured = environment.MEDIA_ROOT;
  if (!configured && requiredInProduction && environment.NODE_ENV === 'production') {
    throw new Error('MEDIA_ROOT is required in production.');
  }

  const root = configured ?? resolve(process.cwd(), 'var', 'media');
  if (!isAbsolute(root) || parse(root).root === root) {
    throw new Error('MEDIA_ROOT must be an absolute non-root path.');
  }
  return resolve(root);
}

function requiredText(value: string | undefined, name: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} is required when MEDIA_STORAGE_PROVIDER=s3.`);
  }
  return trimmed;
}

function s3Config(environment: NodeJS.ProcessEnv): S3MediaConfig {
  const bucket = requiredText(environment.MEDIA_S3_BUCKET, 'MEDIA_S3_BUCKET');
  const accessKeyId = requiredText(environment.MEDIA_S3_ACCESS_KEY_ID, 'MEDIA_S3_ACCESS_KEY_ID');
  const secretAccessKey = requiredText(environment.MEDIA_S3_SECRET_ACCESS_KEY, 'MEDIA_S3_SECRET_ACCESS_KEY');
  const region = environment.MEDIA_S3_REGION?.trim() || 'us-east-1';

  const rawEndpoint = environment.MEDIA_S3_ENDPOINT?.trim();
  let endpoint: string | undefined;
  if (rawEndpoint) {
    const parsed = new URL(rawEndpoint);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('MEDIA_S3_ENDPOINT must be an http or https URL.');
    }
    endpoint = parsed.origin;
  }

  const rawForcePathStyle = environment.MEDIA_S3_FORCE_PATH_STYLE;
  if (rawForcePathStyle && !['true', 'false'].includes(rawForcePathStyle)) {
    throw new Error('MEDIA_S3_FORCE_PATH_STYLE must be true or false.');
  }
  const forcePathStyle = rawForcePathStyle ? rawForcePathStyle === 'true' : Boolean(endpoint);

  const rawPrefix = environment.MEDIA_S3_KEY_PREFIX?.trim().replace(/^\/+|\/+$/g, '');
  if (rawPrefix && (rawPrefix.includes('..') || rawPrefix.includes('\\'))) {
    throw new Error('MEDIA_S3_KEY_PREFIX must be a safe relative prefix.');
  }

  return {
    ...(endpoint ? { endpoint } : {}),
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    forcePathStyle,
    ...(rawPrefix ? { keyPrefix: rawPrefix } : {}),
  };
}

export function loadEnvironment(
  environment: NodeJS.ProcessEnv,
): AppEnvironment {
  const rawPort = environment.BACKEND_PORT ?? environment.PORT ?? '3001';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('BACKEND_PORT must be an integer between 1 and 65535.');
  }

  const frontendOrigin = origin(
    environment.FRONTEND_ORIGIN ?? 'http://localhost:3000',
    'FRONTEND_ORIGIN',
    false,
  );

  const secureValue = environment.AUTH_COOKIE_SECURE ?? (environment.NODE_ENV === 'production' ? 'true' : 'false');
  if (!['true', 'false'].includes(secureValue)) throw new Error('AUTH_COOKIE_SECURE must be true or false.');

  const storageProvider = environment.MEDIA_STORAGE_PROVIDER ?? 'mounted-disk';
  if (storageProvider !== 'mounted-disk' && storageProvider !== 's3') {
    throw new Error('MEDIA_STORAGE_PROVIDER must be mounted-disk or s3.');
  }

  const root = mediaRoot(environment, storageProvider === 'mounted-disk');
  const s3 = storageProvider === 's3' ? s3Config(environment) : undefined;
  const publicOrigin = origin(
    environment.MEDIA_PUBLIC_ORIGIN ?? 'http://localhost:3001',
    'MEDIA_PUBLIC_ORIGIN',
    environment.NODE_ENV === 'production',
  );

  return {
    port,
    frontendOrigin,
    auth: {
      sessionDays: boundedInteger(environment.AUTH_SESSION_DAYS, 7, 'AUTH_SESSION_DAYS', 1, 30),
      loginLimit: boundedInteger(environment.AUTH_LOGIN_LIMIT, 10, 'AUTH_LOGIN_LIMIT', 1, 100),
      loginWindowSeconds: boundedInteger(environment.AUTH_LOGIN_WINDOW_SECONDS, 900, 'AUTH_LOGIN_WINDOW_SECONDS', 60, 86_400),
      cookieSecure: secureValue === 'true',
    },
    media: {
      storageProvider,
      root,
      ...(s3 ? { s3 } : {}),
      publicOrigin,
      maxUploadBytes: boundedInteger(environment.MEDIA_MAX_UPLOAD_BYTES, 10_485_760, 'MEDIA_MAX_UPLOAD_BYTES', 1_048_576, 26_214_400),
      maxPixels: boundedInteger(environment.MEDIA_MAX_PIXELS, 20_000_000, 'MEDIA_MAX_PIXELS', 1_000_000, 40_000_000),
      minFreeBytes: boundedInteger(environment.MEDIA_MIN_FREE_BYTES, 1_073_741_824, 'MEDIA_MIN_FREE_BYTES', 1_048_576, 1_099_511_627_776),
      maxProductImages: boundedInteger(environment.MEDIA_MAX_PRODUCT_IMAGES, 6, 'MEDIA_MAX_PRODUCT_IMAGES', 1, 6),
      processingConcurrency: boundedInteger(environment.MEDIA_PROCESSING_CONCURRENCY, 2, 'MEDIA_PROCESSING_CONCURRENCY', 1, 4),
      tempRetentionHours: boundedInteger(environment.MEDIA_TEMP_RETENTION_HOURS, 24, 'MEDIA_TEMP_RETENTION_HOURS', 1, 168),
      unattachedRetentionDays: boundedInteger(environment.MEDIA_UNATTACHED_RETENTION_DAYS, 30, 'MEDIA_UNATTACHED_RETENTION_DAYS', 1, 365),
    },
  };
}
