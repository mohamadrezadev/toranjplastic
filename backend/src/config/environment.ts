export interface AppEnvironment {
  port: number;
  frontendOrigin: string;
  auth: {
    sessionDays: number;
    loginLimit: number;
    loginWindowSeconds: number;
    cookieSecure: boolean;
  };
}

function boundedInteger(value: string | undefined, fallback: number, name: string, minimum: number, maximum: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return parsed;
}

export function loadEnvironment(
  environment: NodeJS.ProcessEnv,
): AppEnvironment {
  const rawPort = environment.BACKEND_PORT ?? environment.PORT ?? '3001';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('BACKEND_PORT must be an integer between 1 and 65535.');
  }

  const frontendOrigin = environment.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  const parsedOrigin = new URL(frontendOrigin);

  if (!['http:', 'https:'].includes(parsedOrigin.protocol)) {
    throw new Error('FRONTEND_ORIGIN must use http or https.');
  }

  if (parsedOrigin.origin !== frontendOrigin) {
    throw new Error('FRONTEND_ORIGIN must be an origin without a path.');
  }

  const secureValue = environment.AUTH_COOKIE_SECURE ?? (environment.NODE_ENV === 'production' ? 'true' : 'false');
  if (!['true', 'false'].includes(secureValue)) throw new Error('AUTH_COOKIE_SECURE must be true or false.');

  return {
    port,
    frontendOrigin,
    auth: {
      sessionDays: boundedInteger(environment.AUTH_SESSION_DAYS, 7, 'AUTH_SESSION_DAYS', 1, 30),
      loginLimit: boundedInteger(environment.AUTH_LOGIN_LIMIT, 10, 'AUTH_LOGIN_LIMIT', 1, 100),
      loginWindowSeconds: boundedInteger(environment.AUTH_LOGIN_WINDOW_SECONDS, 900, 'AUTH_LOGIN_WINDOW_SECONDS', 60, 86_400),
      cookieSecure: secureValue === 'true',
    },
  };
}
