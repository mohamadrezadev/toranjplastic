import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminMaterial, MaterialWriteInput } from './types.js';
export const ADMIN_MATERIAL_REPOSITORY = Symbol('ADMIN_MATERIAL_REPOSITORY');
export interface AdminMaterialRepository {
  list(request: AdminListQuery): Promise<PageResult<AdminMaterial>>;
  get(id: string): Promise<AdminMaterial | null>;
  create(input: MaterialWriteInput): Promise<AdminMaterial>;
  update(
    id: string,
    input: Partial<MaterialWriteInput>,
  ): Promise<AdminMaterial | null>;
  setStatus(
    id: string,
    status: ContentStatus,
    publishedAt: Date | null,
  ): Promise<AdminMaterial | null>;
}
