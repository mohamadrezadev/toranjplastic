import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminCategory } from './schema';
import type { AdminListQuery } from '../shared/contracts';
import type { CategoryInput } from './types';

export const listCategories = (query: AdminListQuery = {}) => adminRequest(`categories?${listQueryString(query)}`, isPage(isAdminCategory));
export const getCategory = (id: string) => adminRequest(`categories/${encodeURIComponent(id)}`, isAdminCategory);
export const createCategory = (input: CategoryInput) => adminMutate('categories', 'POST', input, isAdminCategory);
export const updateCategory = (id: string, input: Partial<CategoryInput>) => adminMutate(`categories/${encodeURIComponent(id)}`, 'PATCH', input, isAdminCategory);
export const publishCategory = (id: string) => adminMutate(`categories/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminCategory);
export const archiveCategory = (id: string) => adminMutate(`categories/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminCategory);
