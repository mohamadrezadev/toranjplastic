import { Inject, Injectable } from '@nestjs/common';
import type { AppEnvironment } from '../config/environment.js';
import { PrismaService } from '../database/prisma.service.js';
import { MEDIA_CONFIG } from '../media/media.tokens.js';
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
import { PrismaContentMediaTransaction } from './content-media.transaction.js';

/* v8 ignore next */
@Injectable()
export class PrismaAdminContentUnitOfWork implements AdminContentUnitOfWork {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(MEDIA_CONFIG)
    private readonly mediaConfig: Pick<AppEnvironment['media'], 'publicOrigin'>,
  ) {}

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
        media: new PrismaContentMediaTransaction(client, this.mediaConfig.publicOrigin),
      });
    });
  }
}
