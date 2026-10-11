import { describe, expect, it } from 'vitest';
import { loadEnvironment } from './environment.js';

describe('loadEnvironment', () => {
  it('returns secure local defaults', () => {
    expect(loadEnvironment({})).toEqual({
      port: 3001,
      frontendOrigin: 'http://localhost:3000',
      auth: { sessionDays: 7, loginLimit: 10, loginWindowSeconds: 900, cookieSecure: false },
    });
  });

  it.each(['0', '65536', 'abc'])('rejects invalid port %s', (port) => {
    expect(() => loadEnvironment({ BACKEND_PORT: port })).toThrow(
      'BACKEND_PORT',
    );
  });

  it('rejects an origin with a path', () => {
    expect(() =>
      loadEnvironment({ FRONTEND_ORIGIN: 'https://example.com/app' }),
    ).toThrow('FRONTEND_ORIGIN');
  });
});
