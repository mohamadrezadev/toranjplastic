export interface AppEnvironment {
  port: number;
  frontendOrigin: string;
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

  return { port, frontendOrigin };
}
