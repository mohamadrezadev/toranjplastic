import { Module } from '@nestjs/common';
import { ContentModule } from './content/content.module.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';

@Module({
  imports: [HealthModule, ContentModule, IdentityModule],
})
export class AppModule {}
