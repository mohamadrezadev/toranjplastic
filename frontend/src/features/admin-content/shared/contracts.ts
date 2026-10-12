export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface AdminListQuery {
  page?: number;
  pageSize?: number;
  status?: ContentStatus;
}

export interface AdminLifecycle {
  id: string;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  displayOrder: number;
}

export interface AdminSeo {
  metaTitle: string | null;
  metaDescription: string | null;
}
