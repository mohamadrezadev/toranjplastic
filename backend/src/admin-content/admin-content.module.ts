import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { ADMIN_CONTENT_REPOSITORY } from './admin-content.repository.js';
import { AdminContentController } from './admin-content.controller.js';
import { AdminContentService } from './admin-content.service.js';
import { PrismaAdminContentRepository } from './prisma-admin-content.repository.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [AdminContentController],
  providers: [
    AdminContentService,
    PrismaAdminContentRepository,
    {
      provide: ADMIN_CONTENT_REPOSITORY,
      useExisting: PrismaAdminContentRepository,
    },
  ],
})
export class AdminContentModule {}
