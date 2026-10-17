import { Module } from '@nestjs/common';
import { AdminContentModule } from './admin-content/admin-content.module.js';
import { ContentModule } from './content/content.module.js';
import { HealthModule } from './health/health.module.js';
import { IdentityModule } from './identity/identity.module.js';
import { InquiriesModule } from './inquiries/inquiries.module.js';
import { QuotationsModule } from './quotations/quotations.module.js';

@Module({
  imports: [
    HealthModule,
    ContentModule,
    IdentityModule,
    AdminContentModule,
    InquiriesModule,
    QuotationsModule,
  ],
})
export class AppModule {}
