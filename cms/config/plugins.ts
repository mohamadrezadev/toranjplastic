type EnvReader = (key: string, defaultValue?: string) => string;

export default ({ env }: { env: EnvReader }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = env('STRAPI_JWT_SECRET', isProduction ? '' : 'jwt_secret_dev');

  if (isProduction && (!jwtSecret || jwtSecret === 'jwt_secret_dev')) {
    throw new Error('[Security Error] In production, STRAPI_JWT_SECRET must be explicitly set.');
  }

  const uploadProvider = env('STRAPI_UPLOAD_PROVIDER', 'local');
  const uploadConfig =
    uploadProvider === 'aws-s3'
      ? {
          provider: '@strapi/provider-upload-aws-s3',
          providerOptions: {
            s3Options: {
              credentials: {
                accessKeyId: env('STRAPI_S3_ACCESS_KEY_ID', ''),
                secretAccessKey: env('STRAPI_S3_SECRET_ACCESS_KEY', ''),
              },
              region: env('STRAPI_S3_REGION', 'us-east-1'),
              endpoint: env('STRAPI_S3_ENDPOINT', '') || undefined,
              forcePathStyle: env('STRAPI_S3_FORCE_PATH_STYLE', 'true') === 'true',
              params: {
                Bucket: env('STRAPI_S3_BUCKET', ''),
              },
            },
          },
          sizeLimit: 10 * 1024 * 1024,
        }
      : {
          provider: 'local',
          sizeLimit: 10 * 1024 * 1024,
        };

  return {
    'users-permissions': {
      config: {
        jwtSecret,
      },
    },
    upload: {
      config: uploadConfig,
    },
  };
};
