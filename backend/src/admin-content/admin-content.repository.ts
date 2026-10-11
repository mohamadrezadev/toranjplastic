import type { ContentStatus } from '../generated/prisma/enums.js';
import type {
  AdminCategory,
  AdminListQuery,
  AdminProduct,
  AdminProductListQuery,
  CategoryWriteInput,
  PageResult,
  ProductWriteInput,
} from './admin-content.types.js';

export const ADMIN_CONTENT_REPOSITORY = Symbol('ADMIN_CONTENT_REPOSITORY');

export interface AdminContentRepository {
  listCategories(request: AdminListQuery): Promise<PageResult<AdminCategory>>;
  getCategory(id: string): Promise<AdminCategory | null>;
  createCategory(input: CategoryWriteInput): Promise<AdminCategory>;
  updateCategory(id: string, input: Partial<CategoryWriteInput>): Promise<AdminCategory | null>;
  setCategoryStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminCategory | null>;

  listProducts(request: AdminProductListQuery): Promise<PageResult<AdminProduct>>;
  getProduct(id: string): Promise<AdminProduct | null>;
  createProduct(input: ProductWriteInput): Promise<AdminProduct>;
  updateProduct(id: string, input: Partial<ProductWriteInput>): Promise<AdminProduct | null>;
  setProductStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminProduct | null>;
}
