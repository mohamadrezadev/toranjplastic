import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { IdentityModule } from '../identity/identity.module.js';
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
import { AdminInjectionServiceController } from './injection-services/injection-service.controller.js';
import { AdminInjectionServiceService } from './injection-services/injection-service.service.js';
import { PrismaAdminInjectionServiceRepository } from './injection-services/prisma-injection-service.repository.js';
import { ADMIN_INJECTION_SERVICE_REPOSITORY } from './injection-services/repository.js';
import { AdminMaterialController } from './materials/material.controller.js';
import { AdminMaterialService } from './materials/material.service.js';
import { PrismaAdminMaterialRepository } from './materials/prisma-material.repository.js';
import { ADMIN_MATERIAL_REPOSITORY } from './materials/repository.js';
import { AdminArticleController } from './articles/article.controller.js';
import { AdminArticleService } from './articles/article.service.js';
import { PrismaAdminArticleRepository } from './articles/prisma-article.repository.js';
import { ADMIN_ARTICLE_REPOSITORY } from './articles/repository.js';
import { AdminManagedPageController } from './managed-pages/managed-page.controller.js';
import { AdminManagedPageService } from './managed-pages/managed-page.service.js';
import { PrismaAdminManagedPageRepository } from './managed-pages/prisma-managed-page.repository.js';
import { ADMIN_MANAGED_PAGE_REPOSITORY } from './managed-pages/repository.js';

@Module({
  imports: [DatabaseModule, IdentityModule],
  controllers: [
    AdminCategoryController,
    AdminProductController,
    AdminInjectionServiceController,
    AdminMaterialController,
    AdminArticleController,
    AdminManagedPageController,
  ],
  providers: [
    PrismaAdminContentUnitOfWork,
    AdminCategoryService,
    PrismaAdminCategoryRepository,
    AdminProductService,
    PrismaAdminProductRepository,
    AdminInjectionServiceService,
    PrismaAdminInjectionServiceRepository,
    AdminMaterialService,
    PrismaAdminMaterialRepository,
    AdminArticleService,
    PrismaAdminArticleRepository,
    AdminManagedPageService,
    PrismaAdminManagedPageRepository,
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
    {
      provide: ADMIN_INJECTION_SERVICE_REPOSITORY,
      useExisting: PrismaAdminInjectionServiceRepository,
    },
    {
      provide: ADMIN_MATERIAL_REPOSITORY,
      useExisting: PrismaAdminMaterialRepository,
    },
    {
      provide: ADMIN_ARTICLE_REPOSITORY,
      useExisting: PrismaAdminArticleRepository,
    },
    {
      provide: ADMIN_MANAGED_PAGE_REPOSITORY,
      useExisting: PrismaAdminManagedPageRepository,
    },
  ],
})
export class AdminContentModule {}
