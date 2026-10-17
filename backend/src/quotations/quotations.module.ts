import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { AdminQuotationsController } from './admin-quotations.controller.js';
import { CustomerQuotationsController } from './customer-quotations.controller.js';
import { QuotationPdfService } from './quotation-pdf.service.js';
import { QuotationsService } from './quotations.service.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [AdminQuotationsController, CustomerQuotationsController],
  providers: [QuotationsService, QuotationPdfService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
