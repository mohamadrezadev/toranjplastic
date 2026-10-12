import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { PrismaAdminContentRepository } from '../prisma-admin-content.repository.js';
import type { AdminCategoryRepository } from './repository.js';
import type { CategoryWriteInput } from './types.js';
import type { AdminListQuery } from '../shared/types.js';
import type { ContentStatus } from '../../generated/prisma/enums.js';

@Injectable()
export class PrismaAdminCategoryRepository implements AdminCategoryRepository {
  private readonly delegate: PrismaAdminContentRepository;

  constructor(prisma: PrismaService) {
    this.delegate = new PrismaAdminContentRepository(prisma);
  }

  list(request: AdminListQuery) { return this.delegate.listCategories(request); }
  get(id: string) { return this.delegate.getCategory(id); }
  create(input: CategoryWriteInput) { return this.delegate.createCategory(input); }
  update(id: string, input: Partial<CategoryWriteInput>) { return this.delegate.updateCategory(id, input); }
  setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    return this.delegate.setCategoryStatus(id, status, publishedAt);
  }
}
