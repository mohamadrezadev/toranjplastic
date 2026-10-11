import type { ContentStatus } from '../../generated/prisma/enums.js';

export interface PageRequest { page: number; pageSize: number; }
export interface PageResult<T> { items: T[]; pageInfo: { page: number; pageSize: number; total: number; totalPages: number }; }
export interface AdminLifecycle { id: string; status: ContentStatus; publishedAt: string | null; createdAt: string; updatedAt: string; displayOrder: number; }
export interface AdminSeo { metaTitle: string | null; metaDescription: string | null; }
export interface AdminListQuery extends PageRequest { status?: ContentStatus; }
