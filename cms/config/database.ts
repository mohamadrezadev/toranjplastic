export default ({ env }: { env: any }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const password = env('STRAPI_DATABASE_PASSWORD', env('DATABASE_PASSWORD', isProduction ? '' : 'change-me-locally'));

  if (isProduction) {
    if (!password || password === 'change-me-locally') {
      throw new Error('[Security Error] In production, STRAPI_DATABASE_PASSWORD must be explicitly set with a secure value.');
    }
  }

  return {
    connection: {
      client: env('STRAPI_DATABASE_CLIENT', env('DATABASE_CLIENT', 'postgres')),
      connection: {
        host: env('STRAPI_DATABASE_HOST', env('DATABASE_HOST', 'localhost')),
        port: env.int('STRAPI_DATABASE_PORT', env.int('DATABASE_PORT', 5433)),
        database: env('STRAPI_DATABASE_NAME', env('DATABASE_NAME', 'toranj_strapi')),
        user: env('STRAPI_DATABASE_USERNAME', env('DATABASE_USERNAME', 'toranj')),
        password,
        ssl: env.bool('STRAPI_DATABASE_SSL', env.bool('DATABASE_SSL', false)),
      },
      useNullAsDefault: true,
    },
  };
};
