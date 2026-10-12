import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminManagedPage } from './schema';
import type { ManagedPageInput } from './types';
import type { AdminListQuery } from '../shared/contracts';

export const listManagedPages = (query: AdminListQuery = {}) => adminRequest(`pages?${listQueryString(query)}`, isPage(isAdminManagedPage));
export const getManagedPage = (id: string) => adminRequest(`pages/${encodeURIComponent(id)}`, isAdminManagedPage);
export const createManagedPage = (input: ManagedPageInput) => adminMutate('pages', 'POST', input, isAdminManagedPage);
export const updateManagedPage = (id: string, input: Partial<ManagedPageInput>) => adminMutate(`pages/${encodeURIComponent(id)}`, 'PATCH', input, isAdminManagedPage);
export const publishManagedPage = (id: string) => adminMutate(`pages/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminManagedPage);
export const archiveManagedPage = (id: string) => adminMutate(`pages/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminManagedPage);
