import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import type { ContentStatus } from '../../generated/prisma/enums.js';
import { PrismaAdminContentRepository } from '../prisma-admin-content.repository.js';
import type { AdminProductRepository } from './repository.js';
import type { AdminProductListQuery, ProductWriteInput } from './types.js';

@Injectable()
export class PrismaAdminProductRepository implements AdminProductRepository {
  private readonly delegate: PrismaAdminContentRepository;

  constructor(prisma: PrismaService) {
    this.delegate = new PrismaAdminContentRepository(prisma);
  }

  list(request: AdminProductListQuery) {
    return this.delegate.listProducts(request);
  }
  get(id: string) {
    return this.delegate.getProduct(id);
  }
  create(input: ProductWriteInput) {
    return this.delegate.createProduct(input);
  }
  update(id: string, input: Partial<ProductWriteInput>) {
    return this.delegate.updateProduct(id, input);
  }
  setStatus(id: string, status: ContentStatus, publishedAt: Date | null) {
    return this.delegate.setProductStatus(id, status, publishedAt);
  }
}
