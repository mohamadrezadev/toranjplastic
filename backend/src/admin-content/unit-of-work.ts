import type { AuditEventWriter } from '../audit/audit.js';
import type { AdminArticleRepository } from './articles/repository.js';
import type { AdminCategoryRepository } from './categories/repository.js';
import type { AdminInjectionServiceRepository } from './injection-services/repository.js';
import type { AdminManagedPageRepository } from './managed-pages/repository.js';
import type { AdminMaterialRepository } from './materials/repository.js';
import type { AdminProductRepository } from './products/repository.js';

export const ADMIN_CONTENT_UNIT_OF_WORK = Symbol('ADMIN_CONTENT_UNIT_OF_WORK');

export interface AdminContentTransaction {
  categories: AdminCategoryRepository;
  products: AdminProductRepository;
  injectionServices: AdminInjectionServiceRepository;
  materials: AdminMaterialRepository;
  articles: AdminArticleRepository;
  managedPages: AdminManagedPageRepository;
  audit: AuditEventWriter;
}

export interface AdminContentUnitOfWork {
  run<T>(work: (transaction: AdminContentTransaction) => Promise<T>): Promise<T>;
}
