export default ({ env }: { env: any }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const keys = env.array('STRAPI_APP_KEYS', env.array('APP_KEYS', isProduction ? [] : ['key1', 'key2']));

  if (isProduction) {
    if (!keys || keys.length === 0 || keys.some((k: string) => !k || k === 'key1' || k === 'key2' || k.includes('change-me'))) {
      throw new Error(
        '[Security Error] In production, STRAPI_APP_KEYS (or APP_KEYS) must be explicitly provided with secure, non-default keys.'
      );
    }
  }

  return {
    host: env('STRAPI_HOST', env('HOST', '0.0.0.0')),
    port: env.int('STRAPI_PORT', env.int('PORT', 1337)),
    url: env('STRAPI_URL', 'http://localhost:1337'),
    app: {
      keys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};
