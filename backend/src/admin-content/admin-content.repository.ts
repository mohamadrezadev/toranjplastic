import type { AdminArticleRepository } from './articles/repository.js';
import type { AdminCategoryRepository } from './categories/repository.js';
import type { AdminInjectionServiceRepository } from './injection-services/repository.js';
import type { AdminManagedPageRepository } from './managed-pages/repository.js';
import type { AdminMaterialRepository } from './materials/repository.js';
import type { AdminProductRepository } from './products/repository.js';

export const ADMIN_CONTENT_REPOSITORY = Symbol('ADMIN_CONTENT_REPOSITORY');

type CategoryCompatibility = {
  listCategories: AdminCategoryRepository['list'];
  getCategory: AdminCategoryRepository['get'];
  createCategory: AdminCategoryRepository['create'];
  updateCategory: AdminCategoryRepository['update'];
  setCategoryStatus: AdminCategoryRepository['setStatus'];
};

type ProductCompatibility = {
  listProducts: AdminProductRepository['list'];
  getProduct: AdminProductRepository['get'];
  createProduct: AdminProductRepository['create'];
  updateProduct: AdminProductRepository['update'];
  setProductStatus: AdminProductRepository['setStatus'];
};

type InjectionServiceCompatibility = {
  listInjectionServices: AdminInjectionServiceRepository['list'];
  getInjectionService: AdminInjectionServiceRepository['get'];
  createInjectionService: AdminInjectionServiceRepository['create'];
  updateInjectionService: AdminInjectionServiceRepository['update'];
  setInjectionServiceStatus: AdminInjectionServiceRepository['setStatus'];
};

type MaterialCompatibility = {
  listMaterials: AdminMaterialRepository['list'];
  getMaterial: AdminMaterialRepository['get'];
  createMaterial: AdminMaterialRepository['create'];
  updateMaterial: AdminMaterialRepository['update'];
  setMaterialStatus: AdminMaterialRepository['setStatus'];
};

type ArticleCompatibility = {
  listArticles: AdminArticleRepository['list'];
  getArticle: AdminArticleRepository['get'];
  createArticle: AdminArticleRepository['create'];
  updateArticle: AdminArticleRepository['update'];
  setArticleStatus: AdminArticleRepository['setStatus'];
};

type ManagedPageCompatibility = {
  listManagedPages: AdminManagedPageRepository['list'];
  getManagedPage: AdminManagedPageRepository['get'];
  createManagedPage: AdminManagedPageRepository['create'];
  updateManagedPage: AdminManagedPageRepository['update'];
  setManagedPageStatus: AdminManagedPageRepository['setStatus'];
};

/** Temporary aggregate compatibility port; resource slices depend on the focused contracts above. */
export type AdminContentRepository = CategoryCompatibility
  & ProductCompatibility
  & InjectionServiceCompatibility
  & MaterialCompatibility
  & ArticleCompatibility
  & ManagedPageCompatibility;
