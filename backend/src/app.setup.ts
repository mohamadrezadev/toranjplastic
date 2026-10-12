import { type INestApplication, ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import type { AppEnvironment } from './config/environment.js';

export function configureApp(
  app: INestApplication,
  environment: AppEnvironment,
): void {
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (request.path.startsWith('/api/v1/auth') || request.path.startsWith('/api/v1/admin') || request.path.startsWith('/api/v1/inquiries')) {
      response.setHeader('Cache-Control', 'no-store');
    }
    next();
  });
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
