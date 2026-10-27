export default ({ env }: { env: any }) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtSecret = env('STRAPI_ADMIN_JWT_SECRET', env('ADMIN_JWT_SECRET', isProduction ? '' : 'admin_jwt_secret_dev'));
  const apiTokenSalt = env('STRAPI_API_TOKEN_SALT', env('API_TOKEN_SALT', isProduction ? '' : 'api_token_salt_dev'));
  const transferTokenSalt = env('STRAPI_TRANSFER_TOKEN_SALT', env('TRANSFER_TOKEN_SALT', isProduction ? '' : 'transfer_token_salt_dev'));

  if (isProduction) {
    if (!jwtSecret || jwtSecret === 'admin_jwt_secret_dev' || jwtSecret === 'toranj_strapi_admin_jwt_secret') {
      throw new Error('[Security Error] In production, STRAPI_ADMIN_JWT_SECRET must be explicitly set with a secure value.');
    }
    if (!apiTokenSalt || apiTokenSalt === 'api_token_salt_dev' || apiTokenSalt === 'toranj_strapi_api_token_salt') {
      throw new Error('[Security Error] In production, STRAPI_API_TOKEN_SALT must be explicitly set with a secure value.');
    }
    if (!transferTokenSalt || transferTokenSalt === 'transfer_token_salt_dev' || transferTokenSalt === 'toranj_strapi_transfer_token_salt') {
      throw new Error('[Security Error] In production, STRAPI_TRANSFER_TOKEN_SALT must be explicitly set with a secure value.');
    }
  }

  return {
    auth: {
      secret: jwtSecret,
    },
    apiToken: {
      salt: apiTokenSalt,
    },
    transfer: {
      token: {
        salt: transferTokenSalt,
      },
    },
  };
};
