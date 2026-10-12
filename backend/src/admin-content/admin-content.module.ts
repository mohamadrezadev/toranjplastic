import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { ADMIN_CONTENT_REPOSITORY } from './admin-content.repository.js';
import { AdminContentController } from './admin-content.controller.js';
import { AdminContentService } from './admin-content.service.js';
import { PrismaAdminContentRepository } from './prisma-admin-content.repository.js';
import { PrismaAdminContentUnitOfWork } from './prisma-admin-content.unit-of-work.js';
import { ADMIN_CONTENT_UNIT_OF_WORK } from './unit-of-work.js';
import { AdminCategoryController } from './categories/category.controller.js';
import { AdminCategoryService } from './categories/category.service.js';
import { ADMIN_CATEGORY_REPOSITORY } from './categories/repository.js';
import { PrismaAdminCategoryRepository } from './categories/prisma-category.repository.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [AdminCategoryController, AdminContentController],
  providers: [
    AdminContentService,
    PrismaAdminContentRepository,
    PrismaAdminContentUnitOfWork,
    AdminCategoryService,
    PrismaAdminCategoryRepository,
    {
      provide: ADMIN_CONTENT_REPOSITORY,
      useExisting: PrismaAdminContentRepository,
    },
    {
      provide: ADMIN_CONTENT_UNIT_OF_WORK,
      useExisting: PrismaAdminContentUnitOfWork,
    },
    {
      provide: ADMIN_CATEGORY_REPOSITORY,
      useExisting: PrismaAdminCategoryRepository,
    },
  ],
})
export class AdminContentModule {}
