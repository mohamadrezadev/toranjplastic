import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminManagedPage, ManagedPageWriteInput } from './types.js';
export const ADMIN_MANAGED_PAGE_REPOSITORY = Symbol('ADMIN_MANAGED_PAGE_REPOSITORY');
export interface AdminManagedPageRepository { list(request: AdminListQuery): Promise<PageResult<AdminManagedPage>>; get(id: string): Promise<AdminManagedPage | null>; create(input: ManagedPageWriteInput): Promise<AdminManagedPage>; update(id: string, input: Partial<ManagedPageWriteInput>): Promise<AdminManagedPage | null>; setStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminManagedPage | null>; }
