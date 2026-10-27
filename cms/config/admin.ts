export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('STRAPI_ADMIN_JWT_SECRET', 'admin_jwt_secret_dev'),
  },
  apiToken: {
    salt: env('STRAPI_API_TOKEN_SALT', 'api_token_salt_dev'),
  },
  transfer: {
    token: {
      salt: env('STRAPI_TRANSFER_TOKEN_SALT', 'transfer_token_salt_dev'),
    },
  },
});
