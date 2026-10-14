import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { InquiryController } from './inquiry.controller.js';
import { INQUIRY_REPOSITORY } from './inquiry.repository.js';
import { InquiryService } from './inquiry.service.js';
import { PrismaInquiryRepository } from './prisma-inquiry.repository.js';
import { AdminInquiryController } from './admin/admin-inquiry.controller.js';
import { AdminInquiryService } from './admin/admin-inquiry.service.js';

@Module({
  imports: [IdentityModule],
  controllers: [InquiryController, AdminInquiryController],
  providers: [InquiryService, AdminInquiryService, { provide: INQUIRY_REPOSITORY, useClass: PrismaInquiryRepository }],
})
export class InquiriesModule {}
