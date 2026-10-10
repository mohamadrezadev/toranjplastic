import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { loadEnvironment } from './config/environment.js';

async function bootstrap() {
  const environment = loadEnvironment(process.env);
  const app = await NestFactory.create(AppModule);
  configureApp(app, environment);
  await app.listen(environment.port, '0.0.0.0');
}
await bootstrap();
