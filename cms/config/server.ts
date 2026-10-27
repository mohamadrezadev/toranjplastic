export default ({ env }: { env: any }) => ({
  host: env('STRAPI_HOST', '0.0.0.0'),
  port: env.int('STRAPI_PORT', 1337),
  url: env('STRAPI_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('STRAPI_APP_KEYS', ['key1', 'key2']),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
