type EnvReader = (key: string, defaultValue?: string) => string;

export default ({ env }: { env: EnvReader }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = env('STRAPI_JWT_SECRET', isProduction ? '' : 'jwt_secret_dev');

  if (isProduction && (!jwtSecret || jwtSecret === 'jwt_secret_dev')) {
    throw new Error('[Security Error] In production, STRAPI_JWT_SECRET must be explicitly set.');
  }

  return {
    'users-permissions': {
      config: {
        jwtSecret,
      },
    },
    upload: {
      config: {
        provider: 'local',
        sizeLimit: 10 * 1024 * 1024,
      },
    },
  };
};
