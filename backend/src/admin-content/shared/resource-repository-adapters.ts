import type { AdminContentRepository } from '../admin-content.repository.js';
import type { AdminCategoryRepository } from '../categories/repository.js';
import type { AdminProductRepository } from '../products/repository.js';
import type { AdminInjectionServiceRepository } from '../injection-services/repository.js';
import type { AdminMaterialRepository } from '../materials/repository.js';
import type { AdminArticleRepository } from '../articles/repository.js';
import type { AdminManagedPageRepository } from '../managed-pages/repository.js';

export function resourceRepositories(repository: AdminContentRepository) {
  const categories: AdminCategoryRepository = {
    list: (request) => repository.listCategories(request), get: (id) => repository.getCategory(id),
    create: (input) => repository.createCategory(input), update: (id, input) => repository.updateCategory(id, input),
    setStatus: (id, status, publishedAt) => repository.setCategoryStatus(id, status, publishedAt),
  };
  const products: AdminProductRepository = {
    list: (request) => repository.listProducts(request), get: (id) => repository.getProduct(id),
    create: (input) => repository.createProduct(input), update: (id, input) => repository.updateProduct(id, input),
    setStatus: (id, status, publishedAt) => repository.setProductStatus(id, status, publishedAt),
  };
  const injectionServices: AdminInjectionServiceRepository = {
    list: (request) => repository.listInjectionServices(request), get: (id) => repository.getInjectionService(id),
    create: (input) => repository.createInjectionService(input), update: (id, input) => repository.updateInjectionService(id, input),
    setStatus: (id, status, publishedAt) => repository.setInjectionServiceStatus(id, status, publishedAt),
  };
  const materials: AdminMaterialRepository = {
    list: (request) => repository.listMaterials(request), get: (id) => repository.getMaterial(id),
    create: (input) => repository.createMaterial(input), update: (id, input) => repository.updateMaterial(id, input),
    setStatus: (id, status, publishedAt) => repository.setMaterialStatus(id, status, publishedAt),
  };
  const articles: AdminArticleRepository = {
    list: (request) => repository.listArticles(request), get: (id) => repository.getArticle(id),
    create: (input) => repository.createArticle(input), update: (id, input) => repository.updateArticle(id, input),
    setStatus: (id, status, publishedAt) => repository.setArticleStatus(id, status, publishedAt),
  };
  const managedPages: AdminManagedPageRepository = {
    list: (request) => repository.listManagedPages(request), get: (id) => repository.getManagedPage(id),
    create: (input) => repository.createManagedPage(input), update: (id, input) => repository.updateManagedPage(id, input),
    setStatus: (id, status, publishedAt) => repository.setManagedPageStatus(id, status, publishedAt),
  };
  return { categories, products, injectionServices, materials, articles, managedPages };
}
