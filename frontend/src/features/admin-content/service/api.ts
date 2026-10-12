import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminInjectionService } from './schema';
import type { InjectionServiceInput } from './types';
import type { AdminListQuery } from '../shared/contracts';

export const listInjectionServices = (query: AdminListQuery = {}) => adminRequest(`services?${listQueryString(query)}`, isPage(isAdminInjectionService));
export const getInjectionService = (id: string) => adminRequest(`services/${encodeURIComponent(id)}`, isAdminInjectionService);
export const createInjectionService = (input: InjectionServiceInput) => adminMutate('services', 'POST', input, isAdminInjectionService);
export const updateInjectionService = (id: string, input: Partial<InjectionServiceInput>) => adminMutate(`services/${encodeURIComponent(id)}`, 'PATCH', input, isAdminInjectionService);
export const publishInjectionService = (id: string) => adminMutate(`services/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminInjectionService);
export const archiveInjectionService = (id: string) => adminMutate(`services/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminInjectionService);
