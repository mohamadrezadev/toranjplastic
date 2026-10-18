import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { PageResult } from '../shared/types.js';
import type {
  AdminProduct,
  AdminProductListQuery,
  ProductWriteInput,
} from './types.js';
export const ADMIN_PRODUCT_REPOSITORY = Symbol('ADMIN_PRODUCT_REPOSITORY');
export interface AdminProductRepository {
  list(request: AdminProductListQuery): Promise<PageResult<AdminProduct>>;
  get(id: string): Promise<AdminProduct | null>;
  create(input: ProductWriteInput): Promise<AdminProduct>;
  update(
    id: string,
    input: Partial<ProductWriteInput>,
    expectedVersion?: number,
  ): Promise<AdminProduct | null>;
  setStatus(
    id: string,
    status: ContentStatus,
    publishedAt: Date | null,
  ): Promise<AdminProduct | null>;
}
