import type { ContentStatus } from '../../generated/prisma/enums.js';
import type { AdminListQuery, PageResult } from '../shared/types.js';
import type { AdminInjectionService, InjectionServiceWriteInput } from './types.js';
export const ADMIN_INJECTION_SERVICE_REPOSITORY = Symbol('ADMIN_INJECTION_SERVICE_REPOSITORY');
export interface AdminInjectionServiceRepository { list(request: AdminListQuery): Promise<PageResult<AdminInjectionService>>; get(id: string): Promise<AdminInjectionService | null>; create(input: InjectionServiceWriteInput): Promise<AdminInjectionService>; update(id: string, input: Partial<InjectionServiceWriteInput>): Promise<AdminInjectionService | null>; setStatus(id: string, status: ContentStatus, publishedAt: Date | null): Promise<AdminInjectionService | null>; }
