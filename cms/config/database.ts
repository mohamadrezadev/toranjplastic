export default ({ env }: { env: any }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('STRAPI_DATABASE_HOST', 'localhost'),
      port: env.int('STRAPI_DATABASE_PORT', 5433),
      database: env('STRAPI_DATABASE_NAME', 'toranj_strapi'),
      user: env('STRAPI_DATABASE_USERNAME', 'toranj'),
      password: env('STRAPI_DATABASE_PASSWORD', 'change-me-locally'),
      ssl: env.bool('STRAPI_DATABASE_SSL', false),
    },
    useNullAsDefault: true,
  },
});
