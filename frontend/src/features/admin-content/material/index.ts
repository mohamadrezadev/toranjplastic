export { AdminContentError } from '../shared/errors';
export { archiveMaterial, createMaterial, getMaterial, listMaterials, publishMaterial, updateMaterial } from './api';
export type { AdminMaterial, MaterialInput } from './types';
export type { AdminListQuery, ContentStatus, PageResult } from '../shared/contracts';
export { archiveMaterialAction, createMaterialAction, publishMaterialAction, updateMaterialAction } from './actions';
export { materialInputFromForm } from './form-mapping';
