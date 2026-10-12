import type {
  ContentImage,
  ContentSpecification,
} from '../../content-shared/stored-content.js';
import type {
  AdminLifecycle,
  AdminListQuery,
  AdminSeo,
} from '../shared/types.js';
export interface AdminProduct extends AdminLifecycle, AdminSeo {
  name: string;
  slug: string;
  summary: string | null;
  description: string | null;
  categoryId: string | null;
  images: ContentImage[];
  specifications: ContentSpecification[];
  featured: boolean;
}
export interface ProductWriteInput {
  name: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  categoryId?: string | null;
  images?: ContentImage[];
  specifications?: ContentSpecification[];
  featured?: boolean;
  displayOrder?: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
}
export interface AdminProductListQuery extends AdminListQuery {
  featured?: boolean;
}
