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
import { AdminProductController } from './products/product.controller.js';
import { AdminProductService } from './products/product.service.js';
import { ADMIN_PRODUCT_REPOSITORY } from './products/repository.js';
import { PrismaAdminProductRepository } from './products/prisma-product.repository.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [AdminCategoryController, AdminProductController, AdminContentController],
  providers: [
    AdminContentService,
    PrismaAdminContentRepository,
    PrismaAdminContentUnitOfWork,
    AdminCategoryService,
    PrismaAdminCategoryRepository,
    AdminProductService,
    PrismaAdminProductRepository,
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
    {
      provide: ADMIN_PRODUCT_REPOSITORY,
      useExisting: PrismaAdminProductRepository,
    },
  ],
})
export class AdminContentModule {}
