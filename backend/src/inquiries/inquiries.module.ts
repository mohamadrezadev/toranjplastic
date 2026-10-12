import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module.js';
import { InquiryController } from './inquiry.controller.js';
import { INQUIRY_REPOSITORY } from './inquiry.repository.js';
import { InquiryService } from './inquiry.service.js';
import { PrismaInquiryRepository } from './prisma-inquiry.repository.js';

@Module({
  imports: [IdentityModule],
  controllers: [InquiryController],
  providers: [InquiryService, { provide: INQUIRY_REPOSITORY, useClass: PrismaInquiryRepository }],
})
export class InquiriesModule {}
