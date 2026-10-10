import { type INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import type { AppEnvironment } from './config/environment.js';

export function configureApp(
  app: INestApplication,
  environment: AppEnvironment,
): void {
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: environment.frontendOrigin,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}
