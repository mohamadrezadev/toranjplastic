import type { ContentStatus } from '../generated/prisma/enums.js';
import type {
  AdminArticle,
  AdminCategory,
  AdminInjectionService,
  AdminListQuery,
  AdminManagedPage,
  AdminMaterial,
  AdminProduct,
  AdminProductListQuery,
  ArticleWriteInput,
  CategoryWriteInput,
  InjectionServiceWriteInput,
  ManagedPageWriteInput,
  MaterialWriteInput,
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

  listInjectionServices(request: AdminListQuery): Promise<PageResult<AdminInjectionService>>;
  getInjectionService(id: string): Promise<AdminInjectionService | null>;
  createInjectionService(input: InjectionServiceWriteInput): Promise<AdminInjectionService>;
  updateInjectionService(id: string, input: Partial<InjectionServiceWriteInput>): Promise<AdminInjectionService | null>;
  setInjectionServiceStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminInjectionService | null>;

  listMaterials(request: AdminListQuery): Promise<PageResult<AdminMaterial>>;
  getMaterial(id: string): Promise<AdminMaterial | null>;
  createMaterial(input: MaterialWriteInput): Promise<AdminMaterial>;
  updateMaterial(id: string, input: Partial<MaterialWriteInput>): Promise<AdminMaterial | null>;
  setMaterialStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminMaterial | null>;

  listArticles(request: AdminListQuery): Promise<PageResult<AdminArticle>>;
  getArticle(id: string): Promise<AdminArticle | null>;
  createArticle(input: ArticleWriteInput): Promise<AdminArticle>;
  updateArticle(id: string, input: Partial<ArticleWriteInput>): Promise<AdminArticle | null>;
  setArticleStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminArticle | null>;

  listManagedPages(request: AdminListQuery): Promise<PageResult<AdminManagedPage>>;
  getManagedPage(id: string): Promise<AdminManagedPage | null>;
  createManagedPage(input: ManagedPageWriteInput): Promise<AdminManagedPage>;
  updateManagedPage(id: string, input: Partial<ManagedPageWriteInput>): Promise<AdminManagedPage | null>;
  setManagedPageStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminManagedPage | null>;
}
