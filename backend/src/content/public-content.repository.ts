import type {
  PageRequest,
  PageResult,
  ProductPageRequest,
  PublicArticle,
  PublicCategory,
  PublicInjectionService,
  PublicManagedPage,
  PublicMaterial,
  PublicProduct,
} from './content.types.js';

export const PUBLIC_CONTENT_REPOSITORY = Symbol('PUBLIC_CONTENT_REPOSITORY');

export interface PublicContentRepository {
  listCategories(request: PageRequest): Promise<PageResult<PublicCategory>>;
  listProducts(request: ProductPageRequest): Promise<PageResult<PublicProduct>>;
  findProduct(slug: string): Promise<PublicProduct | null>;
  listServices(request: PageRequest): Promise<PageResult<PublicInjectionService>>;
  findService(slug: string): Promise<PublicInjectionService | null>;
  listMaterials(request: PageRequest): Promise<PageResult<PublicMaterial>>;
  findMaterial(slug: string): Promise<PublicMaterial | null>;
  listArticles(request: PageRequest): Promise<PageResult<PublicArticle>>;
  findArticle(slug: string): Promise<PublicArticle | null>;
  findPage(slug: string): Promise<PublicManagedPage | null>;
}
