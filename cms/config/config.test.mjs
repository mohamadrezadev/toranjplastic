import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import serverConfig from './server.ts';
import adminConfig from './admin.ts';
import databaseConfig from './database.ts';

// Mock Strapi env helper
function createMockEnv(envMap = {}) {
  const envFn = (key, defaultVal) => {
    if (key in envMap) return envMap[key];
    return defaultVal;
  };
  envFn.int = (key, defaultVal) => {
    if (key in envMap) return Number(envMap[key]);
    return defaultVal;
  };
  envFn.bool = (key, defaultVal) => {
    if (key in envMap) return String(envMap[key]) === 'true';
    return defaultVal;
  };
  envFn.array = (key, defaultVal) => {
    if (key in envMap) {
      const val = envMap[key];
      return Array.isArray(val) ? val : String(val).split(',').map((s) => s.trim());
    }
    return defaultVal;
  };
  return envFn;
}

describe('Strapi Config Security Guards', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  it('allows default values in development mode', () => {
    process.env.NODE_ENV = 'development';

    const env = createMockEnv({});
    const server = serverConfig({ env });
    assert.deepStrictEqual(server.app.keys, ['key1', 'key2']);

    const admin = adminConfig({ env });
    assert.strictEqual(admin.auth.secret, 'admin_jwt_secret_dev');
    assert.strictEqual(admin.apiToken.salt, 'api_token_salt_dev');
    assert.strictEqual(admin.transfer.token.salt, 'transfer_token_salt_dev');

    const db = databaseConfig({ env });
    assert.strictEqual(db.connection.connection.password, 'change-me-locally');
  });

  it('throws in production if STRAPI_APP_KEYS is missing or default', () => {
    process.env.NODE_ENV = 'production';

    // Missing
    assert.throws(
      () => serverConfig({ env: createMockEnv({}) }),
      /\[Security Error\] In production, STRAPI_APP_KEYS/
    );

    // Default 'key1'
    assert.throws(
      () => serverConfig({ env: createMockEnv({ STRAPI_APP_KEYS: ['key1', 'key2'] }) }),
      /\[Security Error\] In production, STRAPI_APP_KEYS/
    );
  });

  it('throws in production if admin secrets are missing or default', () => {
    process.env.NODE_ENV = 'production';

    // Missing admin secrets
    assert.throws(
      () => adminConfig({ env: createMockEnv({}) }),
      /\[Security Error\] In production, STRAPI_ADMIN_JWT_SECRET/
    );

    // Default admin secret
    assert.throws(
      () => adminConfig({ env: createMockEnv({ STRAPI_ADMIN_JWT_SECRET: 'admin_jwt_secret_dev' }) }),
      /\[Security Error\] In production, STRAPI_ADMIN_JWT_SECRET/
    );

    // Default salt
    assert.throws(
      () =>
        adminConfig({
          env: createMockEnv({
            STRAPI_ADMIN_JWT_SECRET: 'super-secure-admin-secret-at-least-32-chars',
            STRAPI_API_TOKEN_SALT: 'api_token_salt_dev',
          }),
        }),
      /\[Security Error\] In production, STRAPI_API_TOKEN_SALT/
    );
  });

  it('throws in production if database password is missing or default', () => {
    process.env.NODE_ENV = 'production';

    // Missing password
    assert.throws(
      () => databaseConfig({ env: createMockEnv({}) }),
      /\[Security Error\] In production, STRAPI_DATABASE_PASSWORD/
    );

    // Default password
    assert.throws(
      () => databaseConfig({ env: createMockEnv({ STRAPI_DATABASE_PASSWORD: 'change-me-locally' }) }),
      /\[Security Error\] In production, STRAPI_DATABASE_PASSWORD/
    );
  });

  it('boots cleanly in production when all secrets are securely provided', () => {
    process.env.NODE_ENV = 'production';

    const env = createMockEnv({
      STRAPI_APP_KEYS: 'custom-secret-key-1,custom-secret-key-2',
      STRAPI_ADMIN_JWT_SECRET: 'custom-prod-admin-jwt-secret-xyz',
      STRAPI_API_TOKEN_SALT: 'custom-prod-api-token-salt-xyz',
      STRAPI_TRANSFER_TOKEN_SALT: 'custom-prod-transfer-salt-xyz',
      STRAPI_DATABASE_PASSWORD: 'strong-production-db-password-1234',
    });

    const server = serverConfig({ env });
    assert.strictEqual(server.app.keys.length, 2);
    assert.strictEqual(server.app.keys[0], 'custom-secret-key-1');

    const admin = adminConfig({ env });
    assert.strictEqual(admin.auth.secret, 'custom-prod-admin-jwt-secret-xyz');
    assert.strictEqual(admin.apiToken.salt, 'custom-prod-api-token-salt-xyz');

    const db = databaseConfig({ env });
    assert.strictEqual(db.connection.connection.password, 'strong-production-db-password-1234');
  });

  // Restore
  process.env.NODE_ENV = originalNodeEnv;
});
