import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { IdentityService } from './identity.service.js';

const mobile = process.env.BOOTSTRAP_ADMIN_MOBILE;
const displayName = process.env.BOOTSTRAP_ADMIN_DISPLAY_NAME;
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

if (!mobile || !displayName || !password) throw new Error('Bootstrap environment is incomplete.');

const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
try {
  const result = await app.get(IdentityService).bootstrapAdmin(mobile, displayName, password);
  process.stdout.write(`Initial administrator created: ${result.id}\n`);
} finally {
  await app.close();
}
