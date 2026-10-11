import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminCategory, CategoryWriteInput } from './types.js';
export const ADMIN_CATEGORY_REPOSITORY = Symbol('ADMIN_CATEGORY_REPOSITORY');
export interface AdminCategoryRepository { list(request: AdminListQuery): Promise<PageResult<AdminCategory>>; get(id: string): Promise<AdminCategory | null>; create(input: CategoryWriteInput): Promise<AdminCategory>; update(id: string, input: Partial<CategoryWriteInput>): Promise<AdminCategory | null>; setStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminCategory | null>; }
