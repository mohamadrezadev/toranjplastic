import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { PrismaAdminArticleRepository } from './articles/prisma-article.repository.js';
import { PrismaAdminCategoryRepository } from './categories/prisma-category.repository.js';
import { PrismaAdminInjectionServiceRepository } from './injection-services/prisma-injection-service.repository.js';
import { PrismaAdminManagedPageRepository } from './managed-pages/prisma-managed-page.repository.js';
import { PrismaAdminMaterialRepository } from './materials/prisma-material.repository.js';
import { PrismaAdminProductRepository } from './products/prisma-product.repository.js';
import type {
  AdminContentTransaction,
  AdminContentUnitOfWork,
} from './unit-of-work.js';

/* v8 ignore next */
@Injectable()
export class PrismaAdminContentUnitOfWork implements AdminContentUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  run<T>(
    work: (transaction: AdminContentTransaction) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (client) => {
      return work({
        categories: new PrismaAdminCategoryRepository(client),
        products: new PrismaAdminProductRepository(client),
        injectionServices: new PrismaAdminInjectionServiceRepository(client),
        materials: new PrismaAdminMaterialRepository(client),
        articles: new PrismaAdminArticleRepository(client),
        managedPages: new PrismaAdminManagedPageRepository(client),
        audit: client,
      });
    });
  }
}
