import { adminMutate, adminRequest, isPage, listQueryString } from '../shared/client';
import { isAdminMaterial } from './schema';
import type { MaterialInput } from './types';
import type { AdminListQuery } from '../shared/contracts';

export const listMaterials = (query: AdminListQuery = {}) => adminRequest(`materials?${listQueryString(query)}`, isPage(isAdminMaterial));
export const getMaterial = (id: string) => adminRequest(`materials/${encodeURIComponent(id)}`, isAdminMaterial);
export const createMaterial = (input: MaterialInput) => adminMutate('materials', 'POST', input, isAdminMaterial);
export const updateMaterial = (id: string, input: Partial<MaterialInput>) => adminMutate(`materials/${encodeURIComponent(id)}`, 'PATCH', input, isAdminMaterial);
export const publishMaterial = (id: string) => adminMutate(`materials/${encodeURIComponent(id)}/publish`, 'POST', {}, isAdminMaterial);
export const archiveMaterial = (id: string) => adminMutate(`materials/${encodeURIComponent(id)}/archive`, 'POST', {}, isAdminMaterial);
