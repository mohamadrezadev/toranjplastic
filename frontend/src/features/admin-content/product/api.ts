import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminProduct } from './schema';
import type { AdminProductListQuery, ProductInput } from './types';

export function listProducts(query: AdminProductListQuery = {}) {
  const params = listQueryString(query);
  if (query.featured !== undefined) params.set('featured', String(query.featured));
  return adminRequest(`products?${params}`, isPage(isAdminProduct));
}
export const getProduct = (id: string) => adminRequest(`products/${encodeURIComponent(id)}`, isAdminProduct);
export const createProduct = (input: ProductInput) => adminMutate('products', 'POST', input, isAdminProduct);
export const updateProduct = (id: string, input: Partial<ProductInput>) => adminMutate(`products/${encodeURIComponent(id)}`, 'PATCH', input, isAdminProduct);
export const publishProduct = (id: string) => adminMutate(`products/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminProduct);
export const archiveProduct = (id: string) => adminMutate(`products/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminProduct);
