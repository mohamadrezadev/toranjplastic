import type { ContentStatus } from '../generated/prisma/enums.js';
import type { PublicImage, PublicSpecification } from '../content/content.types.js';

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface PageResult<T> {
  items: T[];
  pageInfo: { page: number; pageSize: number; total: number; totalPages: number };
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

export interface AdminCategory extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  description: string | null;
  image: PublicImage | null;
}

export interface AdminProduct extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  images: PublicImage[];
  specifications: PublicSpecification[];
  featured: boolean;
}

export interface CategoryWriteInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: PublicImage | null;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface ProductWriteInput {
  name: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  categoryId?: string | null;
  images?: PublicImage[];
  specifications?: PublicSpecification[];
  featured?: boolean;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface AdminListQuery extends PageRequest {
  status?: ContentStatus;
}

export interface AdminProductListQuery extends AdminListQuery {
  featured?: boolean;
}
